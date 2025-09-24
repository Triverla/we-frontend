import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { axiosBase } from "@woothomes/lib";

export interface MessagePayload {
  receiver_id: string;
  content: string;
  property_id: string;
  booking_id?: string;
}

export interface MessageResponse {
  id: string;
  property_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  booking_id: string;
  is_template: boolean;
  template_type: string;
  read_at: string;
  created_at: string;
  updated_at: string;
  sender: User;
  receiver: User;
  property: Property;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  permissions: string[];
  email_verified: boolean;
  phone_verified: boolean;
  avatar: string;
  social_type: string;
}

export interface ConversationMessage {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  read_at: string | null;
  is_template: boolean;
  template_type: string | null;
  parent_message_id: string | null;
  booking_id: string | null;
  property_id: string;
  sender_id: string;
  receiver_id: string;
  sender: User;
  receiver: User;
}

export interface Property {
  id: string;
  title: string;
  description: string;
}

export interface UnreadMessageCountResponse {
  count: number;
}

export interface Conversation {
  property: {
    id: string;
    title: string;
    image: string;
  };
  other_user: {
    id: string;
    name: string;
    avatar: string;
  };
  last_message_at: string;
}

// New Swagger-based conversation types
export interface SwaggerConversation {
  id: string;
  title: string;
  status: string;
  property: {
    id: string;
    title: string;
    image: string;
  };
  other_user: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
  last_message: {
    id: string;
    content: string;
    type: string;
    created_at: string;
    sender_name: string;
    is_from_me: boolean;
  };
  unread_count: number;
  last_message_at: string;
  created_at: string;
}

export interface SwaggerMessage {
  id: string;
  content: string;
  type: 'text' | 'system' | 'offer' | 'booking';
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  is_from_me: boolean;
  attachments: unknown[];
  parent: unknown;
  status: string;
  is_edited: boolean;
  created_at: string;
  read_at: string | null;
  edited_at: string | null;
}

export interface ConversationCreatePayload {
  property_id: string;
  recipient_id: string;
  content: string;
  booking_id?: string;
  message_type?: 'text' | 'system' | 'offer' | 'booking';
}

export interface MessageCreatePayload {
  content: string;
  message_type?: 'text' | 'system' | 'offer' | 'booking';
  metadata?: Record<string, unknown>;
}

/**
 * 📨 Send a message to a user regarding a property and booking
 */
export function useSendMessage(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MessagePayload): Promise<MessageResponse> => {
      const response = await axiosBase.post<{ data: MessageResponse }>(
        `/properties/${propertyId}/messages`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    },
  });
}

/**
 * 📬 Get the total number of unread messages
 */
export function useUnreadMessageCount(): UseQueryResult<UnreadMessageCountResponse> {
  return useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: async () => {
      const response = await axiosBase.get<{
        data: UnreadMessageCountResponse;
      }>("/messages/unread-count");
      return response.data.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * 💬 Get the list of user conversations
 */
export function useConversations(): UseQueryResult<Conversation[]> {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await axiosBase.get<{ data: Conversation[] }>(
        "/messages/conversations"
      );
      return response.data.data;
    },
  });
}

/**
 * ✅ Mark a specific message as read
 */
export function useMarkMessageAsRead(propertyId: string, messageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<MessageResponse> => {
      const response = await axiosBase.put<{ data: MessageResponse }>(
        `/properties/${propertyId}/messages/${messageId}/read`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    },
  });
}

export function useGetUserConversations(
  propertyId: string,
  userId: string
): UseQueryResult<ConversationMessage[]> {
  return useQuery({
    queryKey: [`${propertyId}-user-${userId}-conversations`],
    queryFn: async (): Promise<ConversationMessage[]> => {
      const response = await axiosBase.get<{ data: MessageResponse[] }>(
        `/properties/${propertyId}/messages/conversation/${userId}`
      );
      // Convert MessageResponse[] to ConversationMessage[]
      return response.data.data.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        read_at: msg.read_at,
        is_template: msg.is_template,
        template_type: msg.template_type,
        parent_message_id: null,
        booking_id: msg.booking_id,
        property_id: msg.property_id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        sender: msg.sender,
        receiver: msg.receiver
      }));
    },
    enabled: !!propertyId && !!userId,
    refetchInterval: 30000,
  });
}

export function useMarkAllMessagesAsRead(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<MessageResponse> => {
      const response = await axiosBase.put<{ data: MessageResponse }>(
        `/properties/${propertyId}/messages/read-all`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    },
  });
}

// ===== NEW SWAGGER-BASED CONVERSATION ENDPOINTS =====

/**
 * 💬 Get all conversations for the current user (Swagger API)
 */
export function useSwaggerConversations(): UseQueryResult<SwaggerConversation[]> {
  return useQuery({
    queryKey: ["swagger-conversations"],
    queryFn: async () => {
      try {
        const response = await axiosBase.get<{ data: { conversations: SwaggerConversation[] } }>(
          "/conversations"
        );
        
        const conversations = Array.isArray(response?.data?.data?.conversations) ? response?.data?.data?.conversations : [];
        return conversations;
      } catch (error: unknown) {
        console.error("❌ Failed to fetch conversations:", error);
        const axiosError = error as { response?: { data: unknown; status: number } };
        if (axiosError?.response) {
          console.error("📄 Error response:", axiosError.response.data);
          console.error("🔢 Error status:", axiosError.response.status);
        }
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * 🔍 Get a specific conversation by ID (Swagger API)
 */
export function useSwaggerConversation(conversationId: string): UseQueryResult<SwaggerConversation> {
  return useQuery({
    queryKey: ["swagger-conversation", conversationId],
    queryFn: async () => {
      const response = await axiosBase.get<{ data: SwaggerConversation }>(
        `/conversations/${conversationId}`
      );
      return response.data.data;
    },
    enabled: !!conversationId,
  });
}

/**
 * 📨 Create a new conversation (Swagger API)
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConversationCreatePayload): Promise<SwaggerConversation> => {
      const response = await axiosBase.post<{ data: SwaggerConversation }>(
        "/conversations",
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swagger-conversations"] });
    },
  });
}

/**
 * 💬 Get messages in a conversation (Swagger API)
 */
export function useConversationMessages(
  conversationId: string,
  since?: number,
  limit = 25,
  sortOrder: "ASC" | "DESC" | "BOTH" = "DESC"
): UseQueryResult<{
  data: SwaggerMessage[];
  conversation?: SwaggerConversation;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
  };
}> {
  return useQuery({
    queryKey: ["conversation-messages", conversationId, since, limit, sortOrder],
    queryFn: async () => {
      try {
        const params: { limit: number; sortOrder: string; since?: number } = { limit, sortOrder };
        if (since) {
          params.since = since;
        }
        
        const response = await axiosBase.get<{
          success: boolean;
          message: string;
          data: {
            conversation: SwaggerConversation;
            messages: SwaggerMessage[];
            pagination: {
              current_page: number;
              per_page: number;
              total: number;
              last_page: number;
              has_more_pages: boolean;
            };
          };
        }>(`/conversations/${conversationId}`, { params });
        
        return {
          data: Array.isArray(response.data.data.messages) ? response.data.data.messages : [],
          conversation: response.data.data.conversation,
          pagination: response.data.data.pagination || {
            current_page: 1,
            last_page: 1,
            per_page: limit,
            total: 0,
            has_more_pages: false,
          },
        };
      } catch (error: unknown) {
        console.error("❌ Failed to fetch conversation messages:", error);
        const axiosError = error as { response?: { data: unknown; status: number } };
        if (axiosError?.response) {
          console.error("📄 Messages error response:", axiosError.response.data);
          console.error("🔢 Messages error status:", axiosError.response.status);
        }
        return {
          data: [],
          conversation: undefined,
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: limit,
            total: 0,
            has_more_pages: false,
          },
        };
      }
    },
    enabled: !!conversationId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * 📤 Send a message to a conversation (Swagger API)
 */
export function useSendConversationMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MessageCreatePayload): Promise<SwaggerMessage> => {
      const response = await axiosBase.post<{ data: SwaggerMessage }>(
        `/conversations/${conversationId}/messages`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["swagger-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["swagger-conversation", conversationId] });
    },
  });
}

/**
 * ✅ Mark a message as read (Swagger API)
 */
export function useMarkSwaggerMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string): Promise<SwaggerMessage> => {
      const response = await axiosBase.put<{ data: SwaggerMessage }>(
        `/messages/${messageId}/read`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
      queryClient.invalidateQueries({ queryKey: ["swagger-conversations"] });
    },
  });
}

/**
 * ✅ Mark entire conversation as read (Swagger API)
 */
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string): Promise<SwaggerConversation> => {
      const response = await axiosBase.put<{ data: SwaggerConversation }>(
        `/conversations/${conversationId}/read`
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", data.id] });
      queryClient.invalidateQueries({ queryKey: ["swagger-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["swagger-conversation", data.id] });
    },
  });
}

/**
 * 🗑️ Delete a message (Swagger API)
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string): Promise<void> => {
      await axiosBase.delete(`/messages/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation-messages"] });
      queryClient.invalidateQueries({ queryKey: ["swagger-conversations"] });
    },
  });
}
