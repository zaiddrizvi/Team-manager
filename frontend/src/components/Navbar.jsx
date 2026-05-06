import { ClipboardList, FolderKanban, LayoutDashboard, LogOut } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-slate-900">Team Task Manager</Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" className={navClass}><LayoutDashboard size={17} />Dashboard</NavLink>
          <NavLink to="/projects" className={navClass}><FolderKanban size={17} />Projects</NavLink>
          <NavLink to="/tasks" className={navClass}><ClipboardList size={17} />Tasks</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="capitalize text-slate-500">{user?.role}</p>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} title="Log out">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
