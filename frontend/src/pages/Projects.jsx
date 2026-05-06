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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-slate-500">{user.role === 'admin' ? 'All team projects.' : 'Projects assigned to you.'}</p>
        </div>
      </div>

      {user.role === 'admin' && (
        <form onSubmit={createProject} className="panel space-y-4 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Create project</h2>
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
            <Link key={project._id} to={`/projects/${project._id}`} className="panel block p-5 hover:border-teal-300">
              <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{project.description}</p>
              <p className="mt-4 text-sm text-slate-500">{project.members.length} member(s)</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
