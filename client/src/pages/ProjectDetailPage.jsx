import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProjectQuery, useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../api/apiSlice';
import { useSelector } from 'react-redux';
import { Plus, Settings, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useSelector(s=>s.auth);
  const { data: project, isLoading: pLoading } = useGetProjectQuery(id);
  const { data: tasks, isLoading: tLoading } = useGetTasksQuery({ projectId: id });
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title:'', description:'', priority:'medium', assignee:'', dueDate:'' });

  const isAdmin = project?.members?.find(m => (m.user?._id||m.user) === user?._id)?.role === 'admin';
  const columns = [
    { key:'todo', label:'To Do', color:'#6b7280' },
    { key:'in_progress', label:'In Progress', color:'#3b82f6' },
    { key:'done', label:'Done', color:'#10b981' },
  ];

  const openCreate = () => { setEditTask(null); setForm({title:'',description:'',priority:'medium',assignee:'',dueDate:''}); setShowModal(true); };
  const openEdit = (t) => { setEditTask(t); setForm({title:t.title,description:t.description||'',priority:t.priority,assignee:t.assignee?._id||'',dueDate:t.dueDate?t.dueDate.slice(0,10):''}); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    try {
      if (editTask) {
        await updateTask({ taskId: editTask._id, ...form }).unwrap();
        toast.success('Task updated');
      } else {
        await createTask({ projectId: id, ...form }).unwrap();
        toast.success('Task created');
      }
      setShowModal(false);
    } catch (err) { toast.error(err?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try { await updateTask({ taskId, status }).unwrap(); } catch(err) { toast.error(err?.data?.message||'Failed'); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try { await deleteTask(taskId).unwrap(); toast.success('Deleted'); } catch(err) { toast.error(err?.data?.message||'Failed'); }
  };

  if (pLoading||tLoading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!project) return <div className="empty-state"><h3>Project not found</h3></div>;

  return (
    <div style={{animation:'fadeIn 0.3s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
            <span style={{width:12,height:12,borderRadius:4,background:project.color,display:'inline-block'}}/>
            <h1 style={{fontSize:'1.5rem',fontWeight:800}}>{project.name}</h1>
          </div>
          {project.description && <p style={{color:'var(--text-secondary)',fontSize:'0.85rem'}}>{project.description}</p>}
        </div>
        <div style={{display:'flex',gap:8}}>
          {isAdmin && <button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Add Task</button>}
          {isAdmin && <Link to={`/projects/${id}/settings`} className="btn btn-secondary"><Settings size={16}/> Settings</Link>}
        </div>
      </div>

      <div className="kanban-board">
        {columns.map(col => {
          const colTasks = (tasks||[]).filter(t=>t.status===col.key);
          return (
            <div className="kanban-column" key={col.key}>
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span style={{width:8,height:8,borderRadius:'50%',background:col.color,display:'inline-block'}}/>
                  {col.label}
                </div>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              <div className="kanban-tasks">
                {colTasks.map(t=>(
                  <div className="task-card" key={t._id} onClick={()=>isAdmin?openEdit(t):null}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                      <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                      {isAdmin && <button className="btn-icon" onClick={e=>{e.stopPropagation();handleDelete(t._id)}} style={{padding:4}}><Trash2 size={13} color="var(--danger)"/></button>}
                    </div>
                    <div className="task-card-title">{t.title}</div>
                    <div className="task-card-meta">
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        {t.assignee && <div className="avatar avatar-sm" style={{background:'#3b82f6',color:'#fff'}}>{t.assignee.avatar||t.assignee.name?.[0]}</div>}
                        {!isAdmin && t.status!=='done' && (
                          <select value={t.status} onChange={e=>{e.stopPropagation();handleStatusChange(t._id,e.target.value)}}
                            onClick={e=>e.stopPropagation()}
                            style={{background:'var(--bg-tertiary)',border:'1px solid var(--border)',borderRadius:6,padding:'2px 6px',fontSize:'0.7rem',color:'var(--text-secondary)'}}>
                            <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option>
                          </select>
                        )}
                      </div>
                      {t.dueDate && <span className={`task-card-due ${new Date(t.dueDate)<new Date()&&t.status!=='done'?'overdue':''}`}><Calendar size={11}/>{fmt(t.dueDate)}</span>}
                    </div>
                  </div>
                ))}
                {colTasks.length===0 && <p style={{color:'var(--text-muted)',fontSize:'0.8rem',textAlign:'center',padding:'20px 0',opacity:0.5}}>No tasks</p>}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editTask?'Edit Task':'New Task'}</h2>
              <button className="btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="auth-form">
                <div className="form-group"><label className="form-label">Title</label>
                  <input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task title"/></div>
                <div className="form-group"><label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Optional..."/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="form-group"><label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select></div>
                  <div className="form-group"><label className="form-label">Due Date</label>
                    <input className="form-input" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
                </div>
                <div className="form-group"><label className="form-label">Assignee</label>
                  <select className="form-select" value={form.assignee} onChange={e=>setForm({...form,assignee:e.target.value})}>
                    <option value="">Unassigned</option>
                    {project.members?.map(m=><option key={m.user?._id} value={m.user?._id}>{m.user?.name} ({m.role})</option>)}
                  </select></div>
                {editTask && <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-select" value={form.status||editTask.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option>
                  </select></div>}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editTask?'Update':'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
