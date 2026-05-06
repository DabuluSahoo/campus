import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Tag, Loader2, X, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Furniture', 'Appliances', 'Clothing'];

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-low', 'price-high'

  useEffect(() => {
    fetchItems();
  }, []);

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

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                           item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Campus Market</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Find the best deals from your fellow students.</p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="glass" 
              placeholder="What are you looking for?"
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
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ borderRadius: '1.25rem', height: '3.5rem' }}
            >
              <Filter size={20} />
              Filters
            </button>

            {showFilters && (
              <div className="glass-card" style={{ 
                position: 'absolute', 
                top: '4rem', 
                right: 0, 
                zIndex: 100, 
                width: '250px', 
                padding: '1.5rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort By</h4>
                  <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowFilters(false)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button 
                    onClick={() => { setSortBy('newest'); setShowFilters(false); }}
                    style={{ background: sortBy === 'newest' ? 'var(--primary-color)' : 'transparent', border: 'none', color: 'white', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Loader2 size={16} /> Newest First
                  </button>
                  <button 
                    onClick={() => { setSortBy('price-low'); setShowFilters(false); }}
                    style={{ background: sortBy === 'price-low' ? 'var(--primary-color)' : 'transparent', border: 'none', color: 'white', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <ArrowUpDown size={16} /> Price: Low to High
                  </button>
                  <button 
                    onClick={() => { setSortBy('price-high'); setShowFilters(false); }}
                    style={{ background: sortBy === 'price-high' ? 'var(--primary-color)' : 'transparent', border: 'none', color: 'white', padding: '0.6rem', borderRadius: '0.5rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <ArrowUpDown size={16} /> Price: High to Low
                  </button>
                </div>
              </div>
            )}
          </div>
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
              padding: '0.5rem 1.5rem',
              whiteSpace: 'nowrap',
              transform: activeCategory === cat ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease'
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
                  <img src={item.image_url} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>
                    ${item.price}
                  </div>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} /> {item.location}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '0.5rem' }}>
                      {item.category}
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
          <Tag size={48} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>No items found in this category.</p>
          <button onClick={() => { setActiveCategory('All'); setSearch(''); }} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Clear All Filters</button>
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
