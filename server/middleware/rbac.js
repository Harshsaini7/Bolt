import Project from '../models/Project.js';

// Check if user is a member of the project (any role)
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error checking membership' });
  }
};

// Check if user is an admin of the project
const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error checking admin role' });
  }
};

export { requireProjectMember, requireProjectAdmin };
