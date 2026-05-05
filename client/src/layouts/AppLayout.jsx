import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { useGetProjectsQuery } from '../api/apiSlice';
import { LayoutDashboard, FolderKanban, LogOut, Menu, X, Settings } from 'lucide-react';
import { useState } from 'react';

const BoltLogo = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6"/>
        <stop offset="100%" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#bg)"/>
    <path d="M18 4L8 18h6l-2 10 10-14h-6l2-10z" fill="white"/>
  </svg>
);

export default function AppLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: projects } = useGetProjectsQuery();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const avatarColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const avatarColor = avatarColors[user?.name?.charCodeAt(0) % avatarColors.length];

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="modal-overlay" style={{zIndex: 99, background:'rgba(0,0,0,0.4)'}} onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <BoltLogo />
          <span>Bolt</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard className="icon" /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <FolderKanban className="icon" /> Projects
          </NavLink>

          {projects?.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Your Projects</div>
              {projects.map((p) => (
                <NavLink key={p._id} to={`/projects/${p._id}`}
                  className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}>
                  <span className="project-dot" style={{background: p.color}} />
                  <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{p.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-md" style={{background: avatarColor, color: '#fff'}}>
              {user?.avatar || user?.name?.[0]}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <button className="btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{display: 'none'}} id="menu-toggle">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div />
          <div className="topbar-actions" />
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          #menu-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
