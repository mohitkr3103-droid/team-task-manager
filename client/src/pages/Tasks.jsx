import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { taskAPI, projectAPI, userAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import { Plus, Search, CheckSquare, Calendar, Loader2, Trash2, Edit, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', projectId: '', assignedTo: '', priority: 'medium', status: 'pending', dueDate: '' });

  useEffect(() => { fetchData(); }, [search, statusFilter, priorityFilter, projectFilter]);

  const fetchData = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.projectId = projectFilter;
      const [tasksRes, projRes, usersRes] = await Promise.all([
        taskAPI.getAll(params), projectAPI.getAll(), userAPI.getAll()
      ]);
      setTasks(tasksRes.data.data);
      setProjects(projRes.data.data);
      setUsers(usersRes.data.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (!data.assignedTo) delete data.assignedTo;
      if (!data.dueDate) delete data.dueDate;
      if (editTask) {
        await taskAPI.update(editTask._id, data);
        toast.success('Task updated');
      } else {
        await taskAPI.create(data);
        toast.success('Task created');
      }
      closeModal();
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await taskAPI.delete(id); toast.success('Task deleted'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await taskAPI.update(id, { status }); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const closeModal = () => { setShowModal(false); setEditTask(null); setForm({ title: '', description: '', projectId: '', assignedTo: '', priority: 'medium', status: 'pending', dueDate: '' }); };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({ title: task.title, description: task.description || '', projectId: task.projectId?._id || '', assignedTo: task.assignedTo?._id || '', priority: task.priority, status: task.status, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' });
    setShowModal(true);
  };

  const getBadge = (s) => ({ pending: 'badge-warning', 'in-progress': 'badge-info', completed: 'badge-success', overdue: 'badge-danger' }[s] || 'badge-default');
  const getPBadge = (p) => ({ low: 'badge-info', medium: 'badge-warning', high: 'badge-danger' }[p] || 'badge-default');

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Tasks</h1><p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p></div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => { closeModal(); setShowModal(true); }}><Plus size={18} /> New Task</button>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1, maxWidth: '360px' }}>
          <Search size={16} />
          <input className="form-input" placeholder="Search tasks..." style={{ paddingLeft: '36px' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 'auto', minWidth: '120px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option><option value="in-progress">In Progress</option>
          <option value="completed">Completed</option><option value="overdue">Overdue</option>
        </select>
        <select className="form-input" style={{ width: 'auto', minWidth: '120px' }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <select className="form-input" style={{ width: 'auto', minWidth: '140px' }} value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state"><CheckSquare size={48} /><h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>No tasks found</h3><p style={{ color: 'var(--text-muted)' }}>Create your first task to get started</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Task</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id}>
                  <td><div style={{ fontWeight: '500' }}>{task.title}</div></td>
                  <td>
                    {task.projectId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: task.projectId.color || '#0f62fe' }} />
                        {task.projectId.title}
                      </div>
                    )}
                  </td>
                  <td>
                    {task.assignedTo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={task.assignedTo.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        {task.assignedTo.name}
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                  </td>
                  <td><span className={`badge ${getPBadge(task.priority)}`}>{task.priority}</span></td>
                  <td>
                    <select className="form-input" value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                      style={{ width: 'auto', fontSize: '12px', padding: '4px 8px', minWidth: '110px' }}>
                      <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {user?.role === 'admin' && (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(task)}><Edit size={14} /></button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(task._id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Project</label>
            <select className="form-input" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required>
              <option value="">Select project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group"><label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Assign To</label>
            <select className="form-input" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editTask ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
