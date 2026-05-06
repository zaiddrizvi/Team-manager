import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [email, setEmail] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [projectRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load project');
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const addMember = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post(`/projects/${id}/members`, { email });
      setEmail('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add member');
    }
  };

  const deleteProject = async () => {
    if (!confirm('Delete this project and its tasks?')) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    loadData();
  };

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    loadData();
  };

  if (error) return <p className="text-rose-600">{error}</p>;
  if (!project) return <p className="text-slate-500">Loading project...</p>;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          <p className="mt-1 text-slate-500">{project.description}</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-danger" onClick={deleteProject}><Trash2 size={17} />Delete project</button>
        )}
      </div>

      <div className="panel p-5">
        <h2 className="text-lg font-semibold text-slate-900">Members</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.members.map((member) => (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700" key={member._id}>
              {member.name} ({member.email})
            </span>
          ))}
        </div>
        {user.role === 'admin' && (
          <form onSubmit={addMember} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input type="email" placeholder="member email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button className="btn btn-primary">Add member</button>
          </form>
        )}
      </div>

      {user.role === 'admin' && (
        <TaskForm
          projects={[project]}
          initialTask={editingTask}
          onSaved={() => {
            setEditingTask(null);
            loadData();
          }}
          onCancel={() => setEditingTask(null)}
        />
      )}

      <div className="panel overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {tasks.map((task) => (
            <div key={task._id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{task.title}</h3>
                  <StatusBadge status={task.status} />
                  {task.isOverdue && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">overdue</span>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                <p className="mt-2 text-sm text-slate-500">Assigned to {task.assignedTo.name} • Due {new Date(task.dueDate).toLocaleDateString()} • {task.priority}</p>
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
          {tasks.length === 0 && <p className="p-5 text-slate-500">No tasks yet.</p>}
        </div>
      </div>
    </section>
  );
}
