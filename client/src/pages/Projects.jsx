import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import Modal from '../components/ui/Modal';
import { Plus, Search, FolderKanban, Calendar, Loader2, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '', priority: 'medium', status: 'planning', color: '#0f62fe' });

  useEffect(() => { fetchProjects(); }, [search, statusFilter]);

  const fetchProjects = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await projectAPI.getAll(params);
      setProjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProject) {
        await projectAPI.update(editProject._id, formData);
        toast.success('Project updated');
      } else {
        await projectAPI.create(formData);
        toast.success('Project created');
      }
      setShowModal(false);
      setEditProject(null);
      setFormData({ title: '', description: '', deadline: '', priority: 'medium', status: 'planning', color: '#0f62fe' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) { toast.error('Failed to delete project'); }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setFormData({
      title: project.title, description: project.description,
      deadline: project.deadline ? project.deadline.slice(0, 10) : '',
      priority: project.priority, status: project.status, color: project.color || '#0f62fe',
    });
    setShowModal(true);
  };

  const statusBadge = (s) => {
    const map = { planning: 'badge-info', active: 'badge-success', 'on-hold': 'badge-warning', completed: 'badge-success', archived: 'badge-default' };
    return map[s] || 'badge-default';
  };

  const colors = ['#0f62fe', '#0072c3', '#198038', '#f1c21b', '#da1e28', '#005d5d', '#8a3ffc', '#002d9c'];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setFormData({ title: '', description: '', deadline: '', priority: 'medium', status: 'planning', color: '#0f62fe' }); setShowModal(true); }}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1, maxWidth: '360px' }}>
          <Search size={16} />
          <input className="form-input" placeholder="Search projects..." style={{ paddingLeft: '36px' }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 'auto', minWidth: '140px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={48} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>No projects found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid-projects">
          {projects.map((project, i) => (
            <motion.div key={project._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/projects/${project._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ height: '4px', background: project.color || '#0f62fe' }} />
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', flex: 1 }}>{project.title}</h3>
                      <span className={`badge ${statusBadge(project.status)}`}>{project.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>
                    <div className="progress-bar" style={{ marginBottom: '12px' }}>
                      <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{project.progress || 0}% complete • {project.totalTasks || 0} tasks</span>
                      {project.deadline && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <div style={{ display: 'flex' }}>
                        {(project.members || []).slice(0, 4).map((m, j) => (
                          <img key={j} src={m.user?.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--bg-primary)', marginLeft: j > 0 ? '-8px' : 0 }} />
                        ))}
                        {(project.members?.length || 0) > 4 && (
                          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', marginLeft: '-8px', border: '2px solid var(--bg-primary)' }}>
                            +{project.members.length - 4}
                          </span>
                        )}
                      </div>
                      {user?.role === 'admin' && (
                        <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.preventDefault()}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(project)}><Edit size={14} /></button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(project._id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditProject(null); }}
        title={editProject ? 'Edit Project' : 'Create Project'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input className="form-input" type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colors.map(c => (
                <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: formData.color === c ? '3px solid var(--text-primary)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditProject(null); }}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editProject ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
