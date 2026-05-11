import { useState, useEffect } from 'react';
import { Plus, Users, Edit2, Loader2 } from 'lucide-react';
import { api } from '../api';

export default function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [projectForm, setProjectForm] = useState({ id: null, name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateOrUpdateProject = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.updateProject(projectForm.id, { name: projectForm.name, description: projectForm.description });
      } else {
        await api.createProject({ name: projectForm.name, description: projectForm.description });
      }
      closeModal();
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setProjectForm({ id: null, name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setIsEditing(true);
    setProjectForm({ id: project.id, name: project.name, description: project.description || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setProjectForm({ id: null, name: '', description: '' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Projects</h1>
        {user.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div style={{display: 'flex', justifyContent: 'center', padding: '3rem'}}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="dashboard-grid">
          {projects.map(project => (
            <div key={project.id} className="card">
              <h3>{project.name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {project.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>ID: {project.id}</span>
                {user.role === 'ADMIN' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon" onClick={() => openEditModal(project)} title="Edit Project"><Edit2 size={18} /></button>
                    <button className="btn-icon" title="Manage Members"><Users size={18} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {projects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{isEditing ? 'Edit Project' : 'Create New Project'}</h2>
            <form onSubmit={handleCreateOrUpdateProject}>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Project Name</label>
                <input 
                  className="form-input" 
                  value={projectForm.name} 
                  onChange={e => setProjectForm({...projectForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={projectForm.description} 
                  onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                ></textarea>
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
