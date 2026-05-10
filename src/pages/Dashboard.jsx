import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Tag, Loader2, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CATEGORIES = [
  { name: 'All', icon: <TrendingUp size={18} /> },
  { name: 'Books', icon: <Tag size={18} /> },
  { name: 'Electronics', icon: <Tag size={18} /> },
  { name: 'Furniture', icon: <Tag size={18} /> },
  { name: 'Appliances', icon: <Tag size={18} /> },
  { name: 'Clothing', icon: <Tag size={18} /> }
];

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

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
    <div className="animate-fade-in" style={{ padding: '0 1rem' }}>
      {/* Clean Hero Section */}
      <section style={{ 
        position: 'relative', 
        borderRadius: '2.5rem', 
        overflow: 'hidden', 
        marginBottom: '4rem',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        background: '#050505'
      }}>
        {/* Background Image with Clean Mask */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60%',
          height: '100%',
          zIndex: 0
        }}>
          <img 
            src="/dashboard_hero_elite.png" 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #050505 0%, rgba(5,5,5,0.8) 30%, transparent 100%)'
          }}></div>
        </div>

        {/* Content Area */}
        <div style={{ zIndex: 1, padding: '4rem', maxWidth: '700px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'rgba(139, 92, 246, 0.1)', 
            padding: '0.5rem 1rem', 
            borderRadius: '1rem', 
            color: '#8b5cf6', 
            marginBottom: '2rem', 
            fontSize: '0.8rem', 
            fontWeight: '700', 
            letterSpacing: '0.1em',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <TrendingUp size={16} /> TRENDING ON CAMPUS
          </div>

          <h1 style={{ 
            fontSize: '4.5rem', 
            fontWeight: '900', 
            lineHeight: '1', 
            marginBottom: '1.5rem', 
            letterSpacing: '-0.04em',
            color: 'white'
          }}>
            Trade Better.<br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Live Smarter.</span>
          </h1>

          <p style={{ 
            fontSize: '1.2rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '3rem', 
            maxWidth: '500px',
            lineHeight: '1.6'
          }}>
            The ultra-clean marketplace for university students. 
            Discover premium deals in your campus today.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '400px' }}>
              <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search listings..."
                style={{ 
                  width: '100%', 
                  padding: '1.25rem 1.25rem 1.25rem 3.5rem',
                  borderRadius: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  outline: 'none'
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="glass" 
              style={{ 
                borderRadius: '1.25rem', 
                height: '3.75rem', 
                padding: '0 1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                border: '1px solid var(--border-color)',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              style={{ 
                borderRadius: '1rem', 
                padding: '0.8rem 1.5rem',
                whiteSpace: 'nowrap',
                background: activeCategory === cat.name ? 'white' : 'transparent',
                border: activeCategory === cat.name ? '1px solid white' : '1px solid var(--border-color)',
                color: activeCategory === cat.name ? 'black' : 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'var(--transition-smooth)'
              }}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div className="loader-ring"></div>
        </div>
      ) : (
        <div className="grid-container grid-2 grid-3 grid-4">
          {filteredItems.map(item => (
            <Link key={item.id} to={`/item/${item.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ height: '100%', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                  <img src={item.image_url} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem', 
                    background: 'rgba(255,255,255,0.9)', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '0.75rem', 
                    fontWeight: '800', 
                    color: 'black', 
                    fontSize: '0.9rem'
                  }}>
                    ₹{item.price}
                  </div>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{item.category}</div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'white' }}>{item.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {item.location}
                    </span>
                    <ArrowRight size={16} color="var(--text-secondary)" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', borderRadius: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h3>Sort Listings</h3>
              <X size={24} onClick={() => setShowFilters(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { id: 'newest', label: 'Newest First' },
                { id: 'price-low', label: 'Price: Low to High' },
                { id: 'price-high', label: 'Price: High to Low' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => { setSortBy(opt.id); setShowFilters(false); }}
                  style={{ padding: '1rem', borderRadius: '1rem', background: sortBy === opt.id ? 'white' : 'transparent', color: sortBy === opt.id ? 'black' : 'white', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: '600' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .loader-ring { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        div::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default Dashboard;
