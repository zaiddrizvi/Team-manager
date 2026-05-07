import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['task-assigned', 'task-status', 'task-comment', 'project-member'],
      required: true
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
