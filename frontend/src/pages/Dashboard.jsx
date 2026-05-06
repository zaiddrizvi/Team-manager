import { useEffect, useState } from 'react';
import api from '../api/client.js';
import StatCard from '../components/StatCard.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard'));
  }, []);

  if (error) return <p className="text-rose-600">{error}</p>;
  if (!stats) return <p className="text-slate-500">Loading dashboard...</p>;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">A quick view of projects and task progress.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total projects" value={stats.totalProjects} />
        <StatCard label="Total tasks" value={stats.totalTasks} />
        <StatCard label="Completed tasks" value={stats.completedTasks} />
        <StatCard label="Pending tasks" value={stats.pendingTasks} />
        <StatCard label="In-progress tasks" value={stats.inProgressTasks} />
        <StatCard label="Overdue tasks" value={stats.overdueTasks} />
      </div>
    </section>
  );
}
