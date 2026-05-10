import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogIn, Rocket, ShieldCheck, Sparkles, Loader2, Mail } from 'lucide-react';

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
          src="/login_bg_premium_1778410137262.png" 
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
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            borderRadius: '22px',
            margin: '0 auto 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px var(--primary-glow)',
            transform: 'rotate(-5deg)'
          }}>
            <LogIn size={40} color="white" />
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
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="" style={{ width: '24px', height: '24px', filter: 'brightness(10)' }} />
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
