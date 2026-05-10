import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusSquare, 
  MessageSquare, 
  User, 
  LogOut,
  Loader2,
  ChevronRight,
  Settings
} from 'lucide-react';
import { supabase } from './supabaseClient';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostItem from './pages/PostItem';
import ItemDetails from './pages/ItemDetails';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Logo from './components/Logo';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) fetchUserProfile(session.user.id);
      } catch (err) {
        console.error("Auth session error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, hostel')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const Navbar = () => (
    <>
      <nav className="global-nav glass" style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '95%',
        maxWidth: '1200px',
        height: '4.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 2000,
        borderRadius: '1.5rem',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
          <Logo size={36} />
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Desktop Only Links */}
          <div className="desktop-links" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/dashboard" className="nav-link"><LayoutDashboard size={20} /></Link>
            <Link to="/post" className="nav-link"><PlusSquare size={20} /></Link>
            <Link to="/chat" className="nav-link"><MessageSquare size={20} /></Link>
          </div>

          {/* Unified Avatar Trigger (Mobile & Desktop) */}
          <button onClick={toggleMenu} style={{ 
            background: 'none', 
            border: 'none', 
            padding: '2px', 
            cursor: 'pointer',
            borderRadius: '50%',
            transition: 'transform 0.2s'
          }}
          className="avatar-trigger"
          >
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              overflow: 'hidden', 
              border: isMenuOpen ? '2px solid var(--primary-color)' : '2px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <User size={20} color="white" />}
            </div>
          </button>

          {/* Desktop Only Logout */}
          <button onClick={handleLogout} className="nav-link desktop-links logout-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile-First Profile Dropdown Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        background: 'rgba(5,5,5,0.98)',
        backdropFilter: 'blur(30px)',
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column',
        padding: '7rem 1.5rem 2rem',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isMenuOpen ? 1 : 0,
        visibility: isMenuOpen ? 'visible' : 'hidden',
        transform: isMenuOpen ? 'translateY(0)' : 'translateY(-20px)'
      }}>
        {/* User Header Section */}
        <div style={{ 
          padding: '2rem', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '2rem', 
          border: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
           <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              overflow: 'hidden', 
              border: '3px solid var(--primary-color)',
              marginBottom: '1rem',
              boxShadow: '0 10px 30px var(--primary-glow)'
            }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <User size={40} color="white" style={{ marginTop: '15px' }} />}
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.25rem' }}>{profile?.full_name || 'Student'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{session?.user.email}</p>
            
            <Link to="/profile" onClick={() => setIsMenuOpen(false)} style={{ 
              marginTop: '1.5rem', 
              color: 'var(--primary-color)', 
              textDecoration: 'none', 
              fontWeight: '700',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              View Profile <ChevronRight size={16} />
            </Link>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { to: '/dashboard', label: 'Marketplace', icon: <LayoutDashboard size={22} /> },
            { to: '/post', label: 'Post New Item', icon: <PlusSquare size={22} /> },
            { to: '/chat', label: 'Messages & Chats', icon: <MessageSquare size={22} /> },
          ].map(link => (
            <Link 
              key={link.to} 
              to={link.to} 
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderRadius: '1.25rem',
                background: 'rgba(255,255,255,0.02)',
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{link.icon}</span>
                {link.label}
              </div>
              <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
            </Link>
          ))}
          
          <button 
            onClick={() => { handleLogout(); setIsMenuOpen(false); }}
            style={{ 
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: '1.25rem',
              background: 'rgba(239, 68, 68, 0.05)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              fontSize: '1.1rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer'
            }}
          >
            <LogOut size={22} /> Logout Account
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .desktop-links { display: flex; }
        .avatar-trigger:hover { transform: scale(1.05); }
        
        @media (max-width: 800px) {
          .desktop-links { display: none !important; }
          .app-container { padding-top: 6.5rem !important; }
        }
        
        @media (min-width: 801px) {
          .desktop-links { display: flex !important; }
          .mobile-menu { width: 350px !important; height: auto !important; border-radius: 2rem !important; right: 2.5% !important; left: auto !important; top: 6rem !important; border: 1px solid rgba(255,255,255,0.1) !important; padding: 2rem !important; box-shadow: 0 30px 60px rgba(0,0,0,0.5) !important; }
        }
        
        .nav-link {
          color: var(--text-secondary);
          padding: 0.75rem;
          border-radius: 1rem;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-link:hover {
          color: white;
          background: rgba(255,255,255,0.05);
        }
      `}} />
    </>
  );

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
    </div>
  );

  return (
    <Router>
      <div className="app-container" style={{ 
        minHeight: '100vh',
        paddingTop: session ? '7rem' : '0',
        paddingBottom: '2rem',
        maxWidth: '1300px', 
        margin: '0 auto',
        transition: 'all 0.3s'
      }}>
        {session && <Navbar />}
        <main style={{ padding: '0 1rem' }}>
          <Routes>
            <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/dashboard" element={session ? <Dashboard /> : <Login />} />
            <Route path="/post" element={session ? <PostItem /> : <Login />} />
            <Route path="/item/:id" element={session ? <ItemDetails /> : <Login />} />
            <Route path="/chat" element={session ? <Chat /> : <Login />} />
            <Route path="/profile" element={session ? <Profile /> : <Login />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
