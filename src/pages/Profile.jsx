import React, { useState, useEffect } from 'react';
import { User, Package, Heart, Star, Edit3, Trash2, CheckCircle, Loader2, Save, X, DollarSign, Tag, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserData({
          email: user.email,
          name: profile.full_name || user.email.split('@')[0],
          hostel: profile.hostel || 'Not set',
          trustScore: 100
        });
        setEditName(profile.full_name || '');
        setEditHostel(profile.hostel || '');
      }

      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (itemsError) throw itemsError;
      setMyListings(items || []);
    } catch (error) {
      console.error("Error fetching profile data: ", error);
    } finally {
      setLoading(false);
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
      alert("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleStartEditItem = (item) => {
    setEditingItem(item);
    setEditItemTitle(item.title);
    setEditItemPrice(item.price);
    setEditItemLocation(item.location);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setSavingItem(true);
    
    try {
      const { error } = await supabase
        .from('items')
        .update({
          title: editItemTitle,
          price: parseFloat(editItemPrice),
          location: editItemLocation,
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      
      setMyListings(myListings.map(item => 
        item.id === editingItem.id 
          ? { ...item, title: editItemTitle, price: editItemPrice, location: editItemLocation } 
          : item
      ));
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update item");
    } finally {
      setSavingItem(false);
    }
  };

  const handleMarkSold = async (id) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ status: 'sold' })
        .eq('id', id);
      
      if (error) throw error;
      setMyListings(myListings.map(item => item.id === id ? { ...item, status: 'sold' } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const itemToDelete = myListings.find(item => item.id === id);
    if (!itemToDelete) return;
    
    if (!window.confirm("Are you sure you want to delete this listing? All images will be removed permanently.")) return;
    
    try {
      if (itemToDelete.image_url && itemToDelete.image_url.includes('item-images')) {
        const pathParts = itemToDelete.image_url.split('item-images/');
        if (pathParts.length > 1) {
          const filePath = pathParts[1];
          await supabase.storage.from('item-images').remove([filePath]);
        }
      }

      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
      setMyListings(myListings.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete listing");
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ padding: '3rem', marginBottom: '3rem', display: 'flex', gap: '3rem', alignItems: 'center', position: 'relative' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={60} color="white" />
        </div>
        
        <div style={{ flex: 1 }}>
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <input type="text" className="input-field" placeholder="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              <input type="text" className="input-field" placeholder="Hostel/Location" value={editHostel} onChange={(e) => setEditHostel(e.target.value)} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditingProfile(false)}><X size={18} /> Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{userData?.name}</h1>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>{userData?.email} • <span style={{ color: 'var(--primary-color)' }}>{userData?.hostel}</span></p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div><span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{myListings.filter(i => i.status === 'sold').length}</span><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Items Sold</p></div>
                <div><span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--tertiary-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>{userData?.trustScore} <Star size={18} fill="var(--tertiary-color)" /></span><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating</p></div>
              </div>
            </>
          )}
        </div>
        {!isEditingProfile && <button className="btn btn-secondary" onClick={() => setIsEditingProfile(true)}><Edit3 size={18} /> Edit Profile</button>}
      </div>

      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem' }}>
        <button onClick={() => setActiveTab('listings')} style={{ padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'listings' ? '3px solid var(--primary-color)' : '3px solid transparent', color: activeTab === 'listings' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Package size={20} /> My Listings ({myListings.length})</button>
        <button onClick={() => setActiveTab('wishlist')} style={{ padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'wishlist' ? '3px solid var(--primary-color)' : '3px solid transparent', color: activeTab === 'wishlist' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Heart size={20} /> Wishlist (0)</button>
      </div>

      {activeTab === 'listings' ? (
        <div className="grid-container grid-2 grid-3">
          {myListings.map(item => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {editingItem?.id === item.id ? (
                <form onSubmit={handleUpdateItem} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>Edit Item</h3>
                  <div className="input-group">
                    <label className="input-label">Title</label>
                    <input type="text" className="input-field" value={editItemTitle} onChange={(e) => setEditItemTitle(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Price ($)</label>
                    <input type="number" className="input-field" value={editItemPrice} onChange={(e) => setEditItemPrice(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Location</label>
                    <input type="text" className="input-field" value={editItemLocation} onChange={(e) => setEditItemLocation(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={savingItem} style={{ flex: 1, justifyContent: 'center' }}>
                      {savingItem ? <Loader2 className="animate-spin" /> : 'Save'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ position: 'relative', paddingTop: '60%' }}>
                    <img src={item.image_url} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: item.status === 'active' ? 'var(--tertiary-color)' : 'var(--text-secondary)', padding: '0.3rem 0.7rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '700' }}>{item.status}</div>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>${item.price}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button onClick={() => handleStartEditItem(item)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}><Edit3 size={16} /> Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={16} /> Delete</button>
                      {item.status === 'active' && <button onClick={() => handleMarkSold(item.id)} className="btn btn-primary" style={{ gridColumn: 'span 2', padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}><CheckCircle size={16} /> Mark as Sold</button>}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {myListings.length === 0 && <p style={{ gridColumn: 'span 3', textAlign: 'center', padding: '2rem' }}>You haven't listed any items yet.</p>}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem' }}><p>Your wishlist is empty.</p></div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default Profile;
