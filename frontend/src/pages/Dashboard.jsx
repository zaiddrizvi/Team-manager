import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListTodo, TimerReset } from 'lucide-react';
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

  const completionRate = stats.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
  const activeTasks = stats.pendingTasks + stats.inProgressTasks;
  const overdueRate = stats.totalTasks
    ? Math.round((stats.overdueTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <section className="space-y-5">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow text-slate-300">Overview</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Command center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Track delivery health, open work, and overdue pressure from one focused workspace.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <div className="hero-metric">
            <span>Completion</span>
            <strong>{completionRate}%</strong>
          </div>
          <div className="hero-metric">
            <span>Active</span>
            <strong>{activeTasks}</strong>
          </div>
          <div className="hero-metric">
            <span>Overdue</span>
            <strong>{stats.overdueTasks}</strong>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard icon={FolderKanban} label="Projects" value={stats.totalProjects} tone="slate" detail="Live workspaces" />
          <StatCard icon={ListTodo} label="Tasks" value={stats.totalTasks} tone="teal" detail={`${activeTasks} active right now`} progress={stats.totalTasks ? Math.round((activeTasks / stats.totalTasks) * 100) : 0} />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completedTasks} tone="teal" detail="Delivery progress" progress={completionRate} />
          <StatCard icon={Clock3} label="Pending" value={stats.pendingTasks} tone="amber" detail="Waiting to start" />
          <StatCard icon={TimerReset} label="In progress" value={stats.inProgressTasks} tone="amber" detail="Currently moving" />
          <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdueTasks} tone="rose" detail="Needs attention" progress={overdueRate} />
        </div>

        <aside className="panel overflow-hidden">
          <div className="border-b border-slate-200/80 p-5">
            <p className="eyebrow">Health</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Workload pulse</h2>
          </div>
          <div className="space-y-5 p-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Completed</span>
                <span className="font-semibold text-slate-950">{completionRate}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Overdue pressure</span>
                <span className="font-semibold text-slate-950">{overdueRate}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-rose-500" style={{ width: `${overdueRate}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Focus next</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {stats.overdueTasks > 0
                  ? 'Clear overdue tasks first, then move in-progress work to done.'
                  : activeTasks > 0
                    ? 'No overdue work. Keep the active queue moving steadily.'
                    : 'Everything is calm. Add tasks to start tracking delivery.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
