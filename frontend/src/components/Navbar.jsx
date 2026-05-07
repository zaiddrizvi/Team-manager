import { Bell, CheckCheck, ClipboardList, FolderKanban, LayoutDashboard, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const navClass = ({ isActive }) =>
  `inline-flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition lg:w-full ${
    isActive ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15' : 'text-slate-500 hover:bg-white hover:text-slate-950'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await api.get('/notifications?limit=12');
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  };

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openNotification = async (notification) => {
    if (!notification.readAt) {
      await api.patch(`/notifications/${notification._id}/read`);
      loadNotifications().catch(() => {});
    }
    if (notification.project?._id) navigate(`/projects/${notification.project._id}`);
    setNotificationsOpen(false);
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    loadNotifications().catch(() => {});
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl lg:fixed lg:bottom-0 lg:w-72 lg:border-b-0 lg:border-r lg:bg-slate-50/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:h-full lg:flex-col lg:items-stretch lg:px-5 lg:py-6">
        <Link to="/" className="flex items-center gap-3 text-sm font-bold text-slate-950">
          <span className="grid size-11 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">TT</span>
          <span className="leading-tight">
            Team Task
            <span className="block text-xs font-semibold text-slate-400">Workspace</span>
          </span>
        </Link>
        <nav className="order-3 flex w-full flex-wrap items-center gap-1 sm:order-none sm:w-auto lg:mt-8 lg:flex-col lg:items-stretch lg:gap-2">
          <NavLink to="/" className={navClass}><LayoutDashboard size={17} />Dashboard</NavLink>
          <NavLink to="/projects" className={navClass}><FolderKanban size={17} />Projects</NavLink>
          <NavLink to="/tasks" className={navClass}><ClipboardList size={17} />Tasks</NavLink>
        </nav>
        <div className="relative flex items-center gap-3 lg:mt-auto lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-3">
          <div className="hidden text-right text-sm sm:block lg:flex-1 lg:text-left">
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="capitalize text-slate-400">{user?.role}</p>
          </div>
          <button
            className="btn btn-secondary relative px-3 lg:size-10 lg:min-h-0"
            onClick={() => {
              setNotificationsOpen((open) => !open);
              loadNotifications().catch(() => {});
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button className="btn btn-secondary px-3 lg:size-10 lg:min-h-0" onClick={handleLogout} title="Log out" aria-label="Log out">
            <LogOut size={17} />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-14 z-30 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/60 lg:left-3 lg:right-auto lg:top-auto lg:bottom-20">
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <div>
                  <p className="eyebrow">Inbox</p>
                  <h2 className="mt-1 font-semibold text-slate-950">Notifications</h2>
                </div>
                <button className="btn btn-secondary min-h-0 px-2.5 py-2" onClick={markAllRead} title="Mark all read">
                  <CheckCheck size={16} />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <button
                    key={notification._id}
                    className="block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
                    onClick={() => openNotification(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 size-2 rounded-full ${notification.readAt ? 'bg-slate-200' : 'bg-rose-500'}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-950">{notification.title}</span>
                        <span className="mt-1 block text-sm leading-5 text-slate-500">{notification.message}</span>
                        <span className="mt-2 block text-xs font-medium text-slate-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </button>
                ))}
                {notifications.length === 0 && <p className="empty-state">No notifications yet.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
