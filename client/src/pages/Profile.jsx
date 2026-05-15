import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { motion } from 'framer-motion';
import { User, Mail, Save, Camera, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ name: user?.name || '', bio: user?.bio || '', department: user?.department || '', avatar: user?.avatar || '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Profile</h1><p className="page-subtitle">Manage your personal information</p></div></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <motion.div className="card" style={{ padding: '32px', textAlign: 'center' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
            <img src={avatarPreview || user?.avatar} alt={user?.name} style={{ width: 96, height: 96, borderRadius: '50%', border: '4px solid var(--border)', objectFit: 'cover' }} />
            <label style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg-primary)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <Camera size={14} color="white" />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </label>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{user?.name}</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>{user?.email}</p>
          <span className={`badge ${user?.role === 'admin' ? 'badge-accent' : 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          {user?.department && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px' }}><Briefcase size={14} style={{ verticalAlign: 'middle' }} /> {user?.department}</p>}
          {user?.bio && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>{user?.bio}</p>}
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Edit Form */}
        <motion.div className="card" style={{ padding: '32px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-primary)' }}>Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: '38px' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: '38px' }} placeholder="e.g. Engineering" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} placeholder="Tell us about yourself..." value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
