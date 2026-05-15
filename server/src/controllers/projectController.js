import Project from '../models/Project.js';
import Task from '../models/Task.js';

export const getProjects = async (req, res, next) => {
  try {
    const { status, priority, search, sort } = req.query;
    let query = {};
    if (req.user.role === 'member') {
      query.$or = [{ createdBy: req.user._id }, { 'members.user': req.user._id }];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      const searchQuery = { $or: [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }] };
      query = { ...query, ...searchQuery };
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'deadline') sortOption = { deadline: 1 };

    const projects = await Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .sort(sortOption);

    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ projectId: project._id });
        const completedTasks = await Task.countDocuments({ projectId: project._id, status: 'completed' });
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return { ...project.toObject(), totalTasks, completedTasks, progress };
      })
    );

    res.status(200).json({ success: true, count: projectsWithProgress.length, data: projectsWithProgress });
  } catch (error) { next(error); }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar role');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (req.user.role === 'member') {
      const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
      const isCreator = project.createdBy._id.toString() === req.user._id.toString();
      if (!isMember && !isCreator) return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const tasks = await Task.find({ projectId: project._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({ success: true, data: { ...project.toObject(), tasks, totalTasks, completedTasks, progress } });
  } catch (error) { next(error); }
};

export const createProject = async (req, res, next) => {
  try {
    const { title, description, deadline, priority, status, members, tags, color } = req.body;
    const project = await Project.create({
      title, description, createdBy: req.user._id, deadline, priority, status, tags, color,
      members: members ? members.map(m => ({ user: m.user || m, role: m.role || 'contributor' })) : [],
    });
    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar role');
    res.status(201).json({ success: true, message: 'Project created', data: { ...populated.toObject(), totalTasks: 0, completedTasks: 0, progress: 0 } });
  } catch (error) { next(error); }
};

export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key === 'members') {
        project.members = updates.members.map(m => ({ user: m.user || m, role: m.role || 'contributor' }));
      } else {
        project[key] = updates[key];
      }
    });
    await project.save();
    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar').populate('members.user', 'name email avatar role');
    const totalTasks = await Task.countDocuments({ projectId: project._id });
    const completedTasks = await Task.countDocuments({ projectId: project._id, status: 'completed' });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    res.status(200).json({ success: true, message: 'Project updated', data: { ...updated.toObject(), totalTasks, completedTasks, progress } });
  } catch (error) { next(error); }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Task.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) { next(error); }
};

export const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.members.some(m => m.user.toString() === userId)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }
    project.members.push({ user: userId, role: role || 'contributor' });
    await project.save();
    const updated = await Project.findById(project._id).populate('createdBy', 'name email avatar').populate('members.user', 'name email avatar role');
    res.status(200).json({ success: true, message: 'Member added', data: updated });
  } catch (error) { next(error); }
};

export const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    const updated = await Project.findById(project._id).populate('createdBy', 'name email avatar').populate('members.user', 'name email avatar role');
    res.status(200).json({ success: true, message: 'Member removed', data: updated });
  } catch (error) { next(error); }
};
