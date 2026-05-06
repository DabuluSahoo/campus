import React, { useState, useEffect } from 'react';
import { User, Package, Heart, Star, Edit3, Trash2, CheckCircle, Loader2, Save, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editHostel, setEditHostel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch profile from our new profiles table
      const { data: profile, error: profileError } = await supabase
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
        .eq('seller_id', user.id);
      
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
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName,
          hostel: editHostel,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setUserData(prev => ({ ...prev, name: editName, hostel: editHostel }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
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
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
      <div className="glass-card" style={{ padding: '3rem', marginBottom: '3rem', display: 'flex', gap: '3rem', alignItems: 'center', position: 'relative' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={60} color="white" />
        </div>
        
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Your Full Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Your Hostel/Location"
                value={editHostel}
                onChange={(e) => setEditHostel(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  <X size={18} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{userData?.name}</h1>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                {userData?.email} • <span style={{ color: 'var(--primary-color)' }}>{userData?.hostel}</span>
              </p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {myListings.filter(i => i.status === 'sold').length}
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Items Sold</p>
                </div>
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--tertiary-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {userData?.trustScore || 100} <Star size={18} fill="var(--tertiary-color)" />
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating</p>
                </div>
              </div>
            </>
          )}
        </div>
        {!isEditing && (
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
            <Edit3 size={18} /> Edit Profile
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem' }}>
        <button 
          onClick={() => setActiveTab('listings')}
          style={{ 
            padding: '1rem 0.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'listings' ? '3px solid var(--primary-color)' : '3px solid transparent',
            color: activeTab === 'listings' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <Package size={20} /> My Listings ({myListings.length})
        </button>
        <button 
          onClick={() => setActiveTab('wishlist')}
          style={{ 
            padding: '1rem 0.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'wishlist' ? '3px solid var(--primary-color)' : '3px solid transparent',
            color: activeTab === 'wishlist' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <Heart size={20} /> Wishlist (0)
        </button>
      </div>

      {activeTab === 'listings' ? (
        <div className="grid-container grid-2 grid-3">
          {myListings.map(item => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', paddingTop: '60%' }}>
                <img src={item.image_url} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ 
                  position: 'absolute', 
                  top: '0.75rem', 
                  left: '0.75rem', 
                  background: item.status === 'active' ? 'var(--tertiary-color)' : 'var(--text-secondary)',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '2rem',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {item.status}
                </div>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>${item.price}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                    <Edit3 size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center', color: '#ef4444' }}>
                    <Trash2 size={16} /> Delete
                  </button>
                  {item.status === 'active' && (
                    <button onClick={() => handleMarkSold(item.id)} className="btn btn-primary" style={{ gridColumn: 'span 2', padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                      <CheckCircle size={16} /> Mark as Sold
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {myListings.length === 0 && <p style={{ gridColumn: 'span 3', textAlign: 'center', padding: '2rem' }}>You haven't listed any items yet.</p>}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <p>Your wishlist is empty.</p>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default Profile;
