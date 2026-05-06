import React, { useState } from 'react';
import { Sparkles, Upload, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const PostItem = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      simulateAIScan();
    }
  };

  const simulateAIScan = () => {
    setIsScanning(true);
    setAiSuggestion(null);
    setTimeout(() => {
      setIsScanning(false);
      setAiSuggestion({
        min: 20,
        max: 35,
        confidence: 'High',
        type: 'Electronics - Peripheral'
      });
    }, 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f';

      // 1. Upload Image to Supabase Storage
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }

      // 3. Save to Database
      const { error: dbError } = await supabase
        .from('items')
        .insert([
          {
            title,
            description,
            category,
            price: parseFloat(price),
            location,
            seller_id: user.id,
            seller_email: user.email,
            image_url: finalImageUrl,
            status: 'active'
          }
        ]);
      
      if (dbError) throw dbError;
      navigate('/dashboard');
    } catch (error) {
      console.error("Error processing request: ", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>List an Item</h1>
        <p>Complete the details below to reach thousands of students.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Item Image</label>
            <div 
              className="glass" 
              style={{ 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('imageInput').click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Upload size={40} style={{ marginBottom: '1rem' }} />
                  <p>Click to upload image</p>
                </div>
              )}
              <input 
                id="imageInput" 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {isScanning && (
            <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'var(--primary-color)' }}>
              <Loader2 className="animate-spin text-primary" style={{ color: 'var(--primary-color)' }} />
              <div>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>AI is analyzing your image...</p>
                <p style={{ fontSize: '0.85rem' }}>Identifying product and market trends.</p>
              </div>
            </div>
          )}

          {aiSuggestion && (
            <div className="glass" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--primary-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
                <Sparkles size={18} />
                <span style={{ fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>AI Price Suggestion</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>${aiSuggestion.min} - ${aiSuggestion.max}</h2>
              <p style={{ fontSize: '0.85rem' }}>Detected as: <strong>{aiSuggestion.type}</strong></p>
              <button 
                type="button"
                className="btn btn-secondary" 
                style={{ marginTop: '1rem', width: '100%', fontSize: '0.85rem' }}
                onClick={() => setPrice(aiSuggestion.min)}
              >
                Apply Mid-Range Price
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Item Title</label>
            <input type="text" className="input-field" placeholder="What are you selling?" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select Category</option>
                <option>Books</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Appliances</option>
                <option>Clothing</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Price ($)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input type="number" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Hostel Location</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="e.g. Hostel A, Room 302" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '120px', resize: 'vertical' }} 
              placeholder="Describe the item's condition and any details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: '3.5rem', fontSize: '1.1rem' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'List Item Now'}
          </button>
        </form>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default PostItem;
