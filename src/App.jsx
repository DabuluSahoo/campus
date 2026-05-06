import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusSquare, 
  MessageSquare, 
  User, 
  LogOut,
  ShoppingBag,
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

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (err) {
        console.error("Auth session error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Safety timeout to prevent infinite blank screen
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const Navbar = () => (
    <nav className="glass" style={{
      position: 'fixed',
      top: '1rem',
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
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
    }}>
      <Link to="/" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        textDecoration: 'none',
        color: 'var(--text-primary)',
        fontWeight: '700',
        fontSize: '1.25rem'
      }}>
        <ShoppingBag className="text-primary" style={{ color: 'var(--primary-color)' }} />
        <span>Campus<span style={{ color: 'var(--primary-color)' }}>Market</span></span>
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/dashboard" className="nav-link"><LayoutDashboard size={20} /></Link>
        <Link to="/post" className="nav-link"><PlusSquare size={20} /></Link>
        <Link to="/chat" className="nav-link"><MessageSquare size={20} /></Link>
        <Link to="/profile" className="nav-link"><User size={20} /></Link>
        <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <LogOut size={20} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          color: var(--text-secondary);
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }
        .nav-link:hover {
          color: var(--primary-color);
          background: rgba(255, 255, 255, 0.05);
        }
      `}} />
    </nav>
  );

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0b' }}>
      <Loader2 className="animate-spin" size={40} color="#6366f1" />
    </div>
  );

  return (
    <Router>
      <div style={{ paddingTop: '7rem', paddingBottom: '2rem', paddingLeft: '1rem', paddingRight: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {session && <Navbar />}
        <Routes>
          <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/post" element={session ? <PostItem /> : <Navigate to="/login" />} />
          <Route path="/item/:id" element={session ? <ItemDetails /> : <Navigate to="/login" />} />
          <Route path="/chat" element={session ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
