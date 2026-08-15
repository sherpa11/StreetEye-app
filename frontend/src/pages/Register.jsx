import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/api';
import { getErrorMessage } from '../utils/helpers';

export default function Register() {
  const [role, setRole] = useState('citizen');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    firmName: '',
    gstin: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth/2 : 0, y: typeof window !== 'undefined' ? window.innerHeight/2 : 0 });
  const [windowSize, setWindowSize] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1200, h: typeof window !== 'undefined' ? window.innerHeight : 800 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const centerX = windowSize.w / 2;
  const centerY = windowSize.h / 2;
  const deltaX = (mousePos.x - centerX) / centerX;
  const deltaY = (mousePos.y - centerY) / centerY;

  const rotateX = deltaY * -3; 
  const rotateY = deltaX * 3;

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');

    try {
      const res = await authAPI.citizenRegister({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password
      });

      const { token, user } = res.data;
      login(token, user);
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#020617', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative background mesh */}
      <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', opacity: 0.4, backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(29, 78, 216, 0.15), transparent 25%), radial-gradient(circle at 85% 30%, rgba(14, 116, 144, 0.15), transparent 25%)', zIndex: 0 }} />
      
      {/* Subtle parallax background blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(30,58,138,0.2) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, transform: `translate(${deltaX * -20}px, ${deltaY * -20}px)`, transition: 'transform 0.1s ease-out' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(15,23,42,0.8) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, transform: `translate(${deltaX * 20}px, ${deltaY * 20}px)`, transition: 'transform 0.1s ease-out' }} />
      
      {/* Cursor tracking spotlight */}
      <div style={{ 
        position: 'absolute', 
        top: 0, left: 0, 
        transform: `translate(${mousePos.x - 400}px, ${mousePos.y - 400}px)`, 
        width: '800px', height: '800px', 
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 50%)', 
        filter: 'blur(50px)', 
        zIndex: 1, 
        pointerEvents: 'none',
        transition: 'transform 0.1s ease-out'
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '48px 40px',
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.1)`,
        color: 'white',
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out'
      }}>
        
        {/* Subtle Dynamic Refraction Glare */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: '16px',
          background: `linear-gradient(${105 + (deltaX * 15)}deg, transparent 30%, rgba(255,255,255,0.03) ${50 + (deltaX * 20)}%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 2,
          mixBlendMode: 'screen',
          transition: 'background 0.1s ease-out'
        }} />
        
        {/* Content wrapper */}
        <div style={{ transform: 'translateZ(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', cursor: 'pointer', justifyContent: 'center' }} onClick={() => navigate('/')}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
              🛣️
            </div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.3rem', fontWeight: '700', letterSpacing: '-0.5px', color: 'white' }}>StreetEye</span>
          </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.5px', color: 'white', marginBottom: '6px', textAlign: 'center' }}>Create Account</h2>
        <p style={{ color: '#94a3b8', marginBottom: '32px', textAlign: 'center', fontSize: '0.9rem' }}>Join the accountability platform</p>

        {error && (
          <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '8px', padding: '12px 14px', marginBottom: '24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontSize: '1rem' }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <style dangerouslySetInnerHTML={{__html: `
            .glass-input::placeholder { color: #64748b; }
            .glass-input:focus { outline: none; border-color: rgba(59,130,246,0.5) !important; background: rgba(15,23,42,0.8) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important; }
          `}} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.85rem', color: '#e2e8f0' }}>Full Name</label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g., Ravi Kumar"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', transition: 'all 0.2s', boxSizing: 'border-box', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.85rem', color: '#e2e8f0' }}>Phone Number</label>
            <input
              type="tel"
              className="glass-input"
              placeholder="e.g., 9000000001"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', transition: 'all 0.2s', boxSizing: 'border-box', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.85rem', color: '#e2e8f0' }}>Password</label>
            <input
              type="password"
              className="glass-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', transition: 'all 0.2s', boxSizing: 'border-box', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.85rem', color: '#e2e8f0' }}>Confirm Password</label>
            <input
              type="password"
              className="glass-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', transition: 'all 0.2s', boxSizing: 'border-box', fontSize: '0.95rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '0.95rem', marginTop: '4px', background: 'linear-gradient(to bottom, #3b82f6, #2563eb)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}
          >
            {loading ? 'Creating account...' : `Sign up as ${roleConfig[role].label}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#60a5fa', fontWeight: '500', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>

        </div>
      </div>
    </div>
  );
}
