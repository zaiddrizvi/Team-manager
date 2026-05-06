import Project from '../models/Project.js';
import Task from '../models/Task.js';

const populateTask = [
  { path: 'project', select: 'title description members' },
  { path: 'assignedTo', select: 'name email role' },
  { path: 'createdBy', select: 'name email role' }
];

const assertAssigneeIsProjectMember = async (projectId, assignedTo) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  if (!project.members.some((memberId) => memberId.equals(assignedTo))) {
    const error = new Error('Task can only be assigned to a project member');
    error.status = 400;
    throw error;
  }

  return project;
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;
    await assertAssigneeIsProjectMember(project, assignedTo);

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      createdBy: req.user._id
    });

    res.status(201).json(await task.populate(populateTask));
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') filter.assignedTo = req.user._id;
    if (req.query.project) filter.project = req.query.project;

    const tasks = await Task.find(filter).populate(populateTask).sort({ dueDate: 1 });

    if (req.user.role !== 'admin' && req.query.project) {
      const allowed = tasks.every((task) => task.assignedTo._id.equals(req.user._id));
      if (!allowed) {
        res.status(403);
        throw new Error('You cannot access these tasks');
      }
    }

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate(populateTask);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    if (req.user.role !== 'admin' && !task.assignedTo._id.equals(req.user._id)) {
      res.status(403);
      throw new Error('You cannot access this task');
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description,
      project: req.body.project,
      assignedTo: req.body.assignedTo,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate
    };

    if (updates.project && updates.assignedTo) {
      await assertAssigneeIsProjectMember(updates.project, updates.assignedTo);
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate(populateTask);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json(task);
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (req.user.role !== 'admin' && !task.assignedTo.equals(req.user._id)) {
      res.status(403);
      throw new Error('Only the assigned member can update this task');
    }

    task.status = req.body.status;
    await task.save();
    res.json(await task.populate(populateTask));
  } catch (error) {
    next(error);
  }
};
