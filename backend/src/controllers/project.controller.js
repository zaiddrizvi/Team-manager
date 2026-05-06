import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const populateProject = [
  { path: 'createdBy', select: 'name email role' },
  { path: 'members', select: 'name email role' }
];

export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      createdBy: req.user._id,
      members: req.body.members || []
    });
    const populated = await project.populate(populateProject);
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { members: req.user._id };
    const projects = await Project.find(filter).populate(populateProject).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(populateProject);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const isMember = project.members.some((member) => member._id.equals(req.user._id));
    if (req.user.role !== 'admin' && !isMember) {
      res.status(403);
      throw new Error('You cannot access this project');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    const member = await User.findOne({ email, role: 'member' });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    if (!member) {
      res.status(404);
      throw new Error('Member user not found');
    }
    if (!project.members.some((id) => id.equals(member._id))) {
      project.members.push(member._id);
      await project.save();
    }

    res.json(await project.populate(populateProject));
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, description: req.body.description },
      { new: true, runValidators: true }
    ).populate(populateProject);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};
