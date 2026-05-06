import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, User, Search, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Chat = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Initialize Chat from Item Details
  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (location.state?.recipientId) {
        const newContact = {
          id: location.state.recipientId,
          email: location.state.recipientEmail,
          itemTitle: location.state.itemTitle
        };
        setSelectedContact(newContact);
        // Add to contacts if not already there
        setContacts(prev => {
          if (prev.find(c => c.id === newContact.id)) return prev;
          return [newContact, ...prev];
        });
      }
      setLoading(false);
    };
    initChat();
  }, [location.state]);

  // Fetch conversations (unique users we've chatted with)
  useEffect(() => {
    if (!currentUser) return;

    const fetchContacts = async () => {
      // In a real app, you might have a 'conversations' table
      // Here we'll derive it from messages for simplicity
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);

      if (error) console.error(error);
      
      const uniqueIds = new Set();
      data?.forEach(msg => {
        if (msg.sender_id !== currentUser.id) uniqueIds.add(msg.sender_id);
        if (msg.receiver_id !== currentUser.id) uniqueIds.add(msg.receiver_id);
      });

      // Map IDs to dummy contact data (in real app, fetch user profiles)
      const contactList = Array.from(uniqueIds).map(id => ({
        id,
        email: `User ${id.substring(0, 5)}...`,
        lastMessage: 'Click to view'
      }));
      
      setContacts(prev => {
        const merged = [...prev];
        contactList.forEach(c => {
          if (!merged.find(m => m.id === c.id)) merged.push(c);
        });
        return merged;
      });
    };

    fetchContacts();
  }, [currentUser]);

  // Real-time Message Subscription
  useEffect(() => {
    if (!currentUser || !selectedContact) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) console.error(error);
      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser.id}`
        },
        (payload) => {
          if (payload.new.sender_id === selectedContact.id) {
            setMessages(prev => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || !currentUser) return;

    const messageObj = {
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      content: newMessage,
      item_id: location.state?.itemId || null
    };

    // Optimistic update
    setMessages(prev => [...prev, { ...messageObj, created_at: new Date().toISOString() }]);
    setNewMessage('');

    const { error } = await supabase.from('messages').insert([messageObj]);
    if (error) console.error(error);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
    </div>
  );

  return (
    <div className="animate-fade-in glass" style={{ 
      height: 'calc(100vh - 12rem)', 
      display: 'flex',
      overflow: 'hidden',
      borderRadius: '1.5rem'
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: '350px', 
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="glass" 
              placeholder="Search chats..." 
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '1rem', border: '1px solid var(--border-color)', color: 'white' }} 
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              style={{ 
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: selectedContact?.id === contact.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                borderLeft: selectedContact?.id === contact.id ? '4px solid var(--primary-color)' : '4px solid transparent',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: 'var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-color)'
              }}>
                <User size={24} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {contact.email.split('@')[0]}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {contact.itemTitle ? `Re: ${contact.itemTitle}` : contact.lastMessage}
                </p>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <MessageCircle size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>No active conversations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedContact ? (
          <>
            <div style={{ 
              padding: '1.25rem 2rem', 
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="var(--primary-color)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{selectedContact.email.split('@')[0]}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--tertiary-color)' }}>Online</p>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    alignSelf: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start',
                    maxWidth: '70%'
                  }}
                >
                  <div style={{ 
                    padding: '1rem 1.25rem',
                    borderRadius: msg.sender_id === currentUser.id ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0',
                    background: msg.sender_id === currentUser.id ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    {msg.content}
                  </div>
                  <p style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--text-secondary)', 
                    marginTop: '0.4rem',
                    textAlign: msg.sender_id === currentUser.id ? 'right' : 'left'
                  }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form 
              onSubmit={handleSendMessage}
              style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}
            >
              <input 
                type="text" 
                className="glass" 
                placeholder="Type your message..." 
                style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', color: 'white' }}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <MessageCircle size={60} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
            <h3>Select a conversation to start chatting</h3>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default Chat;
