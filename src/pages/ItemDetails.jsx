import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Tag, 
  Clock, 
  User, 
  MessageCircle, 
  ChevronLeft, 
  Loader2,
  ShieldCheck,
  Share2,
  Heart
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setAuthUser(user);

        // Fetch item
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .single();
        
        if (itemError) throw itemError;
        setItem(itemData);

        // Fetch seller profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', itemData.seller_id)
          .single();
        
        setSeller(profileData);

        // Check if item is in wishlist
        if (user) {
          const { data: wishlistData } = await supabase
            .from('wishlist')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', id)
            .maybeSingle();
          
          setIsWishlisted(!!wishlistData);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleWishlist = async () => {
    if (!authUser) return navigate('/login');
    setWishlistLoading(true);
    
    try {
      if (isWishlisted) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', authUser.id)
          .eq('item_id', id);
        setIsWishlisted(false);
      } else {
        await supabase
          .from('wishlist')
          .insert([{ user_id: authUser.id, item_id: id }]);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: `Check out this ${item.title} on Campus Market!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleContact = () => {
    navigate('/chat', { state: { sellerId: item.seller_id, itemId: item.id, itemTitle: item.title } });
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
    </div>
  );

  if (!item) return <div style={{ textAlign: 'center', padding: '5rem' }}>Item not found</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem', padding: '0.6rem 1rem' }}>
        <ChevronLeft size={20} /> Back to Market
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
        <div style={{ position: 'relative' }}>
          <div className="glass-card" style={{ borderRadius: '2rem', overflow: 'hidden', height: '500px' }}>
            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '2.5rem' }}>{item.title}</h1>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  style={{ padding: '0.5rem', color: isWishlisted ? '#ef4444' : 'inherit' }}
                >
                  <Heart size={20} fill={isWishlisted ? "#ef4444" : "none"} />
                </button>
                <button className="btn btn-secondary" onClick={handleShare} style={{ padding: '0.5rem' }}>
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            
            <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>${item.price}</p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <span className="glass" style={{ padding: '0.6rem 1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Tag size={18} color="var(--primary-color)" /> {item.category}
              </span>
              <span className="glass" style={{ padding: '0.6rem 1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <MapPin size={18} color="var(--secondary-color)" /> {item.location}
              </span>
              <span className="glass" style={{ padding: '0.6rem 1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <Clock size={18} color="var(--tertiary-color)" /> {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>Description</h3>
              <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>{item.description}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {seller?.avatar_url ? (
                <img src={seller.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={30} color="var(--primary-color)" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{seller?.full_name || 'Verified Seller'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--tertiary-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={16} /> Verified Seller</p>
            </div>
            {authUser?.id !== item.seller_id && (
              <button onClick={handleContact} className="btn btn-primary">
                <MessageCircle size={20} /> Contact Seller
              </button>
            )}
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
