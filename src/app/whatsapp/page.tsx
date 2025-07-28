"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  CheckCheck,
  Check,
  Clock,
  User,
  Users,
  Archive,
  Filter,
  Star,
  MessageSquare,
  FileText,
  Mic,
  Loader2,
  Plus,
  AlertCircle,
  ArrowLeft,
  MapPin,
  ExternalLink,
  Globe
} from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/app/hooks/use-mobile";
import { DashboardLayout } from "@/components/DashboardLayout";
import WhatsAppAudioPlayer from "@/components/WhatsAppAudioPlayer";
import WhatsAppImageViewer from "@/components/WhatsAppImageViewer";
import WhatsAppVideoPlayer from "@/components/WhatsAppVideoPlayer";
import { format } from 'date-fns';

const WhatsAppPortal = () => {
  const isMobile = useIsMobile();

  // Helper function to get full media URL
  const getMediaUrl = (mediaUrl: string | undefined) => {
    if (!mediaUrl) return undefined;
    if (mediaUrl.startsWith('http')) return mediaUrl;
    console.log('mediaUrl:', mediaUrl);
    return `http://localhost:8000${mediaUrl}`;
  };

  // Helper function to determine message position in a sequence
  const getMessagePosition = (messages: any[], currentIndex: number, currentMessage: any) => {
    const prevMessage = messages[currentIndex - 1];
    const nextMessage = messages[currentIndex + 1];
    
    const isSameSenderAsPrev = prevMessage && prevMessage.senderType === currentMessage.senderType;
    const isSameSenderAsNext = nextMessage && nextMessage.senderType === currentMessage.senderType;
    
    if (!isSameSenderAsPrev && !isSameSenderAsNext) return 'single';
    if (!isSameSenderAsPrev && isSameSenderAsNext) return 'first';
    if (isSameSenderAsPrev && isSameSenderAsNext) return 'middle';
    if (isSameSenderAsPrev && !isSameSenderAsNext) return 'last';
    return 'single';
  };

  // Helper function to get message bubble border radius (WhatsApp-like)
  const getMessageBubbleRadius = (senderType: string, position: string) => {
    if (senderType === 'admin') {
      // Right side messages (sent by me - purple bubbles)
      switch (position) {
        case "single":
          return "rounded-tl-2xl rounded-tr-sm rounded-bl-md rounded-br-2xl"
        case "first":
          return "rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-sm"
        case "middle":
          return "rounded-tl-2xl rounded-tr-sm rounded-bl-md rounded-br-sm"
        case "last":
          return "rounded-tl-2xl rounded-tr-sm rounded-bl-md rounded-br-md"
        default:
          return "rounded-2xl"
      }
    } else {
      // Left side messages (received - gray bubbles)
      switch (position) {
        case "single":
          return "rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-md"
        case "first":
          return "rounded-tl-2xl rounded-tr-2xl rounded-bl-sm rounded-br-md"
        case "middle":
          return "rounded-tl-sm rounded-tr-2xl rounded-bl-sm rounded-br-md"
        case "last":
          return "rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-md"
        default:
          return "rounded-2xl"
      }
    }
  };

  // Helper function to extract links from message text
  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  // Helper function to get link preview data
  const getLinkPreview = async (url: string) => {
    try {
      // This would typically be done server-side to avoid CORS issues
      const response = await fetch(`https://api.linkpreview.net/?key=YOUR_API_KEY&q=${encodeURIComponent(url)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch link preview:', error);
      return null;
    }
  };

  // Link Preview Component
  const LinkPreview = ({ url }: { url: string }) => {
    const [preview, setPreview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchPreview = async () => {
        try {
          // Generate different mock previews based on URL patterns
          let mockPreview;
          
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('watch?v=') ? url.split('watch?v=')[1]?.split('&')[0] : 
                           url.includes('youtu.be/') ? url.split('youtu.be/')[1] : 'dQw4w9WgXcQ';
            mockPreview = {
              title: 'YouTube Video',
              description: 'Watch this video on YouTube',
              image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              url: url,
              site: 'YouTube'
            };
          } else if (url.includes('github.com')) {
            mockPreview = {
              title: 'GitHub Repository',
              description: 'View this project on GitHub',
              image: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
              url: url,
              site: 'GitHub'
            };
          } else if (url.includes('twitter.com') || url.includes('x.com')) {
            mockPreview = {
              title: 'Post on X',
              description: 'View this post on X (formerly Twitter)',
              image: null,
              url: url,
              site: 'X'
            };
          } else if (url.includes('linkedin.com')) {
            mockPreview = {
              title: 'LinkedIn Post',
              description: 'View this post on LinkedIn',
              image: null,
              url: url,
              site: 'LinkedIn'
            };
          } else {
            mockPreview = {
              title: 'Link Preview',
              description: 'Click to open link',
              image: null,
              url: url,
              site: new URL(url).hostname
            };
          }
          
          setPreview(mockPreview);
        } catch (error) {
          console.error('Failed to fetch link preview:', error);
          setPreview({
            title: 'Link',
            description: 'Click to open link',
            image: null,
            url: url,
            site: url
          });
        } finally {
          setLoading(false);
        }
      };

      fetchPreview();
    }, [url]);

    if (loading) {
      return (
        <div className="border border-gray-200 rounded-lg p-3 mt-2 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading preview...</span>
          </div>
        </div>
      );
    }

    if (!preview) return null;

    return (
      <div 
        className="link-preview border border-gray-200 rounded-lg p-3 mt-2 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => window.open(url, '_blank')}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {preview.image ? (
              <img 
                src={preview.image} 
                alt={preview.title}
                className="w-12 h-12 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <Globe className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {preview.title}
            </p>
            {preview.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {preview.description}
              </p>
            )}
            <p className="text-xs text-blue-600 mt-1 truncate">
              {preview.site}
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    );
  };
  const {
    contacts,
    messages,
    selectedContact,
    loading,
    error,
    fetchContacts,
    fetchMessages,
    sendMessage,
    createContact,
    setSelectedContact
  } = useWhatsApp();

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'students' | 'staff' | 'unread'>('all');
  const [showCreateContact, setShowCreateContact] = useState(false);

  const [newContactData, setNewContactData] = useState({
    name: '',
    phone: '',
    isStudent: true,
    department: '',
    notes: ''
  });
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load contacts on component mount
  useEffect(() => {
    fetchContacts({ filter: filterType, search: searchTerm });
  }, [filterType, searchTerm]);

  // Fetch messages when contact is selected
  useEffect(() => {
    if (selectedContact) {
      console.log('Selected contact:', selectedContact);
      console.log('Contact ID:', selectedContact.id);
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact, fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || loading) return;

    try {
      await sendMessage(selectedContact.id, newMessage, 'text');
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact || loading) return;

    try {
      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      const content = `Sent ${fileType === 'image' ? 'an image' : 'a document'}: ${file.name}`;
      await sendMessage(selectedContact.id, content, fileType);
    } catch (error) {
      console.error('Failed to send file:', error);
    }
  };

  const handleCreateContact = async () => {
    if (!newContactData.name || !newContactData.phone) return;
    
    try {
      await createContact(newContactData);
      setShowCreateContact(false);
      setNewContactData({
        name: '',
        phone: '',
        isStudent: true,
        department: '',
        notes: ''
      });
      // Refresh contacts list
      fetchContacts({ filter: filterType, search: searchTerm });
    } catch (error) {
      console.error('Failed to create contact:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Debounce search
    setTimeout(() => {
      fetchContacts({ filter: filterType, search: value });
    }, 500);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterType(newFilter as any);
    fetchContacts({ filter: newFilter, search: searchTerm });
  };

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
  };

  const handleBackToContacts = () => {
    setSelectedContact(null);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!selectedContact?.conversation?.id) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start if not already typing
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      // Here we would emit typing via socket if we had access to it
      // socket?.emit('typing', { conversationId: selectedContact.conversation.id, isTyping: true });
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // socket?.emit('typing', { conversationId: selectedContact.conversation.id, isTyping: false });
    }, 1000);
  };

  // Contacts are already filtered on the backend, so we can use them directly
  const filteredContacts = contacts;

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };


  // Contact Sidebar Component
  const ContactSidebar = ({ className = "" }: { className?: string }) => (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            WhatsApp Portal
          </h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                  <Users className="w-4 h-4 mr-2" />
                  All Contacts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('students')}>
                  <User className="w-4 h-4 mr-2" />
                  Students
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('staff')}>
                  <Users className="w-4 h-4 mr-2" />
                  Staff
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('unread')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Unread
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={showCreateContact} onOpenChange={setShowCreateContact}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newContactData.name}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newContactData.phone}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newContactData.department}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Department"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isStudent"
                      checked={newContactData.isStudent}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, isStudent: e.target.checked }))}
                    />
                    <Label htmlFor="isStudent">Is Student</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateContact(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateContact} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Contact
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter tabs */}
        <Tabs value={filterType} onValueChange={handleFilterChange} className="mt-3">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1 whatsapp-scrollbar h-[65vh]">
        <div className="p-2">
          {loading && filteredContacts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading contacts...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No contacts found</p>
            </div>
          ) : (
            filteredContacts.map((contact: any) => (
            <div
              key={contact.id}
              className={`p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors ${
                selectedContact?.id === contact.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => handleContactSelect(contact)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>
                      {contact.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {contact.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500">
                      {contact.lastMessageTime ? formatLastMessageTime(contact.lastMessageTime) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {contact.lastMessage?.content || contact.lastMessage?.text || 'No messages yet'}
                    </p>
                    {contact.unreadCount && contact.unreadCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {contact.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{contact.phone}</span>
                    {contact.isStudent && (
                      <Badge variant="secondary" className="text-xs">Student</Badge>
                    )}
                    {contact.applicationId && (
                      <Badge variant="outline" className="text-xs">
                        {typeof contact.applicationId === 'string' ? contact.applicationId : contact.applicationId?.applicationId || 'App ID'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Desktop layout with sidebar
  const DesktopLayout = () => (
    <div className="flex bg-gray-100 h-full">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="absolute top-4 right-4 w-96 z-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sidebar - Contacts List */}
      <ContactSidebar className="w-1/3 min-w-[350px] max-w-[450px]" />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                  <AvatarFallback>
                    {selectedContact.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedContact.status === 'online' ? 'Online' : 
                     selectedContact.status === 'typing' ? 'Typing...' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star className="w-4 h-4 mr-2" />
                      Star Contact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 max-h-[78vh] overflow-y-auto">
              <div className="space-y-1">
                {loading && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((message: any, index: number) => {
                    const position = getMessagePosition(messages, index, message);
                    const bubbleRadius = getMessageBubbleRadius(message.senderType, position);
                    const messageText = message.content?.text || message.text || '';
                    const links = extractLinks(messageText);
                    
                    return (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'} ${
                        position === 'middle' ? 'mb-1' : 'mb-2'
                      }`}
                    >
                      <div
                        className={`${message.senderType === 'admin' ? 'sent' : 'received'} max-w-xs lg:max-w-md relative `} 
                      >
                        {/* Image message */}
                        {message.messageType === 'image' && message.mediaUrl && (
                          <div className="media-message">
                            <WhatsAppImageViewer
                              src={getMediaUrl(message.mediaUrl)!}
                              alt={message.fileName || 'Image'}
                              caption={message.content?.caption}
                              className="max-w-[300px]"
                            />
                          </div>
                        )}

                        {/* Video message */}
                        {message.messageType === 'video' && message.mediaUrl && (
                          <div className="media-message">
                            <WhatsAppVideoPlayer
                              src={getMediaUrl(message.mediaUrl)!}
                              poster={getMediaUrl(message.thumbnailUrl)}
                              caption={message.content?.caption}
                              className="max-w-[300px]"
                            />
                          </div>
                        )}

                        {/* Audio message */}
                        {message.messageType === 'audio' && message.mediaUrl && (
                          <div className="audio-message">
                            <WhatsAppAudioPlayer
                              src={getMediaUrl(message.mediaUrl)!}
                              duration={message.duration}
                              isOutgoing={message.senderType === 'admin'}
                            />
                          </div>
                        )}

                        {/* Document message */}
                        {message.messageType === 'document' && (
                          <div className="document-message"
                               onClick={() => message.mediaUrl && window.open(getMediaUrl(message.mediaUrl), '_blank')}>
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">
                                  {message.fileName || 'Document'}
                                </span>
                                {message.mediaSize && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {(message.mediaSize / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                )}
                              </div>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                        )}

                        {/* Location message */}
                        {message.messageType === 'location' && message.location && (
                          <div className="location-message">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-red-500" />
                              <div className="flex-1">
                                <span className="text-sm font-medium">Location</span>
                                {message.location.address && (
                                  <p className="text-xs text-gray-600 mt-1">{message.location.address}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {message.location.latitude?.toFixed(6)}, {message.location.longitude?.toFixed(6)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Contact message */}
                        {message.messageType === 'contact' && message.contactInfo && (
                          <div className="contact-message">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium">
                                  {message.contactInfo.name || message.contactInfo.formattedName || 'Contact'}
                                </span>
                                {message.contactInfo.phone && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Phone className="w-3 h-3 text-gray-500" />
                                    <p className="text-sm text-gray-600">{message.contactInfo.phone}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sticker message */}
                        {message.messageType === 'sticker' && message.mediaUrl && (
                          <div className="sticker-message">
                            <img
                              src={getMediaUrl(message.mediaUrl)!}
                              alt="Sticker"
                              className="max-w-[128px] max-h-[128px] rounded-lg"
                            />
                          </div>
                        )}

                        {/* Interactive message */}
                        {message.messageType === 'interactive' && message.interactive && (
                          <div className="interactive-message">
                            {message.interactive.type === 'button_reply' && message.interactive.buttonReply && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Button: {message.interactive.buttonReply.title}</span>
                              </div>
                            )}
                            {message.interactive.type === 'list_reply' && message.interactive.listReply && (
                              <div>
                                <span className="text-sm font-medium">Selected: {message.interactive.listReply.title}</span>
                                {message.interactive.listReply.description && (
                                  <p className="text-xs mt-1">{message.interactive.listReply.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reaction message */}
                        {message.messageType === 'reaction' && message.reaction && (
                          <div className="reaction-message">
                            <span className="text-2xl">{message.reaction.emoji}</span>
                          </div>
                        )}

                        {/* Text content for most message types */}
                        {(message.messageType === 'text' ||
                          (!['image', 'video', 'audio', 'document', 'location', 'contact', 'sticker', 'interactive', 'reaction'].includes(message.messageType) && message.content?.text)) && (
                          <div className={`flex items-end justify-between gap-2 px-4 py-2 shadow-sm ${bubbleRadius} ${message.senderType === 'admin' ? 'bg-primary text-white' : 'bg-muted text-primary'}`}>
                            {message.senderType === 'admin' && (
                              <span className="text-[0.6rem] text-gray-300 flex-shrink-0 -mb-1 -ml-2.5">
                                {format(message.timestamp, 'HH:mm')}
                              </span>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium whitespace-pre-wrap break-words">
                                {messageText || 'Message content not available'}
                              </p>
                              {/* Link previews */}
                              {links.length > 0 && links.map((link, linkIndex) => (
                                <LinkPreview key={linkIndex} url={link} />
                              ))}
                            </div>
                            {message.senderType !== 'admin' && (
                              <span className="text-[0.6rem] text-gray-300 flex-shrink-0 -mb-1 -mr-2.5">
                                {format(message.timestamp, 'HH:mm')}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Unsupported message */}
                        {message.messageType === 'unsupported' && (
                          <div className="italic text-sm text-gray-500">
                            This message type is not supported
                          </div>
                        )}

                      </div>
                    </div>
                    )
                  })
                )}
                
                {/* Typing indicator */}
                {otherUserTyping && (
                  <div className="flex justify-start">
                    <div className="message-bubble received bg-gray-700 text-white px-4 py-2 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-md shadow-sm">
                      <div className="typing-dots">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    className="min-h-[40px] max-h-[120px] resize-none"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center whatsapp-bg">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile layout
  const MobileLayout = () => (
    <div className="h-full bg-gray-100">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="absolute top-4 right-4 w-80 z-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!selectedContact ? (
        // Show contacts list on mobile when no contact selected
        <ContactSidebar className="h-full" />
      ) : (
        // Show chat when contact is selected
        <div className="flex flex-col h-full">
          {/* Mobile Chat Header */}
          <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleBackToContacts}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <p className="font-medium text-sm">{selectedContact.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="w-4 h-4 mr-2" />
                    Star Contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 whatsapp-bg whatsapp-scrollbar">
            <div className="space-y-1">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start a conversation!</p>
                </div>
              ) : (
                messages.map((message: any, index: number) => {
                  const position = getMessagePosition(messages, index, message);
                  const bubbleRadius = getMessageBubbleRadius(message.senderType, position);
                  const messageText = message.content?.text || message.text || '';
                  const links = extractLinks(messageText);
                  
                  return (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'} ${
                      position === 'middle' ? 'mb-1' : 'mb-2'
                    }`}
                  >
                    <div
                      className={`${message.senderType === 'admin' ? 'sent' : 'received'} max-w-xs relative`}
                    >
                      {/* Image message */}
                      {message.messageType === 'image' && message.mediaUrl && (
                        <div className="media-message">
                          <WhatsAppImageViewer
                            src={getMediaUrl(message.mediaUrl)!}
                            alt={message.fileName || 'Image'}
                            caption={message.content?.caption}
                            className="max-w-[250px]"
                          />
                        </div>
                      )}

                      {/* Video message */}
                      {message.messageType === 'video' && message.mediaUrl && (
                        <div className="media-message">
                          <WhatsAppVideoPlayer
                            src={getMediaUrl(message.mediaUrl)!}
                            poster={getMediaUrl(message.thumbnailUrl)}
                            caption={message.content?.caption}
                            className="max-w-[250px]"
                          />
                        </div>
                      )}

                      {/* Audio message */}
                      {message.messageType === 'audio' && message.mediaUrl && (
                        <div className="audio-message">
                          <WhatsAppAudioPlayer
                            src={getMediaUrl(message.mediaUrl)!}
                            duration={message.duration}
                          />
                        </div>
                      )}

                      {/* Document message */}
                      {message.messageType === 'document' && (
                        <div className="document-message"
                             onClick={() => message.mediaUrl && window.open(getMediaUrl(message.mediaUrl), '_blank')}>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">
                                {message.fileName || 'Document'}
                              </span>
                              {message.mediaSize && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {(message.mediaSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Location message */}
                      {message.messageType === 'location' && message.location && (
                        <div className="location-message">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <div className="flex-1">
                              <span className="text-sm font-medium">Location</span>
                              {message.location.address && (
                                <p className="text-xs text-gray-600 mt-1">{message.location.address}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {message.location.latitude?.toFixed(6)}, {message.location.longitude?.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contact message */}
                      {message.messageType === 'contact' && message.contactInfo && (
                        <div className="contact-message">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                {message.contactInfo.name || message.contactInfo.formattedName || 'Contact'}
                              </span>
                              {message.contactInfo.phone && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className="w-3 h-3 text-gray-500" />
                                  <p className="text-sm text-gray-600">{message.contactInfo.phone}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sticker message */}
                      {message.messageType === 'sticker' && message.mediaUrl && (
                        <div className="sticker-message">
                          <img
                            src={getMediaUrl(message.mediaUrl)!}
                            alt="Sticker"
                            className="max-w-[96px] max-h-[96px] rounded-lg"
                          />
                        </div>
                      )}

                      {/* Interactive message */}
                      {message.messageType === 'interactive' && message.interactive && (
                        <div className="interactive-message">
                          {message.interactive.type === 'button_reply' && message.interactive.buttonReply && (
                            <span className="text-sm font-medium">Button: {message.interactive.buttonReply.title}</span>
                          )}
                          {message.interactive.type === 'list_reply' && message.interactive.listReply && (
                            <div>
                              <span className="text-sm font-medium">Selected: {message.interactive.listReply.title}</span>
                              {message.interactive.listReply.description && (
                                <p className="text-xs mt-1">{message.interactive.listReply.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reaction message */}
                      {message.messageType === 'reaction' && message.reaction && (
                        <div className="reaction-message">
                          <span className="text-xl">{message.reaction.emoji}</span>
                        </div>
                      )}

                      {/* Text content for most message types */}
                      {(message.messageType === 'text' ||
                        (!['image', 'video', 'audio', 'document', 'location', 'contact', 'sticker', 'interactive', 'reaction'].includes(message.messageType) && message.content?.text)) && (
                        <div className={`flex items-end justify-between gap-2 px-4 py-2 shadow-sm  ${bubbleRadius} ${message.senderType === 'admin' ? 'bg-primary text-white' : 'bg-muted text-primary'}`}>
                          {message.senderType === 'admin' && (
                            <span className="text-[0.6rem] text-gray-300 flex-shrink-0 -mb-1 -ml-2.5">
                              {format(message.timestamp, 'HH:mm')}
                            </span>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium whitespace-pre-wrap break-words">
                              {messageText || 'Message content not available'}
                            </p>
                            {/* Link previews */}
                            {links.length > 0 && links.map((link, linkIndex) => (
                              <LinkPreview key={linkIndex} url={link} />
                            ))}
                          </div>
                          {message.senderType !== 'admin' && (
                            <span className="text-[0.6rem] text-gray-300 flex-shrink-0 -mb-1 -mr-2.5">
                              {format(message.timestamp, 'HH:mm')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Unsupported message */}
                      {message.messageType === 'unsupported' && (
                        <div className="italic text-sm text-gray-500">
                          This message type is not supported
                        </div>
                      )}

                    </div>
                  </div>
                  )
                })
                )
              }
              
              {/* Typing indicator */}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="message-bubble received bg-gray-700 text-white px-4 py-2 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-md shadow-sm">
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  className="min-h-[40px] max-h-[120px] resize-none"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || loading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout title="WhatsApp Portal">
        {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </DashboardLayout>
  );
};

export default WhatsAppPortal;