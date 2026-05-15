import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#0f62fe', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Zap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in to your TaskFlow account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" type="email" placeholder="you@example.com" style={{ paddingLeft: '38px' }}
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" style={{ paddingLeft: '38px', paddingRight: '38px' }}
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
