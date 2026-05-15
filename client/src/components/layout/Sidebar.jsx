import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, User, Settings, LogOut, Menu, X, Moon, Sun, Zap } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/team', icon: Users, label: 'Team' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const linkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: isActive ? '600' : '400',
    color: isActive ? 'var(--primary)' : 'var(--text-secondary)', background: isActive ? 'rgba(15,98,254,0.08)' : 'transparent',
    textDecoration: 'none', transition: 'all 0.2s ease', margin: '2px 0',
  });

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 6, background: '#0f62fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>TaskFlow</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ display: 'none' }} id="sidebar-close-desktop">
            <X size={18} />
          </button>
          <style>{`@media(max-width:768px){#sidebar-close-desktop{display:flex!important;}}`}</style>
        </div>

        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} onClick={onClose}
              style={({ isActive }) => linkStyle(isActive)}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <button onClick={toggleDarkMode} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '12px', marginBottom: '4px' }}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px', background: 'var(--bg-tertiary)', marginBottom: '8px' }}>
            <img src={user?.avatar} alt={user?.name} className="avatar-sm" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '12px', color: 'var(--danger)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
