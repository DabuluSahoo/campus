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
  Heart,
  X,
  ChevronRight,
  Maximize2
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
  
  // Gallery & Lightbox state
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
        await supabase.from('wishlist').delete().eq('user_id', authUser.id).eq('item_id', id);
        setIsWishlisted(false);
      } else {
        await supabase.from('wishlist').insert([{ user_id: authUser.id, item_id: id }]);
        setIsWishlisted(true);
      }
    } catch (err) { console.error(err); } finally { setWishlistLoading(false); }
  };

  const handleShare = async () => {
    const shareData = { title: item.title, text: `Check out this ${item.title}!`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
    </div>
  );

  if (!item) return <div style={{ textAlign: 'center', padding: '5rem' }}>Item not found</div>;

  // Handle image URLs (handle both legacy image_url and new image_urls array)
  const images = item.image_urls && item.image_urls.length > 0 
    ? item.image_urls 
    : [item.image_url];

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1150px', margin: '0 auto', paddingBottom: '5rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2.5rem', padding: '0.6rem 1.2rem' }}>
        <ChevronLeft size={20} /> Back to Market
      </button>

      <div className="item-details-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3.5rem' }}>
        {/* Left: Interactive Gallery */}
        <div style={{ position: 'sticky', top: '8rem', height: 'fit-content' }}>
          <div 
            className="glass-card main-image-container" 
            style={{ 
              borderRadius: '2.5rem', 
              overflow: 'hidden', 
              height: '550px', 
              position: 'relative',
              cursor: 'zoom-in',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
            onClick={() => setIsLightboxOpen(true)}
          >
            <img src={images[selectedImage]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            
            {/* Overlay Controls */}
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', padding: '0.75rem', borderRadius: '1rem', color: 'white' }}>
              <Maximize2 size={20} />
            </div>
            
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer' }}><ChevronLeft size={24} /></button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer' }}><ChevronRight size={24} /></button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            {images.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedImage(idx)}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '1.25rem', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  border: selectedImage === idx ? '3px solid var(--primary-color)' : '2px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s',
                  transform: selectedImage === idx ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: '1.1' }}>{item.title}</h1>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={toggleWishlist} style={{ padding: '0.75rem', color: isWishlisted ? '#ef4444' : 'inherit' }}>
                  <Heart size={22} fill={isWishlisted ? "#ef4444" : "none"} />
                </button>
                <button className="btn btn-secondary" onClick={handleShare} style={{ padding: '0.75rem' }}><Share2 size={22} /></button>
              </div>
            </div>
            
            <p style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary-color)', marginBottom: '2rem' }}>₹{item.price}</p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <span className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', fontWeight: '600' }}>
                <Tag size={20} color="var(--primary-color)" /> {item.category}
              </span>
              <span className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', fontWeight: '600' }}>
                <MapPin size={20} color="var(--secondary-color)" /> {item.location}
              </span>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem', fontWeight: '800' }}>Description</h3>
              <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{item.description}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {seller?.avatar_url ? <img src={seller.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} color="white" />}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{seller?.full_name || 'Verified Seller'}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--tertiary-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}><ShieldCheck size={18} /> Elite Campus Member</p>
            </div>
            {authUser?.id !== item.seller_id && (
              <button onClick={() => navigate('/chat', { state: { sellerId: item.seller_id, itemId: item.id, itemTitle: item.title } })} className="btn btn-primary" style={{ padding: '1rem 1.5rem', borderRadius: '1.25rem' }}>
                <MessageCircle size={22} /> Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* High-End Fullscreen Lightbox */}
      {isLightboxOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.98)', backdropFilter: 'blur(20px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}>
          <button onClick={() => setIsLightboxOpen(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '1rem', borderRadius: '50%', cursor: 'pointer', zIndex: 3100 }}><X size={32} /></button>
          
          <div style={{ width: '90%', height: '80%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={images[selectedImage]} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '1rem', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }} />
            
            {images.length > 1 && (
              <>
                <button onClick={prevImage} style={{ position: 'absolute', left: '-2rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '1.5rem', borderRadius: '50%', cursor: 'pointer' }}><ChevronLeft size={40} /></button>
                <button onClick={nextImage} style={{ position: 'absolute', right: '-2rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '1.5rem', borderRadius: '50%', cursor: 'pointer' }}><ChevronRight size={40} /></button>
              </>
            )}
            
            <div style={{ position: 'absolute', bottom: '-4rem', color: 'white', fontWeight: '600', fontSize: '1.2rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1.5rem', borderRadius: '2rem' }}>
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        @media (max-width: 900px) {
          .item-details-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .main-image-container { height: 400px !important; }
        }
      `}} />
    </div>
  );
};

export default ItemDetails;
