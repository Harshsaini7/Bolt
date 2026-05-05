import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProjectQuery, useUpdateProjectMutation, useDeleteProjectMutation, useAddMemberMutation, useRemoveMemberMutation } from '../api/apiSlice';
import { useSelector } from 'react-redux';
import { ArrowLeft, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#f97316'];

export default function ProjectSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s=>s.auth);
  const { data: project, isLoading } = useGetProjectQuery(id);
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [addMember] = useAddMemberMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [init, setInit] = useState(false);

  if (isLoading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!project) return <div className="empty-state"><h3>Project not found</h3></div>;

  const isAdmin = project.members?.find(m=>(m.user?._id||m.user)===user?._id)?.role==='admin';
  if (!isAdmin) { navigate(`/projects/${id}`); return null; }

  if (!init) { setName(project.name); setDesc(project.description||''); setColor(project.color); setInit(true); }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { await updateProject({id,name,description:desc,color}).unwrap(); toast.success('Updated!'); } catch(err) { toast.error(err?.data?.message||'Failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project and ALL its tasks? This cannot be undone.')) return;
    try { await deleteProject(id).unwrap(); toast.success('Deleted'); navigate('/projects'); } catch(err) { toast.error(err?.data?.message||'Failed'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');
    try { await addMember({projectId:id,email,role}).unwrap(); toast.success('Member added!'); setEmail(''); }
    catch(err) { toast.error(err?.data?.message||'Failed'); }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try { await removeMember({projectId:id,userId}).unwrap(); toast.success('Removed'); }
    catch(err) { toast.error(err?.data?.message||'Failed'); }
  };

  return (
    <div style={{animation:'fadeIn 0.3s ease',maxWidth:640}}>
      <button className="btn btn-secondary btn-sm" onClick={()=>navigate(`/projects/${id}`)} style={{marginBottom:20}}>
        <ArrowLeft size={14}/> Back to Board
      </button>
      <h1 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:24}}>Project Settings</h1>

      <div className="settings-section">
        <h3>General</h3>
        <form onSubmit={handleUpdate} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="form-group"><label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Description</label>
            <textarea className="form-textarea" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Color</label>
            <div style={{display:'flex',gap:8}}>{colors.map(c=>(
              <button type="button" key={c} onClick={()=>setColor(c)}
                style={{width:28,height:28,borderRadius:'50%',background:c,border:color===c?'2px solid #fff':'2px solid transparent',cursor:'pointer'}}/>
            ))}</div></div>
          <button type="submit" className="btn btn-primary" style={{alignSelf:'flex-start'}}>Save Changes</button>
        </form>
      </div>

      <div className="settings-section">
        <h3>Members ({project.members?.length})</h3>
        <form onSubmit={handleAddMember} style={{display:'flex',gap:8,marginBottom:16}}>
          <input className="form-input" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1}}/>
          <select className="form-select" value={role} onChange={e=>setRole(e.target.value)} style={{width:120}}>
            <option value="member">Member</option><option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn btn-primary"><UserPlus size={16}/> Add</button>
        </form>
        {project.members?.map((m,i)=>(
          <div className="member-item" key={m.user?._id||i}>
            <div className="avatar avatar-md" style={{background:colors[i%colors.length],color:'#fff'}}>
              {m.user?.avatar||m.user?.name?.[0]}
            </div>
            <div className="member-info">
              <div className="member-name">{m.user?.name}</div>
              <div className="member-email">{m.user?.email}</div>
            </div>
            <span className={`badge badge-${m.role}`}>{m.role}</span>
            {m.user?._id !== project.owner?._id && m.user?._id !== project.owner && (
              <button className="btn-icon" onClick={()=>handleRemove(m.user?._id)}><Trash2 size={14} color="var(--danger)"/></button>
            )}
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h3>Danger Zone</h3>
        <div style={{background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'var(--radius-md)',padding:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><p style={{fontWeight:600,fontSize:'0.9rem'}}>Delete Project</p><p style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>This will permanently delete the project and all tasks.</p></div>
          <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={14}/> Delete</button>
        </div>
      </div>
    </div>
  );
}
