import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, User, Search, MessageCircle, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Chat = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [itemContext, setItemContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Initialize Chat and Fetch Current User
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      // If we came from ItemDetails, handle the initial contact
      const targetSellerId = location.state?.sellerId || location.state?.recipientId;
      if (targetSellerId && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', targetSellerId)
          .single();

        if (profile) {
          const newContact = {
            id: profile.id,
            email: profile.full_name || 'User',
            avatar_url: profile.avatar_url,
            itemTitle: location.state?.itemTitle
          };
          setSelectedContact(newContact);
          setContacts(prev => {
            if (prev.find(c => c.id === newContact.id)) return prev;
            return [newContact, ...prev];
          });
        }
      }
      setLoading(false);
    };
    init();
  }, [location.state]);

  // Fetch all existing conversations
  useEffect(() => {
    if (!currentUser) return;

    const fetchContacts = async () => {
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

      const contactIds = Array.from(uniqueIds);
      if (contactIds.length === 0) return;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', contactIds);

      const contactList = profiles?.map(p => ({
        id: p.id,
        email: p.full_name || 'User',
        avatar_url: p.avatar_url,
        lastMessage: 'Click to view'
      })) || [];
      
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

  // Fetch messages for selected contact
  useEffect(() => {
    if (!currentUser || !selectedContact) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) console.error(error);
      setMessages(data || []);

      // Item Context Logic
      const itemMsg = data?.find(m => m.item_id);
      const targetItemId = itemMsg?.item_id || location.state?.itemId;
      
      if (targetItemId) {
        const { data: item } = await supabase
          .from('items')
          .select('title, price, image_url')
          .eq('id', targetItemId)
          .single();
        setItemContext(item);
      } else {
        setItemContext(null);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat-${selectedContact.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser.id}` },
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
  }, [currentUser, selectedContact, location.state]);

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

    setMessages(prev => [...prev, { ...messageObj, created_at: new Date().toISOString() }]);
    setNewMessage('');

    const { error } = await supabase.from('messages').insert([messageObj]);
    if (error) console.error(error);
  };

  const handleDeleteConversation = async () => {
    if (!selectedContact || !currentUser) return;
    if (!window.confirm(`Are you sure you want to clear conversation?`)) return;

    try {
      await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUser.id})`);

      setMessages([]);
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setSelectedContact(null);
      setItemContext(null);
    } catch (err) {
      console.error(err);
    }
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
      <div style={{ width: '350px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" className="glass" placeholder="Search chats..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '1rem', border: '1px solid var(--border-color)', color: 'white' }} />
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
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {contact.avatar_url ? (
                  <img src={contact.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={24} color="var(--primary-color)" />
                )}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.email}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{contact.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedContact ? (
          <>
            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {selectedContact.avatar_url ? (
                    <img src={selectedContact.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} color="var(--primary-color)" />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{selectedContact.email}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--tertiary-color)' }}>Online</p>
                </div>
              </div>
              <button onClick={handleDeleteConversation} className="btn btn-secondary" style={{ color: '#ef4444', padding: '0.5rem' }}>
                <Trash2 size={20} />
              </button>
            </div>

            {itemContext && (
              <div style={{ padding: '0.75rem 2rem', background: 'rgba(99, 102, 241, 0.05)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={itemContext.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{itemContext.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: '700' }}>₹{itemContext.price}</p>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>Interested In</span>
              </div>
            )}

            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <div style={{ 
                    padding: '1rem 1.25rem', 
                    borderRadius: msg.sender_id === currentUser.id ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0', 
                    background: msg.sender_id === currentUser.id ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)', 
                    color: 'white' 
                  }}>
                    {msg.content}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem', textAlign: msg.sender_id === currentUser.id ? 'right' : 'left' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
              <input type="text" className="glass" placeholder="Type your message..." style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', color: 'white' }} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}><Send size={20} /></button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <MessageCircle size={60} style={{ opacity: 0.2 }} />
            <h3>Select a conversation to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
