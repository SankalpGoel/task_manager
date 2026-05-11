import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { access_token } = await api.login(email, password);
      localStorage.setItem('token', access_token);
      
      const userData = await api.getMe();
      setUser(userData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card glass">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
