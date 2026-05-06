import { useEffect, useState } from 'react';
import api from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
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

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        <p className="mt-1 text-slate-500">{user.role === 'admin' ? 'All tasks across all projects.' : 'Tasks assigned to you.'}</p>
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
              <div key={task._id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{task.title}</h2>
                    <StatusBadge status={task.status} />
                    {task.isOverdue && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">overdue</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {task.project?.title} • {task.assignedTo?.name} • Due {new Date(task.dueDate).toLocaleDateString()} • {task.priority}
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
              </div>
            ))}
            {tasks.length === 0 && <p className="p-5 text-slate-500">No tasks found.</p>}
          </div>
        </div>
      )}
    </section>
  );
}
