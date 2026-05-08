import React, { useState, useEffect, useRef } from 'react';
import { User, Package, Heart, Star, Edit3, Trash2, CheckCircle, Loader2, Save, X, Camera, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  // Profile edit form state
  const [editName, setEditName] = useState('');
  const [editHostel, setEditHostel] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Item edit form state
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemLocation, setEditItemLocation] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserData({
          id: user.id,
          email: user.email,
          name: profile.full_name || user.email.split('@')[0],
          hostel: profile.hostel || 'Not set',
          avatarUrl: profile.avatar_url,
          trustScore: 100
        });
        setEditName(profile.full_name || '');
        setEditHostel(profile.hostel || '');
      }

      // 2. Fetch My Listings
      const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      setMyListings(items || []);

      // 3. Fetch Wishlist Items (Joined with Items table)
      const { data: wishlistData } = await supabase
        .from('wishlist')
        .select(`
          id,
          items (
            id,
            title,
            price,
            image_url,
            location,
            status
          )
        `)
        .eq('user_id', user.id);
      
      const formattedWishlist = wishlistData?.map(w => w.items).filter(Boolean) || [];
      setWishlistItems(formattedWishlist);

    } catch (error) {
      console.error("Error fetching profile data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userData) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userData.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userData.id);

      if (updateError) throw updateError;

      setUserData(prev => ({ ...prev, avatarUrl: publicUrl }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    setSavingProfile(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: editName,
          hostel: editHostel,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setUserData(prev => ({ ...prev, name: editName, hostel: editHostel }));
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);
      
      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSold = async (id) => {
    try {
      await supabase.from('items').update({ status: 'sold' }).eq('id', id);
      setMyListings(myListings.map(item => item.id === id ? { ...item, status: 'sold' } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await supabase.from('items').delete().eq('id', id);
      setMyListings(myListings.filter(item => item.id !== id));
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
    <div className="animate-fade-in">
      {/* Profile Header */}
      <div className="glass-card" style={{ padding: '3rem', marginBottom: '3rem', display: 'flex', gap: '3rem', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.1)' }}>
            {userData?.avatarUrl ? <img src={userData.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={70} color="white" />}
          </div>
          <button onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--primary-color)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <Camera size={20} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} accept="image/*" />
        </div>
        
        <div style={{ flex: 1 }}>
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <input type="text" className="input-field" placeholder="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              <input type="text" className="input-field" placeholder="Hostel/Location" value={editHostel} onChange={(e) => setEditHostel(e.target.value)} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{userData?.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>{userData?.email} • {userData?.hostel}</p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                <div><span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{myListings.filter(i => i.status === 'sold').length}</span><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Items Sold</p></div>
                <div><span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--tertiary-color)' }}>{userData?.trustScore} <Star size={18} fill="var(--tertiary-color)" /></span><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating</p></div>
              </div>
            </>
          )}
        </div>
        {!isEditingProfile && <button className="btn btn-secondary" onClick={() => setIsEditingProfile(true)}><Edit3 size={18} /> Edit Profile</button>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem' }}>
        <button onClick={() => setActiveTab('listings')} style={{ padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'listings' ? '3px solid var(--primary-color)' : '3px solid transparent', color: activeTab === 'listings' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Package size={20} /> My Listings ({myListings.length})</button>
        <button onClick={() => setActiveTab('wishlist')} style={{ padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'wishlist' ? '3px solid var(--primary-color)' : '3px solid transparent', color: activeTab === 'wishlist' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Heart size={20} /> Wishlist ({wishlistItems.length})</button>
      </div>

      {/* Tab Content */}
      <div className="grid-container grid-2 grid-3">
        {activeTab === 'listings' ? (
          myListings.map(item => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', paddingTop: '60%' }}>
                <img src={item.image_url} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: item.status === 'active' ? 'var(--tertiary-color)' : 'var(--text-secondary)', padding: '0.3rem 0.7rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '700' }}>{item.status}</div>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontWeight: '700', color: 'var(--primary-color)' }}>₹{item.price}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                  <button onClick={() => navigate(`/item/${item.id}`)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem' }}><ExternalLink size={16} /> View</button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#ef4444' }}><Trash2 size={16} /> Delete</button>
                  {item.status === 'active' && <button onClick={() => handleMarkSold(item.id)} className="btn btn-primary" style={{ gridColumn: 'span 2', padding: '0.5rem', fontSize: '0.8rem' }}><CheckCircle size={16} /> Mark as Sold</button>}
                </div>
              </div>
            </div>
          ))
        ) : (
          wishlistItems.map(item => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', paddingTop: '60%' }}>
                <img src={item.image_url} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontWeight: '700', color: 'var(--primary-color)' }}>₹{item.price}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}><MapPin size={14} /> {item.location}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button onClick={() => navigate(`/item/${item.id}`)} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem' }}><ExternalLink size={16} /> View Item</button>
                  <button onClick={() => handleRemoveFromWishlist(item.id)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#ef4444' }}><Trash2 size={16} /> Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
        {activeTab === 'listings' && myListings.length === 0 && <p style={{ gridColumn: 'span 3', textAlign: 'center', padding: '5rem' }}>You haven't listed any items.</p>}
        {activeTab === 'wishlist' && wishlistItems.length === 0 && <p style={{ gridColumn: 'span 3', textAlign: 'center', padding: '5rem' }}>Your wishlist is empty.</p>}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default Profile;
