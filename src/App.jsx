import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusSquare, 
  MessageSquare, 
  User, 
  LogOut,
  Loader2
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

  const Navbar = () => (
    <>
      {/* Desktop Top Nav */}
      <nav className="desktop-nav glass" style={{
        position: 'fixed',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1200px',
        height: '4.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 1000,
        borderRadius: '1.5rem'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size={40} />
        </Link>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/dashboard" className="nav-link"><LayoutDashboard size={20} /></Link>
          <Link to="/post" className="nav-link"><PlusSquare size={20} /></Link>
          <Link to="/chat" className="nav-link"><MessageSquare size={20} /></Link>
          <Link to="/profile" className="nav-link">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="P" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : <User size={20} />}
          </Link>
          <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav glass" style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '1rem',
        right: '1rem',
        height: '4.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        borderRadius: '1.5rem',
        padding: '0 1rem'
      }}>
        <Link to="/dashboard" className="nav-link"><LayoutDashboard size={24} /></Link>
        <Link to="/post" className="nav-link"><PlusSquare size={24} /></Link>
        <div style={{ transform: 'translateY(-1.5rem)' }}>
           <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: 'var(--primary-color)', 
              padding: '1rem', 
              borderRadius: '50%', 
              boxShadow: '0 10px 25px var(--primary-glow)',
              border: '4px solid #050505'
            }}>
              <Logo size={32} showText={false} />
            </div>
          </Link>
        </div>
        <Link to="/chat" className="nav-link"><MessageSquare size={24} /></Link>
        <Link to="/profile" className="nav-link">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="P" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : <User size={24} />}
        </Link>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .desktop-nav { display: flex; }
        .mobile-nav { display: none; }
        
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
          .desktop-nav { display: flex !important; }
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
          
          /* Adjust main container padding for mobile */
          .app-container { 
            padding-top: 2rem !important; 
            padding-bottom: 7rem !important; 
          }
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
        .nav-link:hover, .nav-link.active {
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
        paddingTop: session ? '7.5rem' : '0',
        paddingBottom: '2rem',
        maxWidth: '1300px', 
        margin: '0 auto',
        transition: 'all 0.3s'
      }}>
        {session && <Navbar />}
        <main>
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
