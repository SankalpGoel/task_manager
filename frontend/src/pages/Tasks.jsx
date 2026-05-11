import { useState, useEffect } from 'react';
import { Plus, Loader2, Calendar, Edit2 } from 'lucide-react';
import { api } from '../api';

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [taskForm, setTaskForm] = useState({ id: null, title: '', description: '', project_id: '', status: 'TODO', due_date: '', assignee_id: '' });

  const fetchData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        api.getTasks(),
        api.getProjects()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      
      if (user.role === 'ADMIN') {
        const usersData = await api.getUsers();
        setUsers(usersData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...taskForm,
        project_id: parseInt(taskForm.project_id),
        assignee_id: taskForm.assignee_id ? parseInt(taskForm.assignee_id) : null,
        due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null
      };
      
      if (isEditing) {
        await api.updateTask(taskForm.id, payload);
      } else {
        await api.createTask(payload);
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setTaskForm({ id: null, title: '', description: '', project_id: '', status: 'TODO', due_date: '', assignee_id: '' });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setIsEditing(true);
    setTaskForm({ 
      id: task.id, 
      title: task.title, 
      description: task.description || '', 
      project_id: task.project_id, 
      status: task.status, 
      due_date: task.due_date ? task.due_date.split('T')[0] : '', 
      assignee_id: task.assignee_id || '' 
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTaskForm({ id: null, title: '', description: '', project_id: '', status: 'TODO', due_date: '', assignee_id: '' });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'TODO') return '#94a3b8';
    if (status === 'IN_PROGRESS') return '#818cf8';
    if (status === 'DONE') return '#34d399';
    return 'white';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Tasks</h1>
        {user.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={20} /> New Task
          </button>
        )}
      </div>

      {loading ? (
        <div style={{display: 'flex', justifyContent: 'center', padding: '3rem'}}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tasks.map(task => (
            <div key={task.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{task.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {task.description || 'No description'}
                </p>
                {task.due_date && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <select 
                  className="form-select" 
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  style={{ width: 'auto', padding: '0.5rem', color: getStatusColor(task.status) }}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                
                {user.role === 'ADMIN' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-icon" 
                      onClick={() => openEditModal(task)}
                      title="Edit Task"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={async () => {
                        if (confirm('Are you sure?')) {
                          await api.deleteTask(task.id);
                          fetchData();
                        }
                      }}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleCreateOrUpdateTask}>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Task Title</label>
                <input 
                  className="form-input" 
                  value={taskForm.title} 
                  onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={taskForm.description} 
                  onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select 
                  className="form-select" 
                  value={taskForm.project_id} 
                  onChange={e => setTaskForm({...taskForm, project_id: e.target.value})}
                  required
                >
                  <option value="" disabled>Select a project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {user.role === 'ADMIN' && (
                <div className="form-group">
                  <label className="form-label">Assignee</label>
                  <select 
                    className="form-select" 
                    value={taskForm.assignee_id} 
                    onChange={e => setTaskForm({...taskForm, assignee_id: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="date"
                  className="form-input" 
                  value={taskForm.due_date} 
                  onChange={e => setTaskForm({...taskForm, due_date: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
