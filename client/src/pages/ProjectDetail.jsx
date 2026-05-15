import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { projectAPI, taskAPI, userAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import { ArrowLeft, Plus, Calendar, Users, Trash2, Edit, UserPlus, X, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '', assignedTo: '' });
  const [commentText, setCommentText] = useState({});

  useEffect(() => { fetchProject(); fetchUsers(); }, [id]);

  const fetchProject = async () => {
    try {
      const res = await projectAPI.getById(id);
      setProject(res.data.data);
    } catch (err) {
      toast.error('Project not found');
      navigate('/projects');
    } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setAllUsers(res.data.data);
    } catch {}
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const data = { ...taskForm, projectId: id };
      if (!data.assignedTo) delete data.assignedTo;
      if (!data.dueDate) delete data.dueDate;
      if (editTask) {
        await taskAPI.update(editTask._id, data);
        toast.success('Task updated');
      } else {
        await taskAPI.create(data);
        toast.success('Task created');
      }
      setShowTaskModal(false);
      setEditTask(null);
      setTaskForm({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '', assignedTo: '' });
      fetchProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      toast.success('Task deleted');
      fetchProject();
    } catch { toast.error('Failed to delete task'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.update(taskId, { status });
      fetchProject();
    } catch { toast.error('Failed to update status'); }
  };

  const handleAddMember = async (userId) => {
    try {
      await projectAPI.addMember(id, { userId });
      toast.success('Member added');
      fetchProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await projectAPI.removeMember(id, userId);
      toast.success('Member removed');
      fetchProject();
    } catch { toast.error('Failed'); }
  };

  const handleAddComment = async (taskId) => {
    const text = commentText[taskId];
    if (!text?.trim()) return;
    try {
      await taskAPI.addComment(taskId, { text });
      setCommentText({ ...commentText, [taskId]: '' });
      fetchProject();
    } catch { toast.error('Failed to add comment'); }
  };

  const openEditTask = (task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title, description: task.description || '',
      priority: task.priority, status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assignedTo: task.assignedTo?._id || '',
    });
    setShowTaskModal(true);
  };

  const getBadgeClass = (s) => ({ pending: 'badge-warning', 'in-progress': 'badge-info', completed: 'badge-success', overdue: 'badge-danger' }[s] || 'badge-default');
  const getPriorityBadge = (p) => ({ low: 'badge-info', medium: 'badge-warning', high: 'badge-danger' }[p] || 'badge-default');

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!project) return null;

  const nonMembers = allUsers.filter(u => !project.members.some(m => m.user?._id === u._id) && u._id !== project.createdBy?._id);

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate('/projects')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={18} /> Back to Projects
      </button>

      {/* Header */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', borderTop: `4px solid ${project.color || '#0f62fe'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>{project.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>{project.description}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`badge ${getBadgeClass(project.status)}`}>{project.status}</span>
              {project.deadline && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <Calendar size={14} /> Due: {new Date(project.deadline).toLocaleDateString()}
                </span>
              )}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {project.totalTasks} tasks • {project.progress}% complete
              </span>
            </div>
            <div className="progress-bar" style={{ marginTop: '12px', maxWidth: '400px' }}>
              <div className="progress-fill" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {user?.role === 'admin' && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
                  <UserPlus size={14} /> Members
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setTaskForm({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '', assignedTo: '' }); setShowTaskModal(true); }}>
                  <Plus size={14} /> Add Task
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Users size={16} /> Team Members ({(project.members?.length || 0) + 1})
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
            <img src={project.createdBy?.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{project.createdBy?.name}</span>
            <span className="badge badge-accent" style={{ fontSize: '10px' }}>Owner</span>
          </div>
          {(project.members || []).map(m => (
            <div key={m.user?._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <img src={m.user?.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{m.user?.name}</span>
              <span className="badge badge-default" style={{ fontSize: '10px' }}>{m.role}</span>
              {user?.role === 'admin' && (
                <button onClick={() => handleRemoveMember(m.user?._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 2 }}>
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Tasks ({project.tasks?.length || 0})</h3>
        {(project.tasks || []).length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No tasks yet. Create one to get started.</p>
          </div>
        ) : (
          <div>
            {project.tasks.map(task => (
              <motion.div key={task._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '12px', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{task.title}</h4>
                    {task.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{task.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <span className={`badge ${getBadgeClass(task.status)}`}>{task.status}</span>
                    <span className={`badge ${getPriorityBadge(task.priority)}`}>{task.priority}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {task.assignedTo && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <img src={task.assignedTo.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                        {task.assignedTo.name}
                      </span>
                    )}
                    {task.dueDate && <span><Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <select className="form-input" style={{ width: 'auto', fontSize: '12px', padding: '4px 8px' }}
                      value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {user?.role === 'admin' && (
                      <>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditTask(task)}><Edit size={14} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteTask(task._id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>

                {/* Comments */}
                {(task.comments || []).length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    {task.comments.slice(-3).map((c, ci) => (
                      <div key={ci} className="comment" style={{ padding: '8px 0' }}>
                        <img src={c.user?.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }} />
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{c.user?.name}</span>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input className="form-input" placeholder="Add a comment..." style={{ fontSize: '13px', padding: '6px 10px' }}
                    value={commentText[task._id] || ''} onChange={e => setCommentText({ ...commentText, [task._id]: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment(task._id)} />
                  <button className="btn btn-primary btn-sm" onClick={() => handleAddComment(task._id)}><Send size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => { setShowTaskModal(false); setEditTask(null); }}
        title={editTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select className="form-input" value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {allUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowTaskModal(false); setEditTask(null); }}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editTask ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Members">
        {nonMembers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>All users are already members</p>
        ) : (
          <div>
            {nonMembers.map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={u.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleAddMember(u._id)}>
                  <UserPlus size={14} /> Add
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectDetail;
