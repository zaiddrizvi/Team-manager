import { useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const emptyForm = {
  title: '',
  description: '',
  project: '',
  assignedTo: '',
  status: 'todo',
  priority: 'medium',
  dueDate: ''
};

export default function TaskForm({ projects, initialTask, onSaved, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title,
        description: initialTask.description,
        project: initialTask.project?._id || initialTask.project,
        assignedTo: initialTask.assignedTo?._id || initialTask.assignedTo,
        status: initialTask.status,
        priority: initialTask.priority,
        dueDate: initialTask.dueDate?.slice(0, 10)
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialTask]);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === form.project),
    [projects, form.project]
  );

  const members = selectedProject?.members || [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'project' ? { assignedTo: '' } : {})
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (initialTask) {
        await api.put(`/tasks/${initialTask._id}`, form);
      } else {
        await api.post('/tasks', form);
      }
      setForm(emptyForm);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="space-y-1">
          <label htmlFor="project">Project</label>
          <select id="project" name="project" value={form.project} onChange={handleChange} required>
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" value={form.description} onChange={handleChange} required />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="assignedTo">Assignee</label>
          <select id="assignedTo" name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>{member.name} ({member.email})</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            <option value="todo">todo</option>
            <option value="in-progress">in-progress</option>
            <option value="done">done</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="dueDate">Due date</label>
          <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required />
        </div>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save task'}</button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
