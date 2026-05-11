import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Loader2 } from 'lucide-react';
import { api } from './api';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <Layout user={user} setUser={setUser} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard user={user} />} />
          <Route path="projects" element={<Projects user={user} />} />
          <Route path="tasks" element={<Tasks user={user} />} />
        </Route>
      </Routes>
    </Router>
  );
}

function Layout({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <h2>TaskMaster</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {user.name} ({user.role})
          </p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%' }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/projects" element={<Projects user={user} />} />
          <Route path="/tasks" element={<Tasks user={user} />} />
        </Routes>
      </main>
    </div>
  );
}
