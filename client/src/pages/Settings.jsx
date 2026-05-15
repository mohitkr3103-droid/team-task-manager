import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Moon, Sun, Lock, Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage your preferences</p></div></div>

      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Appearance */}
        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {darkMode ? <Moon size={18} /> : <Sun size={18} />} Appearance
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>Dark Mode</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Toggle between light and dark themes</p>
            </div>
            <button onClick={toggleDarkMode}
              style={{ width: 52, height: 28, borderRadius: 14, background: darkMode ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: darkMode ? 27 : 3, transition: 'all 0.3s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} /> Account
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Email</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Role</span>
              <span className={`badge ${user?.role === 'admin' ? 'badge-accent' : 'badge-info'}`}>{user?.role}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Joined</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                {new Date(user?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} /> Change Password
          </h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              <Save size={16} /> {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
