import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Tag, Loader2, X, TrendingUp, Clock, ArrowRight, ChevronDown } from 'lucide-react';
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
      {/* Cinematic Hero Section */}
      <section style={{ 
        position: 'relative', 
        borderRadius: '2.5rem', 
        overflow: 'hidden', 
        marginBottom: '4rem',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        background: '#050505'
      }}>
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

        <div className="hero-content" style={{ zIndex: 1, padding: '4rem', maxWidth: '750px' }}>
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

          <h1 className="hero-title" style={{ 
            fontSize: '5rem', 
            fontWeight: '900', 
            lineHeight: '0.95', 
            marginBottom: '1.5rem', 
            letterSpacing: '-0.04em',
            color: 'white'
          }}>
            TRADE BETTER.<br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>LIVE SMARTER.</span>
          </h1>

          <p className="hero-desc" style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '2rem', 
            maxWidth: '500px',
            lineHeight: '1.6'
          }}>
            The elite marketplace for university students. 
            Discover premium deals in your campus today.
          </p>
        </div>

        {/* Bouncing Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-secondary)',
          opacity: 0.4,
          animation: 'bounce 2s infinite'
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.2em' }}>SCROLL</span>
          <ChevronDown size={24} />
        </div>
      </section>

      {/* NEW: Product Controls Section */}
      <div className="controls-bar" style={{ marginBottom: '3rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2.5rem',
          flexWrap: 'wrap'
        }}>
          <div className="search-container" style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search premium listings..."
              style={{ 
                width: '100%', 
                padding: '1.5rem 1.5rem 1.5rem 3.75rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'white',
                fontSize: '1.1rem',
                background: 'rgba(255,255,255,0.03)',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="glass filter-btn" 
            style={{ 
              borderRadius: '1.5rem', 
              height: '4.5rem', 
              padding: '0 2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              border: '1px solid var(--border-color)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            <Filter size={20} />
            Filter
          </button>
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              style={{ 
                borderRadius: '1.25rem', 
                padding: '0.8rem 1.5rem',
                whiteSpace: 'nowrap',
                background: activeCategory === cat.name ? 'white' : 'transparent',
                border: activeCategory === cat.name ? '1px solid white' : '1px solid var(--border-color)',
                color: activeCategory === cat.name ? 'black' : 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
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
              <div className="glass-card" style={{ height: '100%', borderRadius: '1.75rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                  <img src={item.image_url} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ 
                    display: 'inline-block',
                    background: 'rgba(139, 92, 246, 0.1)', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '0.5rem', 
                    fontSize: '0.6rem', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    color: '#8b5cf6',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    marginBottom: '0.75rem'
                  }}>
                    {item.category}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'white', lineHeight: '1.4' }}>{item.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>₹{item.price}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={12} /> {item.location}
                      </span>
                    </div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <ArrowRight size={20} color="white" />
                    </div>
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
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2.5rem', borderRadius: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Sort Listings</h2>
              <X size={24} onClick={() => setShowFilters(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { id: 'newest', label: 'Newest Arrivals' },
                { id: 'price-low', label: 'Price: Low to High' },
                { id: 'price-high', label: 'Price: High to Low' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => { setSortBy(opt.id); setShowFilters(false); }}
                  style={{ 
                    padding: '1.25rem', 
                    borderRadius: '1.25rem', 
                    background: sortBy === opt.id ? 'white' : 'rgba(255,255,255,0.03)', 
                    color: sortBy === opt.id ? 'black' : 'white', 
                    border: sortBy === opt.id ? '1px solid white' : '1px solid var(--border-color)', 
                    cursor: 'pointer', 
                    fontWeight: '700',
                    fontSize: '1rem'
                  }}
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
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-12px) translateX(-50%); }
          60% { transform: translateY(-6px) translateX(-50%); }
        }

        @media (max-width: 768px) {
          .hero-content { padding: 2.5rem 1.5rem !important; }
          .hero-title { fontSize: 3rem !important; }
          .hero-desc { fontSize: 1rem !important; }
          .search-container { min-width: 100% !important; }
          .filter-btn { width: 100% !important; justify-content: center !important; height: 3.5rem !important; }
        }

        .search-input:focus {
          border-color: rgba(139, 92, 246, 0.5) !important;
          background: rgba(139, 92, 246, 0.05) !important;
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.1);
        }
        
        div::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default Dashboard;
