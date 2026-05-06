import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="panel w-full max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <div className="space-y-1">
          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <label htmlFor="role">Role</label>
          <select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
        <p className="text-center text-sm text-slate-600">
          Already have an account? <Link className="font-semibold text-teal-700" to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
