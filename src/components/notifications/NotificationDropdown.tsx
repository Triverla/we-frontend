"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Home, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Info,
  MessageCircle,
  Star,
  Clock,
  AlertTriangle 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@woothomes/components";
import { axiosBase } from "@woothomes/lib";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NotificationData {
  booking_id?: string;
  property_id?: string;
  property_title?: string;
  type: string;
  message: string;
  check_in?: string;
  check_out?: string;
  total_price?: number;
  user_id?: string;
  host_id?: string | null;
  action_url?: string;
  image_url?: string;
  guest_name?: string;
  proposed_price?: number;
  sender_name?: string;
  content?: string;
  reason?: string;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  is_read: boolean;
  action_url: string;
  image_url: string | null;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      path: string;
      per_page: number;
      to: number;
      total: number;
      has_more_pages: boolean;
    }
  }
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Initial fetch of notifications count
  useEffect(() => {
    // Check if the user is authenticated before fetching
    if (typeof window !== 'undefined' && localStorage.getItem('auth-storage')) {
      fetchNotifications();
    }
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Calculate unread count
  useEffect(() => {
    if (notifications.length > 0) {
      const count = notifications.filter(n => !n.is_read).length;
      setUnreadCount(count);
      console.log('Updated unread count:', count);
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axiosBase.get<NotificationResponse>('/notifications?per_page=15');
      console.log('Notification API response:', response.data);
      if (response.data.success) {
        const newNotifications = response.data.data.notifications;
        setNotifications(newNotifications);
        
        // Calculate unread count immediately
        const count = newNotifications.filter(n => !n.is_read).length;
        setUnreadCount(count);
        console.log('Unread count from API:', count);
      } else {
        console.error('Failed to fetch notifications: API returned success=false');
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Don't reset notifications array on error to keep existing ones if any
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axiosBase.post('/notifications/mark-read', {
        notification_ids: [notificationId]
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() } 
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate to the action URL if available
    if (notification.action_url) {
      router.push(notification.action_url);
    }
    
    // Close the popover
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle2 size={18} className="text-green-500" />;
      case 'booking_request':
        return <Calendar size={18} className="text-blue-500" />;
      case 'payment_successful':
        return <CreditCard size={18} className="text-purple-500" />;
      case 'booking_cancelled':
        return <AlertTriangle size={18} className="text-red-500" />;
      case 'new_message':
        return <MessageCircle size={18} className="text-indigo-500" />;
      case 'chat':
        return <MessageCircle size={18} className="text-blue-600" />;
      case 'offer_received':
        return <CreditCard size={18} className="text-orange-500" />;
      case 'review':
        return <Star size={18} className="text-yellow-500" />;
      case 'reminder':
        return <Clock size={18} className="text-orange-500" />;
      case 'property_update':
        return <Home size={18} className="text-teal-500" />;
      default:
        return <Info size={18} className="text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer">
          <Bell
            fill={isOpen ? "#0c2d84" : "transparent"}
            stroke="currentColor"
            className="transition-colors"
          />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="flex flex-col">
          <div className="px-4 py-3 flex justify-between items-center border-b">
            <h2 className="font-semibold">Notifications</h2>
            {notifications.length > 0 && (
              <button 
                className="text-xs text-blue-500 hover:underline"
                onClick={() => {
                  const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
                  if (unreadIds.length > 0) {
                    axiosBase.post('/notifications/mark-read', {
                      notification_ids: unreadIds
                    })
                    .then(() => {
                      setNotifications(prev => 
                        prev.map(notification => ({ 
                          ...notification, 
                          is_read: true, 
                          read_at: new Date().toISOString() 
                        }))
                      );
                      toast.success("All notifications marked as read");
                    })
                    .catch(error => {
                      console.error('Failed to mark all as read:', error);
                      toast.error("Failed to mark notifications as read");
                    });
                  }
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-10 space-y-2">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <p className="text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center text-gray-500 flex flex-col items-center">
              <div className="w-12 h-12 mb-3 flex items-center justify-center bg-gray-100 rounded-full">
                <Bell size={20} className="text-gray-400" />
              </div>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="pb-2">
              {/* Scrollable container */}
              <div className="flex flex-col max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => {
                  const { type, data } = notification;
                  return (
                    <button
                      key={notification.id}
                      className={`flex items-start gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left border-b ${!notification.is_read ? 'bg-blue-50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3 w-full">
                        <div className="flex-shrink-0 w-10 h-10 relative rounded-full overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-full shadow-sm">
                            {getNotificationIcon(type)}
                          </div>
                        </div>
                        <div className="flex flex-col flex-grow gap-1">
                          <span className="font-medium text-sm line-clamp-2">
                            {notification.message}
                          </span>
                          {/* Booking Request */}
                          {type === 'booking_request' && (
                            <>
                              <span className="text-xs text-gray-600">
                                Property: {data.property_title}
                              </span>
                              <span className="text-xs text-gray-600">
                                {data.check_in} → {data.check_out}
                              </span>
                              <span className="text-xs text-blue-600">
                                ₦ {Number(data.total_price).toLocaleString()}
                              </span>
                            </>
                          )}
                          {/* Offer */}
                          {type === 'offer_received' && (
                            <>
                              <span className="text-xs text-gray-600">
                                Property: {data.property_title}
                              </span>
                              <span className="text-xs text-gray-600">
                                Guest: {data.guest_name}
                              </span>
                              <span className="text-xs text-gray-600">
                                {data.check_in?.slice(0, 10)} → {data.check_out?.slice(0, 10)}
                              </span>
                              <span className="text-xs text-orange-600">
                                Offer: ₦ {Number(data.proposed_price).toLocaleString()}
                              </span>
                              {data.message && (
                                <span className="text-xs text-gray-500">
                                  Message: {data.message}
                                </span>
                              )}
                            </>
                          )}
                          {/* New Message */}
                          {(type === 'new_message' || type === 'chat') && (
                            <>
                              <span className="text-xs text-gray-600">
                                From: {data.sender_name || data.user_id}
                              </span>
                              <span className="text-xs text-gray-500">
                                {data.content}
                              </span>
                            </>
                          )}
                          {/* Booking Cancelled */}
                          {type === 'booking_cancelled' && (
                            <>
                              <span className="text-xs text-gray-600">
                                Property: {data.property_title}
                              </span>
                              <span className="text-xs text-red-600">
                                Reason: {data.reason}
                              </span>
                            </>
                          )}
                          {/* Fallback for other types */}
                          {type !== 'booking_request' && type !== 'offer_received' && type !== 'new_message' && type !== 'chat' && type !== 'booking_cancelled' && data.property_title && (
                            <span className="text-xs text-gray-600">
                              Property: {data.property_title}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(notification.created_at)}
                          </span>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}