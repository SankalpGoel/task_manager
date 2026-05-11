import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../api';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {user.role === 'ADMIN' ? 'System-wide statistics overview.' : 'Overview of your assigned tasks.'}
      </p>

      {stats && (
        <div className="dashboard-grid">
          <div className="card stat-card">
            <span style={{ color: 'var(--text-secondary)' }}>Total Projects</span>
            <span className="stat-value">{stats.total_projects}</span>
          </div>
          <div className="card stat-card">
            <span style={{ color: 'var(--text-secondary)' }}>Total Tasks</span>
            <span className="stat-value">{stats.total_tasks}</span>
          </div>
          <div className="card stat-card">
            <span style={{ color: 'var(--text-secondary)' }}>To Do</span>
            <span className="stat-value" style={{ background: '#94a3b8', WebkitBackgroundClip: 'text' }}>{stats.todo_tasks}</span>
          </div>
          <div className="card stat-card">
            <span style={{ color: 'var(--text-secondary)' }}>In Progress</span>
            <span className="stat-value" style={{ background: '#818cf8', WebkitBackgroundClip: 'text' }}>{stats.in_progress_tasks}</span>
          </div>
          <div className="card stat-card">
            <span style={{ color: 'var(--text-secondary)' }}>Done</span>
            <span className="stat-value" style={{ background: '#34d399', WebkitBackgroundClip: 'text' }}>{stats.done_tasks}</span>
          </div>
          <div className="card stat-card">
            <span style={{ color: 'var(--text-secondary)' }}>Overdue</span>
            <span className="stat-value" style={{ background: '#ef4444', WebkitBackgroundClip: 'text' }}>{stats.overdue_tasks}</span>
          </div>
        </div>
      )}
    </div>
  );
}
