import './config/env.js';
import connectDB from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({})
  ]);

  const admin = await User.create({
    name: 'Demo Admin',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin'
  });

  const member = await User.create({
    name: 'Demo Member',
    email: 'member@test.com',
    password: '123456',
    role: 'member'
  });

  const project = await Project.create({
    title: 'Website Refresh',
    description: 'Launch the next version of the marketing website.',
    createdBy: admin._id,
    members: [member._id]
  });

  await Task.create([
    {
      title: 'Create homepage checklist',
      description: 'Prepare a QA checklist for the homepage release.',
      project: project._id,
      assignedTo: member._id,
      createdBy: admin._id,
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Review responsive layout',
      description: 'Check mobile and tablet breakpoints.',
      project: project._id,
      assignedTo: member._id,
      createdBy: admin._id,
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  console.log('Seed complete');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
