import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Search, Users, Shield, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Team = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await userAPI.getAll(params);
      setUsers(res.data.data);
    } catch { toast.error('Failed to load team'); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await userAPI.update(userId, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Team</h1><p className="page-subtitle">{users.length} member{users.length !== 1 ? 's' : ''}</p></div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1, maxWidth: '360px' }}>
          <Search size={16} />
          <input className="form-input" placeholder="Search members..." style={{ paddingLeft: '36px' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 'auto', minWidth: '120px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option><option value="admin">Admin</option><option value="member">Member</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {users.map((member, i) => (
          <motion.div key={member._id} className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <img src={member.avatar} alt={member.name} style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--border)' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{member.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <Mail size={12} /> {member.email}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${member.role === 'admin' ? 'badge-accent' : 'badge-info'}`}>
                  <Shield size={10} /> {member.role}
                </span>
                {member.department && <span className="badge badge-default">{member.department}</span>}
              </div>
              {currentUser?.role === 'admin' && member._id !== currentUser.id && (
                <select className="form-input" value={member.role} onChange={e => handleRoleChange(member._id, e.target.value)}
                  style={{ width: 'auto', fontSize: '12px', padding: '4px 8px' }}>
                  <option value="member">Member</option><option value="admin">Admin</option>
                </select>
              )}
            </div>
            {member.bio && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>{member.bio}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Team;
