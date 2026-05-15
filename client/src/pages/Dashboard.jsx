import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';
import { FolderKanban, CheckSquare, Clock, AlertTriangle, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#0f62fe', '#0072c3', '#198038', '#f1c21b', '#da1e28', '#8a3ffc'];
const STATUS_COLORS = { pending: '#f1c21b', 'in-progress': '#0f62fe', completed: '#198038', overdue: '#da1e28' };
const PRIORITY_COLORS = { low: '#0072c3', medium: '#f1c21b', high: '#da1e28' };

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await taskAPI.getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const statCards = [
    { icon: FolderKanban, label: 'Total Projects', value: stats?.totalProjects || 0, color: '#0f62fe', bg: 'rgba(15,98,254,0.1)' },
    { icon: CheckSquare, label: 'Total Tasks', value: stats?.totalTasks || 0, color: '#0072c3', bg: 'rgba(0,114,195,0.1)' },
    { icon: TrendingUp, label: 'Completed', value: stats?.completedTasks || 0, color: '#198038', bg: 'rgba(25,128,56,0.1)' },
    { icon: Clock, label: 'In Progress', value: stats?.inProgressTasks || 0, color: '#f1c21b', bg: 'rgba(241,194,27,0.1)' },
    { icon: AlertTriangle, label: 'Overdue', value: stats?.overdueTasks || 0, color: '#da1e28', bg: 'rgba(218,30,40,0.1)' },
    { icon: BarChart3, label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, color: '#0043ce', bg: 'rgba(0,67,206,0.1)' },
  ];

  const statusData = (stats?.tasksByStatus || []).map(s => ({ name: s._id, value: s.count }));
  const priorityData = (stats?.tasksByPriority || []).map(p => ({ name: p._id, value: p.count }));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = (stats?.monthlyCompletion || []).map(m => ({
    name: months[m._id.month - 1],
    completed: m.count,
  }));

  const getBadgeClass = (status) => {
    const map = { pending: 'badge-warning', 'in-progress': 'badge-info', completed: 'badge-success', overdue: 'badge-danger' };
    return map[status] || 'badge-default';
  };
  const getPriorityBadge = (p) => {
    const map = { low: 'badge-info', medium: 'badge-warning', high: 'badge-danger' };
    return map[p] || 'badge-default';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}! Here's what's happening.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-stats" style={{ marginBottom: '24px' }}>
        {statCards.map((card, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>{card.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{card.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Task Status Pie */}
        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-primary)' }}>Tasks by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}><p style={{ color: 'var(--text-muted)' }}>No task data yet</p></div>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
            {statusData.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[s.name] || COLORS[i] }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Completion */}
        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-primary)' }}>Monthly Completions</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }} />
                <Area type="monotone" dataKey="completed" stroke="#0f62fe" fill="rgba(15,98,254,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}><p style={{ color: 'var(--text-muted)' }}>No completion data yet</p></div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Recent Tasks */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Recent Tasks</h3>
            <Link to="/tasks" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>View All →</Link>
          </div>
          {(stats?.recentTasks || []).length > 0 ? (
            <div>
              {stats.recentTasks.map(task => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{task.projectId?.title}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                    <span className={`badge ${getBadgeClass(task.status)}`}>{task.status}</span>
                    <span className={`badge ${getPriorityBadge(task.priority)}`}>{task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}><p style={{ color: 'var(--text-muted)' }}>No tasks yet</p></div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Upcoming Deadlines</h3>
          </div>
          {(stats?.upcomingDeadlines || []).length > 0 ? (
            <div>
              {stats.upcomingDeadlines.map(task => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  {task.assignedTo && (
                    <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="avatar-sm" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}><p style={{ color: 'var(--text-muted)' }}>No upcoming deadlines</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
