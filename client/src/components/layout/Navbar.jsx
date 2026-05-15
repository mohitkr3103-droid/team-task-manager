import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Bell, Moon, Sun, Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { taskAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await taskAPI.getAll();
        const allTasks = res.data.data;
        // Generate notifications from tasks
        const notifs = [];
        allTasks.forEach(t => {
          // Check if assigned to current user
          const isAssigned = typeof t.assignee === 'object' ? t.assignee?._id === user?.id : t.assignee === user?.id;
          if (isAssigned && t.status !== 'completed') {
            if (new Date(t.dueDate) < new Date()) {
              notifs.push({ id: t._id, type: 'overdue', message: `Task "${t.title}" is overdue!`, time: t.dueDate });
            } else if (t.priority === 'high') {
              notifs.push({ id: t._id, type: 'urgent', message: `High priority task assigned: "${t.title}"`, time: t.createdAt });
            }
          }
        });
        // Sort by time desc
        notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
        setNotifications(notifs.slice(0, 5)); // show top 5
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-ghost btn-sm" onClick={onMenuClick} id="mobile-menu-btn" style={{ display: 'none' }}>
          <Menu size={20} />
        </button>
        <style>{`@media(max-width:768px){#mobile-menu-btn{display:flex!important;}}`}</style>
        <div className="search-bar" style={{ display: 'none' }} id="navbar-search">
          <Search size={16} />
          <input className="form-input" placeholder="Search..." style={{ width: '280px', paddingLeft: '36px', height: '38px' }} />
        </div>
        <style>{`@media(min-width:768px){#navbar-search{display:block!important;}}`}</style>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="btn btn-ghost btn-sm" onClick={toggleDarkMode} title="Toggle theme">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowDropdown(!showDropdown)} title="Notifications">
            <Bell size={18} />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} />
            )}
          </button>
          
          {showDropdown && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '320px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Notifications</h3>
                <span style={{ fontSize: '12px', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{notifications.length} New</span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                    <p style={{ fontSize: '14px' }}>You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <Link to="/tasks" key={idx} onClick={() => setShowDropdown(false)} style={{ display: 'flex', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', transition: 'background 0.2s' }} className="hover-bg">
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: notif.type === 'overdue' ? 'rgba(218,30,40,0.1)' : 'rgba(241,194,27,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {notif.type === 'overdue' ? <AlertCircle size={18} color="var(--danger)" /> : <Clock size={18} color="var(--warning)" />}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '4px' }}>{notif.message}</p>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(notif.time).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer' }}>
          <img src={user?.avatar} alt={user?.name} className="avatar" style={{ width: 32, height: 32, objectFit: 'cover' }} />
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }} id="navbar-username">{user?.name}</span>
          <style>{`@media(max-width:640px){#navbar-username{display:none;}} .hover-bg:hover { background: var(--bg-secondary); }`}</style>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
