import { useGetDashboardQuery } from '../api/apiSlice';
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const { data, isLoading } = useGetDashboardQuery();
  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;
  const d = data || {totalProjects:0,totalTasks:0,statusCounts:{todo:0,in_progress:0,done:0},overdueTasks:[],myTasks:[]};

  return (
    <div style={{animation:'fadeIn 0.3s ease'}}>
      <h1 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:4}}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
      <p style={{color:'var(--text-secondary)',marginBottom:28,fontSize:'0.9rem'}}>Here's what's happening across your projects.</p>
      <div className="stats-grid">
        {[
          {icon:<FolderKanban size={20} color="#3b82f6"/>,bg:'rgba(59,130,246,0.15)',val:d.totalProjects,label:'Projects'},
          {icon:<ListTodo size={20} color="#9ca3af"/>,bg:'rgba(107,114,128,0.15)',val:d.statusCounts.todo,label:'To Do'},
          {icon:<Clock size={20} color="#f59e0b"/>,bg:'rgba(245,158,11,0.15)',val:d.statusCounts.in_progress,label:'In Progress'},
          {icon:<CheckCircle2 size={20} color="#10b981"/>,bg:'rgba(16,185,129,0.15)',val:d.statusCounts.done,label:'Completed'},
        ].map((s,i)=>(
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{background:s.bg}}>{s.icon}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-section glass-card" style={{padding:20}}>
          <div className="section-header">
            <h2 className="section-title" style={{display:'flex',alignItems:'center',gap:8}}><AlertTriangle size={16} color="var(--danger)"/> Overdue</h2>
            <span className="badge badge-high">{d.overdueTasks?.length||0}</span>
          </div>
          {d.overdueTasks?.length > 0 ? (
            <div className="task-list">{d.overdueTasks.slice(0,6).map(t=>(
              <Link to={`/projects/${t.project?._id||t.project}`} key={t._id} className="task-list-item">
                <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                <span className="task-list-title">{t.title}</span>
                <span className="task-card-due overdue">{fmt(t.dueDate)}</span>
              </Link>
            ))}</div>
          ) : <p style={{color:'var(--text-muted)',fontSize:'0.85rem',textAlign:'center',padding:'20px 0'}}>No overdue tasks 🎉</p>}
        </div>
        <div className="dashboard-section glass-card" style={{padding:20}}>
          <div className="section-header">
            <h2 className="section-title">My Tasks</h2>
            <span className="badge badge-in_progress">{d.myTasks?.length||0}</span>
          </div>
          {d.myTasks?.length > 0 ? (
            <div className="task-list">{d.myTasks.slice(0,6).map(t=>(
              <Link to={`/projects/${t.project?._id||t.project}`} key={t._id} className="task-list-item">
                <span className={`badge badge-${t.status}`}>{t.status==='in_progress'?'Active':t.status==='todo'?'To Do':'Done'}</span>
                <span className="task-list-title">{t.title}</span>
              </Link>
            ))}</div>
          ) : <p style={{color:'var(--text-muted)',fontSize:'0.85rem',textAlign:'center',padding:'20px 0'}}>No tasks assigned yet.</p>}
        </div>
      </div>
    </div>
  );
}
