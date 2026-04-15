'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MessageCircle, 
  Home, 
  Tv, 
  Search, 
  User,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  other_profile: Profile;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export default function CoachMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const athleteEmail = searchParams.get('athlete');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setCurrentUserId(user.id);
        setCurrentProfileId(profile.id);
      }
    };
    
    fetchUser();
  }, [router]);

  // Fetch conversations
  useEffect(() => {
    if (!currentProfileId) return;
    
    const fetchConversations = async () => {
      console.log('Fetching conversations for profile:', currentProfileId);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${currentProfileId},participant_2.eq.${currentProfileId}`)
        .order('last_message_at', { ascending: false });
      
      console.log('Conversations data:', data);
      console.log('Conversations error:', error);
      
      if (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        // Fetch other user profiles separately
        const otherIds = data.map((conv: any) => 
          conv.participant_1 === currentProfileId ? conv.participant_2 : conv.participant_1
        );
        
        const { data: profilesData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, profile_picture_url')
          .in('id', otherIds);
        
        console.log('Profiles data:', profilesData);
        console.log('Profiles error:', profileError);
        
        const profileMap = new Map(profilesData?.map((p: any) => [p.id, p]) || []);
        
        const formatted = data.map((conv: any) => {
          const otherId = conv.participant_1 === currentProfileId ? conv.participant_2 : conv.participant_1;
          const otherProfile = profileMap.get(otherId) || { 
            id: otherId, 
            first_name: 'Unknown', 
            last_name: 'User',
            profile_picture_url: null 
          };
          return {
            ...conv,
            other_profile: otherProfile,
            unread_count: 0
          };
        });
        
        console.log('Formatted conversations:', formatted);
        console.log('Setting conversations state with', formatted.length, 'items');
        setConversations(formatted);
      } else {
        console.log('No data found');
        setConversations([]);
      }
      
      setLoading(false);
    };
    
    fetchConversations();
    
    // Subscribe to new conversations
    const subscription = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_1=eq.${currentProfileId}`
      }, () => fetchConversations())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_2=eq.${currentProfileId}`
      }, () => fetchConversations())
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [currentProfileId]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;
    
    console.log('Active conversation changed:', activeConversation.id);
    
    const fetchMessages = async () => {
      console.log('Fetching messages for conv:', activeConversation.id);
      
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at, read_at')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true });
      
      console.log('Messages fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      
      if (data) {
        console.log('Setting messages:', data.length, 'messages');
        setMessages(data);
      }
    };
    
    // Fetch immediately
    fetchMessages();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${activeConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversation.id}`
      }, (payload) => {
        console.log('New message received:', payload);
        fetchMessages();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [activeConversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !currentProfileId) return;
    
    setSending(true);
    
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender_id: currentProfileId,
        content: newMessage.trim()
      });
    
    if (error) {
      console.error('Send message error:', error);
    } else {
      setNewMessage('');
    }
    
    setSending(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#51b5ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          {activeConversation ? (
            <>
              <button 
                onClick={() => setActiveConversation(null)}
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                {activeConversation.other_profile?.profile_picture_url ? (
                  <img 
                    src={activeConversation.other_profile.profile_picture_url}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#51b5ff]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#51b5ff]" />
                  </div>
                )}
                
                <div>
                  <h1 className="font-bold text-gray-900">
                    {activeConversation.other_profile.first_name} {activeConversation.other_profile.last_name}
                  </h1>
                  <p className="text-xs text-gray-500">Athlete</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/dashboard/coaches" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm text-gray-500">{conversations.length} conversations</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {activeConversation ? (
          /* Chat View */
          <div className="flex flex-col h-[calc(100vh-180px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-400">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender_id === currentProfileId;
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].created_at) !== formatDate(msg.created_at);
                  
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] ${isMe ? 'bg-[#51b5ff] text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-2 shadow-sm`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-babyblue-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#51b5ff] focus:border-transparent outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="w-12 h-12 bg-[#51b5ff] hover:bg-[#3da8f0] disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Conversations List */
          <div className="p-4">
            {conversations.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg shadow-babyblue-200/50 border border-babyblue-100 p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Your conversations with athletes will appear here.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 bg-[#51b5ff] hover:bg-[#3da8f0] text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Find athletes
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className="w-full bg-white rounded-2xl shadow-sm border border-babyblue-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    {conv.other_profile?.profile_picture_url ? (
                      <img 
                        src={conv.other_profile.profile_picture_url}
                        alt={`${conv.other_profile.first_name} ${conv.other_profile.last_name}`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#51b5ff]/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-[#51b5ff]" />
                      </div>
                    )}
                    
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">
                        {conv.other_profile.first_name} {conv.other_profile.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last active {formatDate(conv.last_message_at)}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 bg-[#51b5ff] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      {!activeConversation && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
          <div className="max-w-md mx-auto flex justify-around">
            <Link href="/dashboard/coaches" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </Link>
            <Link href="/tv" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
              <Tv className="w-6 h-6" />
              <span className="text-xs">TV</span>
            </Link>
            <Link href="/search" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
              <Search className="w-6 h-6" />
              <span className="text-xs">Search</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
              <User className="w-6 h-6" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
