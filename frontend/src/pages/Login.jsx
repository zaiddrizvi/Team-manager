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
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="panel w-full max-w-md space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Login</h1>
          <p className="mt-1 text-sm text-slate-500">Use admin@test.com or member@test.com with 123456.</p>
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
          Need an account? <Link className="font-semibold text-teal-700" to="/signup">Sign up</Link>
        </p>
      </form>
    </main>
  );
}
