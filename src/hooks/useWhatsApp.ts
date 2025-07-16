import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from './useSocket';
import { get, post, put } from '@/utilities/AxiosInterceptor';

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  status: 'online' | 'offline' | 'typing';
  isStudent?: boolean;
  applicationId?: string;
  conversation?: any;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: {
    text?: string;
    caption?: string;
  };
  messageType: 'text' | 'image' | 'document' | 'audio' | 'video' | 'voice' | 'sticker' | 'location' | 'contact' | 'interactive' | 'reaction' | 'unsupported';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  fileName?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaSize?: number;
  thumbnailUrl?: string;
  duration?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contactInfo?: {
    name?: string;
    phone?: string;
    formattedName?: string;
    vcard?: string;
  };
  interactive?: {
    type?: string;
    buttonReply?: {
      id: string;
      title: string;
    };
    listReply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  reaction?: {
    messageId: string;
    emoji: string;
  };
  sticker?: {
    id: string;
    animated: boolean;
  };
  system?: {
    type: string;
    body: string;
  };
  replyTo?: string;
  senderType: 'admin' | 'contact';
}

interface DashboardStats {
  totalContacts: number;
  totalStudents: number;
  totalStaff: number;
  activeConversations: number;
  unreadConversations: number;
  todayMessages: number;
}

interface UseWhatsAppReturn {
  // State
  contacts: Contact[];
  messages: Message[];
  selectedContact: Contact | null;
  loading: boolean;
  error: string | null;
  dashboardStats: DashboardStats | null;
  
  // Actions
  fetchContacts: (filters?: any) => Promise<void>;
  fetchMessages: (contactId: string) => Promise<void>;
  sendMessage: (contactId: string, content: string, messageType?: string) => Promise<void>;
  createContact: (contactData: any) => Promise<void>;
  updateContactStatus: (contactId: string, status: string) => Promise<void>;
  searchMessages: (query: string, filters?: any) => Promise<Message[]>;
  getDashboardStats: () => Promise<void>;
  setSelectedContact: (contact: Contact | null) => void;
  markMessagesAsRead: (contactId: string) => Promise<void>;
}

export const useWhatsApp = (): UseWhatsAppReturn => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const { socket, isConnected, joinConversation, leaveConversation } = useSocket();


  // Error handler
  const handleError = (error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    const message = error.response?.data?.message || error.message || `Failed to ${operation}`;
    setError(message);
    throw new Error(message);
  };

  // Fetch contacts with filtering and pagination
  const fetchContacts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });

      const response = await get<any>(`/api/v1/whatsapp/contacts?${params.toString()}`);
      
      if (response.success) {
        console.log('Fetched contacts:', response.data.contacts);
        setContacts(response.data.contacts);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      handleError(error, 'fetch contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (contactId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching messages for contactId:', contactId);

      if (!contactId || contactId === 'undefined') {
        throw new Error('Invalid contact ID');
      }

      const response = await get<any>(`/api/v1/whatsapp/conversations/${contactId}/messages`);
      
      if (response.success) {
        setMessages(response.data.messages);
        
        // Update the contact's unread count to 0
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId 
              ? { ...contact, unreadCount: 0 }
              : contact
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      handleError(error, 'fetch messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    contactId: string, 
    content: string, 
    messageType = 'text'
  ) => {
    try {
      setError(null);

      const response = await post<any>(`/api/v1/whatsapp/conversations/${contactId}/messages`, {
        content,
        messageType
      });
      
      if (response.success) {
        const newMessage = response.data;
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Update contact's last message
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId 
              ? { 
                  ...contact, 
                  lastMessage: content,
                  lastMessageTime: 'Just now'
                }
              : contact
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      handleError(error, 'send message');
    }
  }, []);

  // Create or update a contact
  const createContact = useCallback(async (contactData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await post<any>('/api/v1/whatsapp/contacts', contactData);
      
      if (response.success) {
        const newContact = response.data;
        setContacts(prevContacts => {
          const existingIndex = prevContacts.findIndex(c => c.id === newContact.id);
          if (existingIndex >= 0) {
            const updated = [...prevContacts];
            updated[existingIndex] = newContact;
            return updated;
          } else {
            return [newContact, ...prevContacts];
          }
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      handleError(error, 'create contact');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update contact status
  const updateContactStatus = useCallback(async (contactId: string, status: string) => {
    try {
      setError(null);

      const response = await put<any>(`/api/v1/whatsapp/contacts/${contactId}/status`, { status });
      
      if (response.success) {
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId 
              ? { ...contact, status: status as any }
              : contact
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      handleError(error, 'update contact status');
    }
  }, []);

  // Search messages
  const searchMessages = useCallback(async (query: string, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ query, ...filters });
      const response = await get<any>(`/api/v1/whatsapp/messages/search?${params.toString()}`);
      
      if (response.success) {
        return response.data.messages;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      handleError(error, 'search messages');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get dashboard statistics
  const getDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await get<any>('/api/v1/whatsapp/dashboard/stats');
      
      if (response.success) {
        setDashboardStats(response.data.stats);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      handleError(error, 'fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (contactId: string) => {
    try {
      // This will happen automatically when fetching messages
      // But we can also implement a specific endpoint if needed
      await fetchMessages(contactId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [fetchMessages]);

  // Auto-refresh contacts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (contacts.length > 0) {
        fetchContacts();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [contacts.length, fetchContacts]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      const { message, conversationId, contactId } = data;
      
      // Add message to current conversation if it's selected
      if (selectedContact?.conversation?.id === conversationId) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
      
      // Update contact's last message and unread count
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId 
            ? { 
                ...contact, 
                lastMessage: message.content?.text || 'New message',
                lastMessageTime: message.timestamp,
                unreadCount: selectedContact?.id === contactId ? 
                  contact.unreadCount : (contact.unreadCount || 0) + 1
              }
            : contact
        )
      );
    };

    // Listen for message status updates
    const handleMessageStatusUpdate = (data: any) => {
      const { messageId, status } = data;
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, status } : msg
        )
      );
    };

    // Listen for conversation updates
    const handleConversationUpdate = (data: any) => {
      const { contactId, lastMessage } = data;
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId 
            ? { 
                ...contact, 
                lastMessage: lastMessage.content,
                lastMessageTime: lastMessage.timestamp
              }
            : contact
        )
      );
    };

    // Listen for typing indicators
    const handleTyping = (data: any) => {
      const { userId, isTyping } = data;
      // Update UI to show typing indicator
      console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'}`);
    };

    // Register event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('message_status_updated', handleMessageStatusUpdate);
    socket.on('conversation_updated', handleConversationUpdate);
    socket.on('typing', handleTyping);

    // Cleanup
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_status_updated', handleMessageStatusUpdate);
      socket.off('conversation_updated', handleConversationUpdate);
      socket.off('typing', handleTyping);
    };
  }, [socket, isConnected, selectedContact]);

  // Join/leave conversation rooms when selected contact changes
  useEffect(() => {
    if (!selectedContact?.conversation?.id) return;

    joinConversation(selectedContact.conversation.id);
    
    return () => {
      if (selectedContact?.conversation?.id) {
        leaveConversation(selectedContact.conversation.id);
      }
    };
  }, [selectedContact?.conversation?.id, joinConversation, leaveConversation]);

  return {
    // State
    contacts,
    messages,
    selectedContact,
    loading,
    error,
    dashboardStats,
    
    // Actions
    fetchContacts,
    fetchMessages,
    sendMessage,
    createContact,
    updateContactStatus,
    searchMessages,
    getDashboardStats,
    setSelectedContact,
    markMessagesAsRead,
  };
};