import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogIn, Rocket, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/dashboard');
    };
    checkUser();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://campus-rho-three.vercel.app/dashboard',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error.message);
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: '#050505'
    }}>
      {/* Immersive Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <img 
          src="/login_bg_premium.png" 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} 
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, transparent, #050505)'
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="login-float" style={{ position: 'absolute', top: '20%', left: '10%', opacity: 0.3 }}><Sparkles size={100} color="var(--primary-color)" /></div>
      <div className="login-float-delayed" style={{ position: 'absolute', bottom: '15%', right: '12%', opacity: 0.2 }}><Rocket size={120} color="var(--secondary-color)" /></div>

      <div className="animate-fade-in" style={{ zIndex: 1, width: '100%', maxWidth: '480px', padding: '20px' }}>
        <div className="glass-card" style={{ 
          padding: '3.5rem', 
          borderRadius: '2.5rem', 
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 80px rgba(124, 58, 237, 0.15)'
        }}>
          <div style={{ margin: '0 auto 2.5rem', display: 'flex', justifyContent: 'center' }}>
            <Logo size={80} showText={false} />
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.04em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Elevate Your Campus Life
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
            The elite marketplace designed exclusively for students. Buy, sell, and trade with trust.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                height: '4rem', 
                fontSize: '1.1rem',
                borderRadius: '1.25rem',
                gap: '1rem',
                background: 'white',
                color: '#1f2937'
              }}
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secured by Supabase</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1rem', borderRadius: '1.25rem', textAlign: 'center' }}>
                <ShieldCheck size={20} style={{ color: 'var(--tertiary-color)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.75rem', fontWeight: '600' }}>Verified Only</p>
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: '1.25rem', textAlign: 'center' }}>
                <Sparkles size={20} style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.75rem', fontWeight: '600' }}>Smart Pricing</p>
              </div>
            </div>
          </div>
        </div>
        
        <p style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
          By continuing, you agree to the Campus Market Terms of Service.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .login-float { animation: float 8s ease-in-out infinite; }
        .login-float-delayed { animation: float 10s ease-in-out infinite reverse; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default Login;
