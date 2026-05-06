import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, User, MessageSquare, Heart, ChevronLeft, ShieldCheck, Tag, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user);
    });

    const fetchItem = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setItem(data);
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
    </div>
  );

  if (!item) return null;

  return (
    <div className="animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary" 
        style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}
      >
        <ChevronLeft size={20} /> Back to Market
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem' }}>
        <div className="glass" style={{ overflow: 'hidden', padding: '1.5rem' }}>
          <img 
            src={item.image_url} 
            alt={item.title} 
            style={{ width: '100%', borderRadius: '0.75rem', marginBottom: '1.5rem', maxHeight: '500px', objectFit: 'cover' }} 
          />
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <span className="glass" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Tag size={16} className="text-primary" style={{ color: 'var(--primary-color)' }} /> {item.category}
            </span>
            <span className="glass" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} className="text-primary" style={{ color: 'var(--primary-color)' }} /> {item.status === 'active' ? 'Available' : 'Sold'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{item.title}</h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>{item.description}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>${item.price}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              <MapPin size={18} />
              <span>Available at {item.location}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {item.seller_id !== authUser?.id && (
                <button 
                  onClick={() => navigate('/chat', { 
                    state: { 
                      recipientId: item.seller_id, 
                      recipientEmail: item.seller_email,
                      itemId: item.id,
                      itemTitle: item.title
                    } 
                  })} 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', height: '3.5rem' }}
                >
                  <MessageSquare size={20} /> Contact Seller
                </button>
              )}
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', height: '3.5rem' }}>
                <Heart size={20} /> Add to Wishlist
              </button>
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                <User size={24} style={{ color: 'var(--primary-color)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem' }}>{item.seller_email?.split('@')[0] || 'Seller'}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tertiary-color)', fontSize: '0.85rem', fontWeight: '600' }}>
                  <ShieldCheck size={14} /> Verified Seller
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem' }}>Campus Verified Seller.</p>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default ItemDetails;
