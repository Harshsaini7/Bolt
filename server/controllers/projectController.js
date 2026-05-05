import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Project name is required');
  }

  const project = await Project.create({
    name,
    description: description || '',
    color: color || '#3b82f6',
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'admin' }],
  });

  const populated = await Project.findById(project._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.status(201).json(populated);
});

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    'members.user': req.user._id,
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort('-createdAt');

  // Attach task counts for each project
  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const taskCounts = await Task.aggregate([
        { $match: { project: project._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      const counts = { todo: 0, in_progress: 0, done: 0 };
      taskCounts.forEach((tc) => {
        counts[tc._id] = tc.count;
      });

      return {
        ...project.toObject(),
        taskCounts: counts,
        totalTasks: counts.todo + counts.in_progress + counts.done,
      };
    })
  );

  res.json(projectsWithCounts);
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private (Member)
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json(project);
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
const updateProject = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;
  const project = req.project;

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (color) project.color = color;

  await project.save();

  const updated = await Project.findById(project._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.json(updated);
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = asyncHandler(async (req, res) => {
  const project = req.project;

  // Delete all tasks associated with the project
  await Task.deleteMany({ project: project._id });
  await Project.findByIdAndDelete(project._id);

  res.json({ message: 'Project and all associated tasks deleted' });
});

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin)
const addMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const project = req.project;

  if (!email) {
    res.status(400);
    throw new Error('Member email is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found with that email');
  }

  const alreadyMember = project.members.some(
    (m) => m.user.toString() === user._id.toString()
  );
  if (alreadyMember) {
    res.status(400);
    throw new Error('User is already a member of this project');
  }

  project.members.push({
    user: user._id,
    role: role || 'member',
  });

  await project.save();

  const updated = await Project.findById(project._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.json(updated);
});

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin)
const removeMember = asyncHandler(async (req, res) => {
  const project = req.project;
  const userId = req.params.userId;

  // Cannot remove the owner
  if (project.owner.toString() === userId) {
    res.status(400);
    throw new Error('Cannot remove the project owner');
  }

  const memberIndex = project.members.findIndex(
    (m) => m.user.toString() === userId
  );

  if (memberIndex === -1) {
    res.status(404);
    throw new Error('User is not a member of this project');
  }

  project.members.splice(memberIndex, 1);

  // Unassign any tasks assigned to the removed member
  await Task.updateMany(
    { project: project._id, assignee: userId },
    { assignee: null }
  );

  await project.save();

  const updated = await Project.findById(project._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.json(updated);
});

export {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
