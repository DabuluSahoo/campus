import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Tag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Furniture', 'Appliances', 'Clothing'];

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error("Error fetching items: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Find what you need.</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="glass" 
              placeholder="Search items, textbooks, gadgets..."
              style={{ 
                width: '100%', 
                padding: '1rem 1rem 1rem 3.5rem',
                borderRadius: '1.25rem',
                border: '1px solid var(--border-color)',
                color: 'white',
                fontSize: '1rem'
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" style={{ borderRadius: '1.25rem' }}>
            <Filter size={20} />
            Filters
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              borderRadius: '2rem', 
              padding: '0.5rem 1.25rem',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
        </div>
      ) : (
        <div className="grid-container grid-2 grid-3 grid-4">
          {filteredItems.map(item => (
            <Link key={item.id} to={`/item/${item.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: '0.75rem', 
                    right: '0.75rem', 
                    background: 'rgba(0,0,0,0.6)', 
                    backdropFilter: 'blur(8px)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '2rem',
                    fontWeight: '700',
                    color: 'white',
                    fontSize: '0.9rem'
                  }}>
                    ${item.price}
                  </div>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {item.location}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}>
                      <Tag size={14} /> {item.category}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{ fontSize: '1.25rem' }}>No items found matching your search.</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default Dashboard;
