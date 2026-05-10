import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Tag, Loader2, X, ArrowUpDown, Sparkles, TrendingUp, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CATEGORIES = [
  { name: 'All', icon: <Sparkles size={18} /> },
  { name: 'Books', icon: <Zap size={18} /> },
  { name: 'Electronics', icon: <Zap size={18} /> },
  { name: 'Furniture', icon: <Zap size={18} /> },
  { name: 'Appliances', icon: <Zap size={18} /> },
  { name: 'Clothing', icon: <Zap size={18} /> }
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
    <div className="animate-fade-in">
      {/* Dynamic Hero Section */}
      <section style={{ 
        position: 'relative', 
        borderRadius: '3rem', 
        overflow: 'hidden', 
        marginBottom: '4rem',
        minHeight: '450px',
        display: 'flex',
        alignItems: 'center',
        padding: '4rem'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}>
          <img 
            src="/dashboard_hero_elite_1778410177351.png" 
            alt="Hero" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.4) 60%, transparent 100%)'
          }}></div>
        </div>

        <div style={{ zIndex: 1, maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)', marginBottom: '1.5rem', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            <TrendingUp size={20} /> Trending on Campus
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '900', lineHeight: '0.9', marginBottom: '1.5rem', letterSpacing: '-0.05em' }}>
            TRADE <span style={{ color: 'var(--primary-color)' }}>SMARTER</span><br />
            LIVE BETTER.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '450px' }}>
            Unlock exclusive student deals and turn your clutter into cash with the next-gen marketplace.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
              <Search size={24} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="glass" 
                placeholder="Search premium listings..."
                style={{ 
                  width: '100%', 
                  padding: '1.25rem 1.25rem 1.25rem 4rem',
                  borderRadius: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '1.1rem',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)'
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary" 
              style={{ borderRadius: '1.5rem', height: '4rem', padding: '0 2rem', fontSize: '1rem' }}
            >
              <Filter size={20} />
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* Modern Categories */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Tag size={24} color="var(--primary-color)" /> Browse Categories
        </h2>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className="glass-card"
              style={{ 
                borderRadius: '1.25rem', 
                padding: '1rem 2rem',
                whiteSpace: 'nowrap',
                background: activeCategory === cat.name ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                border: activeCategory === cat.name ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transform: activeCategory === cat.name ? 'translateY(-5px)' : 'none',
                boxShadow: activeCategory === cat.name ? '0 10px 20px var(--primary-glow)' : 'none'
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
              <div className="glass-card" style={{ height: '100%', borderRadius: '1.75rem', overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '110%' }}>
                  <img src={item.image_url} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '1rem', 
                    right: '1rem', 
                    background: 'rgba(5,5,5,0.8)', 
                    backdropFilter: 'blur(12px)', 
                    padding: '0.6rem 1.2rem', 
                    borderRadius: '1.25rem', 
                    fontWeight: '800', 
                    color: 'white', 
                    fontSize: '1.2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                  }}>
                    ₹{item.price}
                  </div>
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(124, 58, 237, 0.8)', padding: '0.4rem 0.8rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {item.category}
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: '1.3' }}>{item.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="var(--primary-color)" /> {item.location}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> 2d ago
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '8rem 0' }}>
          <div className="glass-card" style={{ display: 'inline-block', padding: '3rem', borderRadius: '2.5rem' }}>
            <Tag size={60} style={{ marginBottom: '1.5rem', opacity: 0.1, color: 'var(--primary-color)' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No premium items found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search terms.</p>
            <button onClick={() => { setActiveCategory('All'); setSearch(''); }} className="btn btn-primary" style={{ marginTop: '2rem' }}>Reset Experience</button>
          </div>
        </div>
      )}

      {/* Sorting Modal (Redesigned) */}
      {showFilters && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Smart Filters</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowFilters(false)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { id: 'newest', label: 'Newest Arrivals', icon: <Clock size={20} /> },
                { id: 'price-low', label: 'Price: Low to High', icon: <TrendingUp size={20} /> },
                { id: 'price-high', label: 'Price: High to Low', icon: <TrendingUp size={20} style={{ transform: 'rotate(180deg)' }} /> }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => { setSortBy(opt.id); setShowFilters(false); }}
                  className="glass"
                  style={{ 
                    padding: '1.25rem', 
                    borderRadius: '1.25rem', 
                    border: sortBy === opt.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: sortBy === opt.id ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .loader-ring {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(124, 58, 237, 0.1);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* Category Scrollbar Hide */
        div::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default Dashboard;
