import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, projectId, assignedTo, sort } = req.query;
    let query = {};
    if (req.user.role === 'member') {
      const userProjects = await Project.find({
        $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.projectId = { $in: projectIds };
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (projectId) query.projectId = projectId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'dueDate') sortOption = { dueDate: 1 };
    if (sort === 'priority') sortOption = { priority: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    // Mark overdue tasks
    await Task.updateMany(
      { status: { $in: ['pending', 'in-progress'] }, dueDate: { $lt: new Date() } },
      { $set: { status: 'overdue' } }
    );

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'title color')
      .populate('comments.user', 'name email avatar')
      .sort(sortOption);

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) { next(error); }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'title color members')
      .populate('comments.user', 'name email avatar')
      .populate('activityLogs.user', 'name email avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (error) { next(error); }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, priority, status, dueDate, tags } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const task = await Task.create({
      title, description, projectId, assignedTo, priority, status, dueDate, tags,
      createdBy: req.user._id,
      activityLogs: [{ user: req.user._id, action: 'created', details: `Task "${title}" created` }],
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'title color');

    res.status(201).json({ success: true, message: 'Task created', data: populated });
  } catch (error) { next(error); }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Members can only update status of their own tasks
    if (req.user.role === 'member') {
      if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      // Members can only update status
      const allowedFields = ['status'];
      const updateKeys = Object.keys(req.body);
      const isAllowed = updateKeys.every(key => allowedFields.includes(key));
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: 'Members can only update task status' });
      }
    }

    const updates = req.body;
    const logs = [];

    if (updates.status && updates.status !== task.status) {
      logs.push({ user: req.user._id, action: 'status_changed', details: `Status: ${task.status} -> ${updates.status}` });
    }
    if (updates.priority && updates.priority !== task.priority) {
      logs.push({ user: req.user._id, action: 'priority_changed', details: `Priority: ${task.priority} -> ${updates.priority}` });
    }
    if (updates.assignedTo && (!task.assignedTo || updates.assignedTo !== task.assignedTo.toString())) {
      logs.push({ user: req.user._id, action: 'assigned', details: 'Task reassigned' });
    }
    if (updates.dueDate && updates.dueDate !== task.dueDate?.toISOString()) {
      logs.push({ user: req.user._id, action: 'due_date_changed', details: 'Due date updated' });
    }

    Object.keys(updates).forEach(key => { task[key] = updates[key]; });
    if (logs.length > 0) task.activityLogs.push(...logs);
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'title color');

    res.status(200).json({ success: true, message: 'Task updated', data: populated });
  } catch (error) { next(error); }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) { next(error); }
};

export const addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    task.comments.push({ user: req.user._id, text: req.body.text });
    task.activityLogs.push({ user: req.user._id, action: 'commented', details: 'Added a comment' });
    await task.save();
    const populated = await Task.findById(task._id)
      .populate('comments.user', 'name email avatar')
      .populate('activityLogs.user', 'name email avatar');
    res.status(200).json({ success: true, message: 'Comment added', data: populated });
  } catch (error) { next(error); }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    // Mark overdue tasks
    await Task.updateMany(
      { status: { $in: ['pending', 'in-progress'] }, dueDate: { $lt: new Date() } },
      { $set: { status: 'overdue' } }
    );

    let taskQuery = {};
    let projectQuery = {};
    if (req.user.role === 'member') {
      const userProjects = await Project.find({
        $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      taskQuery.projectId = { $in: projectIds };
      projectQuery._id = { $in: projectIds };
    }

    const totalProjects = await Project.countDocuments(projectQuery);
    const totalTasks = await Task.countDocuments(taskQuery);
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ ...taskQuery, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });
    const overdueTasks = await Task.countDocuments({ ...taskQuery, status: 'overdue' });

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Recent tasks
    const recentTasks = await Task.find(taskQuery)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'title color')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent projects
    const recentProjects = await Project.find(projectQuery)
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming deadlines
    const upcomingDeadlines = await Task.find({
      ...taskQuery,
      dueDate: { $gte: new Date() },
      status: { $ne: 'completed' },
    })
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'title color')
      .sort({ dueDate: 1 })
      .limit(5);

    // Monthly task completion (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyCompletion = await Task.aggregate([
      { $match: { ...taskQuery, status: 'completed', updatedAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$updatedAt' }, year: { $year: '$updatedAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProjects, totalTasks, completedTasks, pendingTasks, inProgressTasks, overdueTasks,
        tasksByPriority, tasksByStatus, recentTasks, recentProjects, upcomingDeadlines, monthlyCompletion,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (error) { next(error); }
};
