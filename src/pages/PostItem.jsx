import React, { useState } from 'react';
import { Upload, MapPin, DollarSign, Loader2, X, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const PostItem = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  
  // Multiple images state
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files].slice(0, 5); // Limit to 5 images
      setSelectedFiles(newFiles);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    if (selectedFiles.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls = [];

      // 1. Upload all images to Supabase Storage
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }

      // 2. Save to Database - Storing multiple images as a JSON string in the existing image_url column
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
            image_url: JSON.stringify(uploadedUrls), // Pack all images into this one column
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
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>List an Item</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Upload up to 5 photos to make your listing stand out.</p>
      </header>

      <div className="post-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Item Images (First image is wallpaper)</label>
            
            {/* Main Preview */}
            <div 
              className="glass" 
              style={{ 
                height: '380px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '2rem',
                border: '2px dashed rgba(255,255,255,0.1)',
                marginBottom: '1rem'
              }}
            >
              {imagePreviews.length > 0 ? (
                <img src={imagePreviews[0]} alt="Upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }} onClick={() => document.getElementById('imageInput').click()}>
                  <Upload size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Click to upload main photo</p>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery Preview */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '1rem', overflow: 'hidden', border: index === 0 ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeImage(index)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '2px', color: 'white', cursor: 'pointer' }}><X size={12} /></button>
                </div>
              ))}
              
              {imagePreviews.length < 5 && (
                <button 
                  onClick={() => document.getElementById('imageInput').click()}
                  style={{ width: '70px', height: '70px', borderRadius: '1rem', border: '2px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Plus size={24} />
                </button>
              )}
            </div>

            <input 
              id="imageInput" 
              type="file" 
              hidden 
              multiple
              accept="image/*" 
              onChange={handleImagesUpload}
            />
          </div>
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
                <option>Others</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Price (₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>₹</span>
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

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: '3.5rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'List Item Now'}
          </button>
        </form>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        @media (max-width: 768px) {
          .post-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
};

export default PostItem;
