import Notification from '../models/Notification.js';

const uniqueRecipients = (recipients, actorId) => {
  const normalizeId = (id) => (id?._id || id)?.toString();
  const actor = normalizeId(actorId);
  return [...new Set(recipients.filter(Boolean).map(normalizeId))].filter((id) => id && id !== actor);
};

export const createNotifications = async ({ recipients, actor, type, title, message, project, task }) => {
  const recipientIds = uniqueRecipients(recipients, actor);
  if (recipientIds.length === 0) return [];

  return Notification.insertMany(
    recipientIds.map((recipient) => ({
      recipient,
      actor,
      type,
      title,
      message,
      project,
      task
    }))
  );
};
