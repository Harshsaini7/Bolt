import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectsQuery, useCreateProjectMutation } from '../api/apiSlice';
import { Plus, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';

const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#f97316'];

export default function ProjectsPage() {
  const { data: projects, isLoading } = useGetProjectsQuery();
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6' });
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Project name is required');
    try {
      const res = await createProject(form).unwrap();
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '', color: '#3b82f6' });
      navigate(`/projects/${res._id}`);
    } catch (err) { toast.error(err?.data?.message || 'Failed to create project'); }
  };

  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div style={{animation:'fadeIn 0.3s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h1 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:4}}>Projects</h1>
          <p style={{color:'var(--text-secondary)',fontSize:'0.9rem'}}>{projects?.length || 0} projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16}/> New Project</button>
      </div>

      {projects?.length > 0 ? (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p._id} className="glass-card project-card" onClick={() => navigate(`/projects/${p._id}`)}
              style={{cursor:'pointer'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:p.color}} />
              <div className="project-card-header">
                <h3 className="project-card-name">{p.name}</h3>
                <span className="badge" style={{background:`${p.color}22`,color:p.color}}>{p.members?.length} members</span>
              </div>
              {p.description && <p className="project-card-desc">{p.description}</p>}
              <div className="project-card-stats">
                <div className="project-card-stat"><span>{p.taskCounts?.todo||0}</span> todo</div>
                <div className="project-card-stat"><span>{p.taskCounts?.in_progress||0}</span> active</div>
                <div className="project-card-stat"><span>{p.taskCounts?.done||0}</span> done</div>
              </div>
              <div className="project-card-footer">
                <div className="members-stack">
                  {p.members?.slice(0,4).map((m,i)=>(
                    <div key={i} className="avatar avatar-sm" style={{background:colors[i%colors.length],color:'#fff'}}>
                      {m.user?.avatar || m.user?.name?.[0]}
                    </div>
                  ))}
                  {p.members?.length > 4 && <div className="avatar avatar-sm" style={{background:'var(--bg-tertiary)',fontSize:'0.6rem'}}>+{p.members.length-4}</div>}
                </div>
                <span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{p.totalTasks||0} tasks</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FolderKanban className="icon" size={48}/>
          <h3>No projects yet</h3>
          <p>Create your first project to get started.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16}/> Create Project</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">New Project</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="auth-form">
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input className="form-input" placeholder="e.g. Marketing Campaign" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Optional description..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{display:'flex',gap:8}}>
                    {colors.map(c=>(
                      <button type="button" key={c} onClick={()=>setForm({...form,color:c})}
                        style={{width:28,height:28,borderRadius:'50%',background:c,border:form.color===c?'2px solid #fff':'2px solid transparent',cursor:'pointer'}}/>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating?'Creating...':'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
