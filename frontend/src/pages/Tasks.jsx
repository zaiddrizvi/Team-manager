import { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import api from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [commentsByTask, setCommentsByTask] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [taskRes, projectRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(taskRes.data);
      setProjects(projectRes.data);
      const commentEntries = await Promise.all(
        taskRes.data.map(async (task) => {
          const { data } = await api.get(`/tasks/${task._id}/comments`);
          return [task._id, data];
        })
      );
      setCommentsByTask(Object.fromEntries(commentEntries));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    loadData();
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    loadData();
  };

  const addComment = async (event, taskId) => {
    event.preventDefault();
    const message = commentDrafts[taskId]?.trim();
    if (!message) return;

    const { data } = await api.post(`/tasks/${taskId}/comments`, { message });
    setCommentsByTask((current) => ({
      ...current,
      [taskId]: [...(current[taskId] || []), data]
    }));
    setCommentDrafts((current) => ({ ...current, [taskId]: '' }));
  };

  return (
    <section className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Work queue</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Tasks</h1>
          <p className="muted mt-2">{user.role === 'admin' ? 'All tasks across all projects.' : 'Tasks assigned to you.'}</p>
        </div>
      </div>

      {user.role === 'admin' && (
        <TaskForm
          projects={projects}
          initialTask={editingTask}
          onSaved={() => {
            setEditingTask(null);
            loadData();
          }}
          onCancel={() => setEditingTask(null)}
        />
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {loading ? <p className="text-slate-500">Loading tasks...</p> : (
        <div className="panel overflow-hidden">
          <div className="divide-y divide-slate-200">
            {tasks.map((task) => (
              <div key={task._id} className="grid gap-4 p-5 transition hover:bg-slate-50/70 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-950">{task.title}</h2>
                    <StatusBadge status={task.status} />
                    {task.isOverdue && <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">overdue</span>}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
                  <p className="mt-3 text-sm text-slate-500">
                    {task.project?.title} / {task.assignedTo?.name} / Due {new Date(task.dueDate).toLocaleDateString()} / {task.priority}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={task.status} onChange={(e) => updateStatus(task._id, e.target.value)} className="min-w-36">
                    <option value="todo">todo</option>
                    <option value="in-progress">in-progress</option>
                    <option value="done">done</option>
                  </select>
                  {user.role === 'admin' && (
                    <>
                      <button className="btn btn-secondary" onClick={() => setEditingTask(task)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => deleteTask(task._id)}>Delete</button>
                    </>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                      <MessageSquare size={16} />
                      Comments
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {(commentsByTask[task._id] || []).length}
                      </span>
                    </div>
                    <div className="space-y-3 p-4">
                      {(commentsByTask[task._id] || []).map((comment) => (
                        <div key={comment._id} className="rounded-xl bg-slate-50 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-950">{comment.author?.name}</p>
                            <p className="text-xs font-medium text-slate-400">{new Date(comment.createdAt).toLocaleString()}</p>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{comment.message}</p>
                        </div>
                      ))}
                      {(commentsByTask[task._id] || []).length === 0 && (
                        <p className="text-sm text-slate-400">No comments yet.</p>
                      )}
                      <form onSubmit={(event) => addComment(event, task._id)} className="flex flex-col gap-2 sm:flex-row">
                        <input
                          placeholder="Write a comment..."
                          value={commentDrafts[task._id] || ''}
                          onChange={(event) => setCommentDrafts((current) => ({ ...current, [task._id]: event.target.value }))}
                        />
                        <button className="btn btn-primary shrink-0">
                          <Send size={16} />
                          Comment
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="empty-state">No tasks found.</p>}
          </div>
        </div>
      )}
    </section>
  );
}
