"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Settings,
  Send,
  Plus,
  Paperclip,
  Loader2,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";
import Image from "next/image";
import {
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  Avatar,
  ScrollArea,
} from "@woothomes/components";
import { useSearchParams } from "next/navigation";
import {
  useConversations,
  useGetUserConversations,
  useSendMessage,
  useSwaggerConversations,
  useConversationMessages,
  useSendConversationMessage,
} from "@woothomes/hooks";
import { useProperty } from "@woothomes/hooks/useProperties";
import { useAuthStore } from "../../../store/auth/auth";
import { formatDistanceToNow } from "date-fns";
// import { toast } from "sonner";

// Removed unused interface - using ExtendedSwaggerMessage instead

interface ExtendedSwaggerMessage {
  id: string;
  conversation_id?: string;
  sender_id?: string;
  content: string;
  type?: 'text' | 'system' | 'offer' | 'booking';
  message_type?: 'text' | 'system' | 'offer' | 'booking';
  read_at: string | null;
  created_at: string;
  updated_at?: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  is_from_me?: boolean;
  attachments?: unknown[];
  parent?: unknown;
  status?: string;
  is_edited?: boolean;
  edited_at?: string | null;
  metadata?: Record<string, unknown>;
  isSending?: boolean;
  isSent?: boolean;
  isError?: boolean;
  isTemp?: boolean;
}

function getInitials(name: string) {
  if (!name) return "";
  const names = name.split(" ");
  return names
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [useSwaggerAPI, setUseSwaggerAPI] = useState(true); // Toggle between old and new API
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Legacy hooks
  const { data: conversations = [], isLoading, isError } = useConversations();

  // New Swagger-based hooks
  const { data: swaggerConversations = [], isLoading: swaggerLoading, isError: swaggerError, refetch: refetchConversations } = useSwaggerConversations();
  const { data: conversationMessages, isLoading: messagesLoading } = useConversationMessages(
    selectedConversation || "",
    undefined, // since parameter (optional)
    50, // limit
    "DESC" // sortOrder
  );

  const searchParams = useSearchParams();
  const propertyId = searchParams?.get("property_id");
  const receiverId = searchParams?.get("receiver_id");
  const conversationId = searchParams?.get("conversation_id");
  const { user } = useAuthStore();

  const { data: property, isLoading: propertyLoading } = useProperty(
    propertyId as string,
    "/properties"
  );

  // Legacy send message hook
  const createOrFetchConversation = useSendMessage(
    selectedConversation as string
  );

  // New Swagger-based hooks
  const sendConversationMessage = useSendConversationMessage(selectedConversation || "");
  // Removed unused hooks: createConversation, markMessageAsRead, markConversationAsRead

  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  const [tempMessages, setTempMessages] = useState<ExtendedSwaggerMessage[]>([]);

  // Refetch conversations when conversation_id is provided (for newly created conversations)
  useEffect(() => {
    if (conversationId && useSwaggerAPI) {
      refetchConversations();
    }
  }, [conversationId, useSwaggerAPI, refetchConversations]);

  useEffect(() => {
    if (useSwaggerAPI) {
      // Handle direct conversation ID from URL (highest priority)
      if (conversationId) {
        const directConversation = swaggerConversations.find(c => c.id === conversationId);
        if (directConversation) {
          setSelectedConversation(directConversation.id);
          setCurrentUserId(directConversation.other_user.id);
          return;
        } else if (!swaggerLoading) {
          // If conversation not found and not loading, try refetching once more
          refetchConversations();
        }
      }

      // Handle Swagger conversation selection by property and user
      if (propertyId && receiverId) {
        const matchingConversation = swaggerConversations.find(
          (c) => c.property.id === propertyId &&
            c.other_user.id === receiverId
        );

        if (matchingConversation) {
          setSelectedConversation(matchingConversation.id);
          setCurrentUserId(matchingConversation.other_user.id);
        }
      }
    } else {
      // Legacy conversation selection logic
      if (!propertyId || propertyLoading) {
        setSelectedConversation(null);
        return;
      }

      const matchingConversation = conversations.find(
        (c) =>
          c.property.id === propertyId &&
          (!receiverId || c.other_user.id === receiverId)
      );

      if (matchingConversation) {
        setSelectedConversation(matchingConversation.property.id);
        setCurrentUserId(matchingConversation.other_user.id);
      } else if (property) {
        setSelectedConversation(null);
      }
    }
  }, [propertyId, receiverId, conversationId, property, conversations, swaggerConversations, propertyLoading, useSwaggerAPI, user?.id, refetchConversations, swaggerLoading]);

  const {
    data: currentConversations = [],
    isLoading: isLoadingCurrentConversation,
    refetch: refetchCurrentConversation,
  } = useGetUserConversations(selectedConversation as string, currentUserId);

  const handleSelectConversation = (conversationId: string, userId: string) => {
    setSelectedConversation(conversationId);
    setCurrentUserId(userId);
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() === "") return;

    // Store message content and clear input immediately
    const messageContent = messageInput;
    setMessageInput("");

    if (useSwaggerAPI && selectedConversation) {
      // Create and add temp message immediately with a guaranteed unique ID
      const tempMessage: ExtendedSwaggerMessage = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversation_id: selectedConversation,
        content: messageContent,
        sender_id: user?.id || "",
        message_type: 'text',
        read_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: user?.id || "",
          name: user?.name || "",
          avatar: user?.avatar || "",
        },
        isSending: true,
        isTemp: true,
      };

      // Add message to chat immediately and scroll to it
      setTempMessages((prev) => [...prev, tempMessage]);

      // Scroll to bottom when sending a message (always scroll for sent messages)
      requestAnimationFrame(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      });

      // Send message using new Swagger API
      try {
        await sendConversationMessage.mutateAsync({
          content: messageContent,
          message_type: 'text',
        });

        // Update message status to sent
        setTempMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...msg, isSending: false, isSent: true }
              : msg
          )
        );

        // After a short delay, remove temp message (messages will be refreshed automatically)
        setTimeout(() => {
          setTempMessages((prev) =>
            prev.filter((msg) => msg.id !== tempMessage.id)
          );
        }, 1000);
      } catch (err) {
        console.error("Failed to send message", err);
        // Update message to show error state
        setTempMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...msg, isSending: false, isError: true }
              : msg
          )
        );
      }
    } else {
      // Legacy API handling
      const tempMessage: ExtendedSwaggerMessage = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversation_id: selectedConversation || "",
        content: messageContent,
        sender_id: user?.id || "",
        message_type: 'text',
        read_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: user?.id || "",
          name: user?.name || "",
          avatar: user?.avatar || "",
        },
        isSending: true,
        isTemp: true,
      };

      // Add message to chat immediately and scroll to it
      setTempMessages((prev) => [...prev, tempMessage]);

      // Scroll to bottom when sending a message (always scroll for sent messages)
      requestAnimationFrame(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      });

      // Send message using legacy API
      createOrFetchConversation
        .mutateAsync({
          property_id: selectedConversation as string,
          receiver_id: currentUserId as string,
          content: messageContent,
        })
        .then(() => {
          // Update message status to sent
          setTempMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessage.id
                ? { ...msg, isSending: false, isSent: true }
                : msg
            )
          );

          // After a short delay, remove temp message and refresh
          setTimeout(() => {
            setTempMessages((prev) =>
              prev.filter((msg) => msg.id !== tempMessage.id)
            );
            refetchCurrentConversation();
          }, 1000);
        })
        .catch((err) => {
          console.error("Failed to send message", err);
          // Update message to show error state
          setTempMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessage.id
                ? { ...msg, isSending: false, isError: true }
                : msg
            )
          );
        });
    }
  };

  const handleRetryMessage = async (message: ExtendedSwaggerMessage) => {
    try {
      // Update message back to sending state
      setTempMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? { ...msg, isSending: true, isError: false }
            : msg
        )
      );

      await createOrFetchConversation.mutateAsync({
        property_id: selectedConversation as string,
        receiver_id: currentUserId as string,
        content: message.content,
      });

      // Update message to show as sent
      setTempMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? { ...msg, isSending: false, isSent: true }
            : msg
        )
      );

      // After a short delay, remove the temp message and refresh the conversation
      setTimeout(() => {
        setTempMessages((prev) => prev.filter((msg) => msg.id !== message.id));
        refetchCurrentConversation();
      }, 1000);
    } catch (err) {
      console.error("Failed to retry message", err);
      // Update message to show error state again
      setTempMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? { ...msg, isSending: false, isError: true }
            : msg
        )
      );
      console.error("Failed to send message. Please try again later.");
    }
  };

  // Add window resize listener for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add typing indicator effect
  useEffect(() => {
    if (messageInput.trim()) {
      setIsTyping(true);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      setTypingTimeout(timeout);
    } else {
      setIsTyping(false);
    }
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [messageInput, typingTimeout]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id");
            if (messageId) {
              setReadMessages((prev) => new Set([...prev, messageId]));
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const messageElements = document.querySelectorAll("[data-message-id]");
    messageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [currentConversations]);

  // In the render section:
  const realMessages = useSwaggerAPI
    ? (conversationMessages?.data || [])
    : (Array.isArray(currentConversations) ? currentConversations : []);


  // Convert messages to ExtendedSwaggerMessage format for consistent rendering
  const normalizedMessages: ExtendedSwaggerMessage[] = useSwaggerAPI
    ? realMessages.map((msg: unknown) => {
        const message = msg as Record<string, unknown>;
        const sender = message.sender as Record<string, unknown> || {};
        return {
          id: String(message.id || ''),
          conversation_id: selectedConversation || "",
          sender_id: String(sender.id || ""),
          content: String(message.content || ''),
          type: message.type as 'text' | 'system' | 'offer' | 'booking' | undefined,
          message_type: message.type as 'text' | 'system' | 'offer' | 'booking' | undefined,
          read_at: message.read_at as string | null,
          created_at: String(message.created_at || ''),
          updated_at: String(message.created_at || ''),
          sender: {
            id: String(sender.id || ""),
            name: String(sender.name || "Unknown"),
            avatar: sender.avatar as string | null,
          },
          is_from_me: Boolean(message.is_from_me),
          attachments: Array.isArray(message.attachments) ? message.attachments : [],
          parent: message.parent,
          status: String(message.status || ''),
          is_edited: Boolean(message.is_edited),
          edited_at: message.edited_at as string | null,
          metadata: {},
        };
      })
    : realMessages.map((msg: unknown) => {
        const message = msg as Record<string, unknown>;
        const sender = message.sender as Record<string, unknown> || {};
        return {
          id: String(message.id || ''),
          conversation_id: selectedConversation || "",
          sender_id: String(message.sender_id || ''),
          content: String(message.content || ''),
          message_type: 'text' as const,
          read_at: message.read_at as string | null,
          created_at: String(message.created_at || ''),
          updated_at: String(message.updated_at || message.created_at || ''),
          sender: {
            id: String(sender.id || message.sender_id || ''),
            name: String(sender.name || "Unknown"),
            avatar: sender.avatar as string | null,
          },
          metadata: {},
        };
      });

  // Combine messages, ensuring temp messages are included at the end
  const allMessages = [...(useSwaggerAPI ? normalizedMessages : normalizedMessages.slice().reverse()), ...tempMessages];

  return (
  <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${isMobileView && selectedConversation ? "hidden" : "block"}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 pr-10 py-2 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1"
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <Settings className="h-4 w-4 text-gray-500" />
            </Button>
          </div>

          {/* Settings Dropdown */}
          {settingsOpen && (
            <div className="absolute mt-2 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 right-4">
              <h3 className="font-medium mb-3 text-gray-900">Settings</h3>
              <div className="flex items-center mb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSwaggerAPI}
                    onChange={(e) => setUseSwaggerAPI(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Use New Messaging API</span>
                </label>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-gray-100">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
              <TabsTrigger value="archived" className="text-xs">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            
            {(useSwaggerAPI ? swaggerLoading : isLoading) ? (
              <Loader2 className="mx-auto my-auto animate-spin h-6 w-6 text-blue-600" />
            ) : (useSwaggerAPI ? swaggerError : isError) ? (
              <p className="p-4 text-red-500">Failed to load conversations</p>
            ) : useSwaggerAPI ? (
              // Render Swagger conversations
                (Array.isArray(swaggerConversations) ? swaggerConversations : []).map((conversation) => {
                  const otherUser = conversation.other_user;
                  if (!otherUser) return null;
                return (
                  <div
                    key={conversation.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${selectedConversation === conversation.id
                      ? "bg-blue-50 border-r-2 border-blue-500"
                      : ""}`}
                    onClick={() => handleSelectConversation(
                      conversation.id,
                      otherUser.id
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                          {otherUser.avatar ? (
                            <Image
                              src={otherUser.avatar}
                              alt={otherUser.name}
                              width={48}
                              height={48}
                              className="object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-white bg-blue-500 w-full h-full flex items-center justify-center rounded-full">
                              {getInitials(otherUser.name)}
                            </span>
                          )}
                        </Avatar>
                        {(conversation.unread_count || 0) > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                            {conversation.unread_count || 0}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {otherUser.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {conversation.property?.title || 'Property'}
                            </p>
                            {conversation.last_message && (
                              <p className="text-xs text-gray-400 truncate mt-1">
                                {conversation.last_message.content}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end ml-2">
                            <span className="text-xs text-gray-400">
                              {conversation.last_message_at ? formatDistanceToNow(
                                new Date(conversation.last_message_at!),
                                {
                                  addSuffix: true,
                                }
                              ) : 'Just now'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Legacy conversation rendering
              conversations
                .filter(
                  (conversation, index, self) => index ===
                    self.findIndex(
                      (c) => c.property.id === conversation.property.id &&
                        c.other_user.id === conversation.other_user.id
                    )
                )
                .map((conversation) => {
                  const otherUser = conversation.other_user;
                  return (
                    <div
                      key={conversation.property.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedConversation === conversation.property.id
                        ? "bg-blue-50"
                        : ""}`}
                      onClick={() => handleSelectConversation(
                        conversation.property.id,
                        otherUser.id
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                          {otherUser.avatar ? (
                            <Image
                              src={otherUser.avatar}
                              alt={otherUser.name}
                              width={40}
                              height={40}
                              className="object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-white bg-blue-500 w-full h-full flex items-center justify-center rounded-full">
                              {getInitials(otherUser.name)}
                            </span>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <div>
                              <p className="font-medium text-sm truncate">
                                {otherUser.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.property.title}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(conversation.last_message_at),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
            
            {/* No conversations fallback */}
            {useSwaggerAPI && Array.isArray(swaggerConversations) && swaggerConversations.length === 0 && !swaggerLoading && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a conversation from a property page</p>
              </div>
            )}
            
            {!useSwaggerAPI && Array.isArray(conversations) && conversations.length === 0 && !isLoading && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a conversation from a property page</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Message Area */}
      <div className={`flex-1 bg-white flex flex-col ${isMobileView && !selectedConversation ? "hidden" : "flex"}`}>
        {isMobileView && selectedConversation && (
          <div className="p-4 border-b bg-white flex items-center">
            <button
              onClick={() => setSelectedConversation(null)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Back to Conversations</h2>
          </div>
        )}
        {selectedConversation ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Message Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  {(() => {
                    if (useSwaggerAPI) {
                      const conversationData = swaggerConversations.find(c => c.id === selectedConversation);
                      const otherUser = conversationData?.other_user;

                      return otherUser?.avatar ? (
                        <Image
                          src={otherUser?.avatar || ""}
                          alt={otherUser?.name || ""}
                          width={32}
                          height={32}
                          className="object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-white bg-blue-500 w-full h-full flex items-center justify-center rounded-full">
                          {getInitials(otherUser?.name || "")}
                        </span>
                      );
                    } else {
                      const conversationData = conversations.find(c => c.property.id === selectedConversation);
                      const otherUser = conversationData?.other_user;

                      return otherUser?.avatar ? (
                        <Image
                          src={otherUser?.avatar || ""}
                          alt={otherUser?.name || ""}
                          width={32}
                          height={32}
                          className="object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-white bg-blue-500 w-full h-full flex items-center justify-center rounded-full">
                          {getInitials(otherUser?.name || "")}
                        </span>
                      );
                    }
                  })()}
                </Avatar>
                <div>
                  <span className="font-medium truncate max-w-[200px] md:max-w-md block">
                    {(() => {
                      if (useSwaggerAPI) {
                        const conversationData = swaggerConversations.find(c => c.id === selectedConversation);
                        return conversationData?.other_user?.name;
                      } else {
                        const conversationData = conversations.find(c => c.property.id === selectedConversation);
                        return conversationData?.other_user?.name;
                      }
                    })()}
                  </span>
                  <span className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-md block">
                    {(() => {
                      if (useSwaggerAPI) {
                        const conversationData = swaggerConversations.find(c => c.id === selectedConversation);
                        return conversationData?.property?.title;
                      } else {
                        const conversationData = conversations.find(c => c.property.id === selectedConversation);
                        return conversationData?.property?.title;
                      }
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollAreaRef}
              className="flex-1 p-4 overflow-y-auto overflow-x-hidden min-h-0"
            >
              <div className="space-y-4">
                {(useSwaggerAPI ? messagesLoading : isLoadingCurrentConversation) ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="mx-auto my-auto animate-spin h-6 w-6 text-blue-600" />
                  </div>
                ) : (
                  <>
                    {allMessages.length > 0 ? (
                      <>
                        {allMessages.map((message: ExtendedSwaggerMessage) => (
                          <div
                            key={`${message.id}-${message.created_at}`}
                            data-message-id={message.id}
                            className={`flex ${message?.sender_id === user?.id
                              ? "justify-end"
                              : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] md:max-w-md px-4 py-2 rounded-lg ${message.sender_id === user?.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-800"}`}
                            >
                              <p className="break-words">{message.content}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <p
                                  className={`text-xs ${message?.sender_id === user?.id
                                    ? "text-blue-100"
                                    : "text-gray-500"}`}
                                >
                                  {new Date(
                                    message.created_at
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {message.sender_id === user?.id && (
                                  <span className="text-blue-100">
                                    {message.isSending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : message.isError ? (
                                      <button
                                        onClick={() => handleRetryMessage(message)}
                                        className="text-red-300 hover:text-red-200 transition-colors"
                                        title="Failed to send - Click to retry"
                                      >
                                        !
                                      </button>
                                    ) : message.isSent ? (
                                      <Check className="h-3 w-3" />
                                    ) : readMessages.has(message.id) ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                              <div className="flex space-x-1">
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms" }} />
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "150ms" }} />
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "300ms" }} />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <p className="text-center text-gray-400 mt-4">
                        No messages yet.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t flex items-center space-x-2 bg-white flex-shrink-0">
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <Plus className="h-5 w-5 text-gray-500" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                } }
                className="flex-1" />
              <Button
                variant="default"
                onClick={handleSendMessage}
                disabled={messageInput.trim() === ""}
                className="ml-2"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>)
          :
        (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
