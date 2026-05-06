import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setVerificationSent(false);
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
              trust_score: 100
            }
          }
        });
        if (error) throw error;
        if (data.user && data.session === null) {
          setVerificationSent(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh'
    }}>
      <div className="glass-card" style={{
        padding: '3rem',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>
          {isRegister ? 'Join Campus Market' : 'Welcome Back'}
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          {isRegister ? 'Start selling and buying within your campus.' : 'The premium student marketplace.'}
        </p>

        {verificationSent ? (
          <div className="glass" style={{ padding: '2rem', borderColor: 'var(--tertiary-color)' }}>
            <CheckCircle size={48} style={{ color: 'var(--tertiary-color)', marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Verify your email</h2>
            <p>We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to activate your account.</p>
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '1.5rem' }}
              onClick={() => setIsRegister(false)}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ textAlign: 'left' }}>
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="your@email.com"
                  style={{ paddingLeft: '3rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group" style={{ textAlign: 'left' }}>
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••"
                  style={{ paddingLeft: '3rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isRegister ? <UserPlus size={20} /> : <LogIn size={20} />
              )}
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            <button 
              type="button" 
              onClick={async () => {
                setLoading(true);
                const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                if (error) setError(error.message);
                setLoading(false);
              }}
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '0.5rem' }} />
              Continue with Google
            </button>
          </form>
        )}

        <p style={{ marginTop: '2rem', fontSize: '0.9375rem' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button 
            onClick={() => setIsRegister(!isRegister)}
            disabled={loading}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary-color)', 
              fontWeight: '600', 
              cursor: 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
};

export default Login;
