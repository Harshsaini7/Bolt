import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Create a new task in a project
// @route   POST /api/projects/:id/tasks
// @access  Private (Admin)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, assignee, dueDate } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Task title is required');
  }

  // If assignee is provided, verify they are a project member
  if (assignee) {
    const project = req.project;
    const isMember = project.members.some(
      (m) => m.user.toString() === assignee
    );
    if (!isMember) {
      res.status(400);
      throw new Error('Assignee must be a member of the project');
    }
  }

  const task = await Task.create({
    title,
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    project: req.params.id,
    assignee: assignee || null,
    createdBy: req.user._id,
    dueDate: dueDate || null,
  });

  const populated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  res.status(201).json(populated);
});

// @desc    Get tasks for a project (with filters)
// @route   GET /api/projects/:id/tasks
// @access  Private (Member)
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, assignee } = req.query;

  const filter = { project: req.params.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort('status createdAt');

  res.json(tasks);
});

// @desc    Update a task
// @route   PUT /api/tasks/:taskId
// @access  Private (Admin: all fields, Member: status only)
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Get user's role in the project
  const project = await Project.findById(task.project);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const member = project.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!member) {
    res.status(403);
    throw new Error('Not a member of this project');
  }

  if (member.role === 'admin') {
    // Admin can update everything
    const { title, description, status, priority, assignee, dueDate } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
  } else {
    // Members can only update status
    const { status } = req.body;
    if (status) {
      task.status = status;
    } else {
      res.status(403);
      throw new Error('Members can only update task status');
    }
  }

  await task.save();

  const updated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  res.json(updated);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:taskId
// @access  Private (Admin)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Verify user is admin of the task's project
  const project = await Project.findById(task.project);
  const member = project?.members.find(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!member || member.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access required to delete tasks');
  }

  await Task.findByIdAndDelete(task._id);
  res.json({ message: 'Task deleted' });
});

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  // Get all user's projects
  const projects = await Project.find({
    'members.user': req.user._id,
  }).select('_id name color');

  const projectIds = projects.map((p) => p._id);

  // Get all tasks across user's projects
  const allTasks = await Task.find({ project: { $in: projectIds } })
    .populate('assignee', 'name email avatar')
    .populate('project', 'name color')
    .sort('-createdAt');

  // Task counts by status
  const statusCounts = { todo: 0, in_progress: 0, done: 0 };
  allTasks.forEach((t) => {
    statusCounts[t.status]++;
  });

  // Overdue tasks (due date in the past, not done)
  const now = new Date();
  const overdueTasks = allTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
  );

  // Tasks assigned to current user
  const myTasks = allTasks.filter(
    (t) => t.assignee && t.assignee._id.toString() === req.user._id.toString()
  );

  // Recent tasks (last 10)
  const recentTasks = allTasks.slice(0, 10);

  res.json({
    totalProjects: projects.length,
    totalTasks: allTasks.length,
    statusCounts,
    overdueTasks,
    myTasks,
    recentTasks,
    projects,
  });
});

export { createTask, getTasks, updateTask, deleteTask, getDashboard };
