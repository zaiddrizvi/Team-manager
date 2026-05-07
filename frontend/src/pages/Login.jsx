import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@test.com', password: '123456' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="panel w-full max-w-md space-y-5 p-7">
        <div>
          <p className="eyebrow">Team Task Workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Welcome back</h1>
          <p className="muted mt-2">Use admin@test.com or member@test.com with 123456.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <p className="text-center text-sm text-slate-600">
          Need an account? <Link className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4" to="/signup">Sign up</Link>
        </p>
      </form>
    </main>
  );
}
