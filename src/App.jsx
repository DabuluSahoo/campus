import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusSquare, 
  MessageSquare, 
  User, 
  LogOut,
  Loader2,
  Menu,
  X,
  ChevronRight
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
      .select('avatar_url')
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
        borderRadius: '1.25rem',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
          <Logo size={36} />
        </Link>

        {/* Right Side Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Desktop Only Links */}
          <div className="desktop-links" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/dashboard" className="nav-link"><LayoutDashboard size={20} /></Link>
            <Link to="/post" className="nav-link"><PlusSquare size={20} /></Link>
            <Link to="/chat" className="nav-link"><MessageSquare size={20} /></Link>
          </div>

          {/* Quick Access Mobile + Desktop */}
          <Link to="/post" className="nav-link mobile-only-link"><PlusSquare size={22} /></Link>
          <Link to="/profile" className="nav-link" style={{ padding: '0.5rem' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="P" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
            ) : <User size={22} />}
          </Link>

          {/* Hamburger Icon */}
          <button className="mobile-menu-btn" onClick={toggleMenu} style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            padding: '0.5rem'
          }}>
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {/* Desktop Only Logout */}
          <button onClick={handleLogout} className="nav-link desktop-links logout-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
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
        padding: '8rem 2rem 2rem',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isMenuOpen ? 1 : 0,
        visibility: isMenuOpen ? 'visible' : 'hidden',
        transform: isMenuOpen ? 'translateY(0)' : 'translateY(-20px)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            { to: '/dashboard', label: 'Marketplace', icon: <LayoutDashboard size={24} /> },
            { to: '/post', label: 'Post Listing', icon: <PlusSquare size={24} /> },
            { to: '/chat', label: 'Messages', icon: <MessageSquare size={24} /> },
            { 
              to: '/profile', 
              label: 'My Profile', 
              icon: profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : <User size={24} /> 
            }
          ].map(link => (
            <Link 
              key={link.to} 
              to={link.to} 
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderRadius: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'var(--primary-color)' }}>{link.icon}</span>
                {link.label}
              </div>
              <ChevronRight size={20} color="var(--text-secondary)" />
            </Link>
          ))}
          <button 
            onClick={() => { handleLogout(); setIsMenuOpen(false); }}
            style={{ 
              marginTop: '2rem',
              padding: '1.5rem',
              borderRadius: '1.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '1.25rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}
          >
            <LogOut size={24} /> Logout Account
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mobile-menu-btn { display: none; }
        .mobile-only-link { display: none; }
        .desktop-links { display: flex; }
        
        @media (max-width: 800px) {
          .desktop-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-only-link { display: flex !important; }
          .app-container { padding-top: 6.5rem !important; }
        }
        
        @media (min-width: 801px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-only-link { display: none !important; }
          .desktop-links { display: flex !important; }
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
        .logout-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
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
