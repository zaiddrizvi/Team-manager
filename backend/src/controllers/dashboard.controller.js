import Project from '../models/Project.js';
import Task from '../models/Task.js';

const buildTaskStats = (tasks) => {
  const now = new Date();
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === 'done').length,
    pendingTasks: tasks.filter((task) => task.status === 'todo').length,
    inProgressTasks: tasks.filter((task) => task.status === 'in-progress').length,
    overdueTasks: tasks.filter((task) => task.status !== 'done' && task.dueDate < now).length
  };
};

export const getDashboard = async (req, res, next) => {
  try {
    const taskFilter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
    const projectFilter = req.user.role === 'admin' ? {} : { members: req.user._id };
    const [tasks, totalProjects] = await Promise.all([
      Task.find(taskFilter),
      Project.countDocuments(projectFilter)
    ]);

    res.json({
      totalProjects,
      ...buildTaskStats(tasks)
    });
  } catch (error) {
    next(error);
  }
};
