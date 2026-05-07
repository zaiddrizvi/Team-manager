import Project from '../models/Project.js';
import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import { createNotifications } from '../utils/notifications.js';

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

const getTaskForUser = async (taskId, user) => {
  const task = await Task.findById(taskId)
    .populate(populateTask)
    .populate({ path: 'project', select: 'title description members createdBy' });

  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }

  const projectMembers = task.project.members || [];
  const isProjectMember = projectMembers.some((memberId) => memberId.equals(user._id));
  const isAssignee = task.assignedTo._id.equals(user._id);

  if (user.role !== 'admin' && !isAssignee && !isProjectMember) {
    const error = new Error('You cannot access this task');
    error.status = 403;
    throw error;
  }

  return task;
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

    await createNotifications({
      recipients: [assignedTo],
      actor: req.user._id,
      type: 'task-assigned',
      title: 'New task assigned',
      message: `${req.user.name} assigned you "${title}"`,
      project,
      task: task._id
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
    await Comment.deleteMany({ task: task._id });
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

    await createNotifications({
      recipients: [task.createdBy, task.assignedTo],
      actor: req.user._id,
      type: 'task-status',
      title: 'Task status updated',
      message: `${req.user.name} moved "${task.title}" to ${task.status}`,
      project: task.project,
      task: task._id
    });

    res.json(await task.populate(populateTask));
  } catch (error) {
    next(error);
  }
};

export const getTaskComments = async (req, res, next) => {
  try {
    await getTaskForUser(req.params.id, req.user);
    const comments = await Comment.find({ task: req.params.id })
      .populate({ path: 'author', select: 'name email role' })
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};

export const addTaskComment = async (req, res, next) => {
  try {
    const task = await getTaskForUser(req.params.id, req.user);
    const comment = await Comment.create({
      task: task._id,
      project: task.project._id,
      author: req.user._id,
      message: req.body.message
    });

    await createNotifications({
      recipients: [task.assignedTo._id, task.createdBy, task.project.createdBy, ...task.project.members],
      actor: req.user._id,
      type: 'task-comment',
      title: 'New task comment',
      message: `${req.user.name} commented on "${task.title}"`,
      project: task.project._id,
      task: task._id
    });

    res.status(201).json(await comment.populate({ path: 'author', select: 'name email role' }));
  } catch (error) {
    if (error.status) res.status(error.status);
    next(error);
  }
};
