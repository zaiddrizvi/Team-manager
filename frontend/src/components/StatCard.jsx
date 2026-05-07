export default function StatCard({ icon: Icon, label, value, tone = 'slate', detail, progress }) {
  const tones = {
    slate: 'from-slate-950 to-slate-700 text-white',
    teal: 'from-teal-600 to-cyan-600 text-white',
    amber: 'from-amber-500 to-orange-500 text-white',
    rose: 'from-rose-600 to-pink-600 text-white'
  };

  return (
    <div className="panel group overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200">
      <div className={`flex items-start justify-between bg-gradient-to-br p-5 ${tones[tone] || tones.slate}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{label}</p>
          <p className="mt-3 text-4xl font-bold tabular-nums">{value}</p>
        </div>
        {Icon && (
          <span className="grid size-11 place-items-center rounded-xl bg-white/15">
            <Icon size={21} />
          </span>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-slate-500">{detail || 'Current total'}</span>
          {typeof progress === 'number' && <span className="font-semibold text-slate-900">{progress}%</span>}
        </div>
        {typeof progress === 'number' && (
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
