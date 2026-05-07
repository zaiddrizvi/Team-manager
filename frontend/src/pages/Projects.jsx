import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/projects', form);
      setForm({ title: '', description: '' });
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create project');
    }
  };

  return (
    <section className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Projects</h1>
          <p className="muted mt-2">{user.role === 'admin' ? 'All team projects, grouped for quick scanning.' : 'Projects assigned to you.'}</p>
        </div>
      </div>

      {user.role === 'admin' && (
        <form onSubmit={createProject} className="panel space-y-4 p-5">
          <div>
            <p className="eyebrow">New project</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Create project</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="title">Title</label>
              <input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <label htmlFor="description">Description</label>
              <input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
          </div>
          <button className="btn btn-primary"><Plus size={17} />Create</button>
        </form>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {loading ? <p className="text-slate-500">Loading projects...</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`} className="panel group block p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-950">{project.title}</h2>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  {project.members.length} members
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{project.description}</p>
              <p className="mt-5 text-sm font-semibold text-slate-400 transition group-hover:text-slate-700">Open project</p>
            </Link>
          ))}
          {projects.length === 0 && <p className="empty-state panel md:col-span-2">No projects yet.</p>}
        </div>
      )}
    </section>
  );
}
