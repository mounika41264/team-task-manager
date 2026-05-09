import React, { useState } from 'react';

const API = 'https://team-task-manager-production-11d3.up.railway.app';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [msg, setMsg] = useState('');

  const handleSubmit = async () => {
    if (isSignup && (!name || !email || !password)) { setMsg('All fields required'); return; }
    if (!email || !password) { setMsg('All fields required'); return; }
    const url = isSignup ? `${API}/api/auth/signup` : `${API}/api/auth/login`;
    const body = isSignup ? { name, email, password, role } : { email, password };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.token) { onLogin(data.token, data.user); }
      else { setMsg(data.message || 'Error'); }
    } catch { setMsg('Server error'); }
  };

  return (
    <div style={{maxWidth:400,margin:'80px auto',padding:30,boxShadow:'0 0 20px #ccc',borderRadius:10}}>
      <h2 style={{textAlign:'center',color:'#4A90E2'}}>🗂️ Team Task Manager</h2>
      <h3 style={{textAlign:'center'}}>{isSignup ? 'Sign Up' : 'Login'}</h3>
      {isSignup && <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} style={inp}/>}
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inp}/>
      {isSignup && (
        <select value={role} onChange={e=>setRole(e.target.value)} style={inp}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      )}
      <button onClick={handleSubmit} style={btn}>{isSignup ? 'Sign Up' : 'Login'}</button>
      {msg && <p style={{textAlign:'center',color:'red'}}>{msg}</p>}
      <p style={{textAlign:'center'}}>
        {isSignup ? 'Already have account?' : "Don't have account?"}
        <span onClick={()=>{setIsSignup(!isSignup);setMsg('');}} style={{color:'#4A90E2',cursor:'pointer'}}> {isSignup?'Login':'Sign Up'}</span>
      </p>
    </div>
  );
}

function Dashboard({ token, user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [tab, setTab] = useState('projects');

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  const isAdmin = user?.role === 'admin';

  const loadProjects = async () => {
    try {
      const res = await fetch(`${API}/api/projects`, { headers });
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {}
  };

  const loadTasks = async () => {
    try {
      const res = await fetch(`${API}/api/tasks`, { headers });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {}
  };

  React.useEffect(() => { loadProjects(); loadTasks(); }, []);

  const addProject = async () => {
    if (!projectName) return;
    await fetch(`${API}/api/projects`, { method:'POST', headers, body: JSON.stringify({ name: projectName }) });
    setProjectName(''); loadProjects();
  };

  const addTask = async () => {
    if (!taskTitle) return;
    await fetch(`${API}/api/tasks`, { method:'POST', headers, body: JSON.stringify({ title: taskTitle, status:'pending' }) });
    setTaskTitle(''); loadTasks();
  };

  const updateTask = async (id, status) => {
    await fetch(`${API}/api/tasks/${id}`, { method:'PUT', headers, body: JSON.stringify({ status }) });
    loadTasks();
  };

  const deleteProject = async (id) => {
    await fetch(`${API}/api/projects/${id}`, { method:'DELETE', headers });
    loadProjects();
  };

  return (
    <div style={{maxWidth:800,margin:'0 auto',padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#4A90E2',padding:'10px 20px',borderRadius:10,color:'white',marginBottom:20}}>
        <h2 style={{margin:0}}>🗂️ Team Task Manager</h2>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span>👤 {user?.name}</span>
          <span style={{background: isAdmin?'#F5A623':'#7ED321',padding:'2px 8px',borderRadius:10,fontSize:12}}>
            {isAdmin ? '👑 Admin' : '👥 Member'}
          </span>
          <button onClick={onLogout} style={{padding:'5px 10px',background:'white',color:'#4A90E2',border:'none',borderRadius:5,cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:20}}>
        {['projects','tasks','dashboard'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{...btn,background:tab===t?'#4A90E2':'#ccc',width:'auto',padding:'8px 20px',textTransform:'capitalize'}}>
            {t}
          </button>
        ))}
      </div>

      {tab==='projects' && (
        <div>
          <h3>Projects {isAdmin && <span style={{fontSize:12,color:'green'}}>(Admin: can add/delete)</span>}</h3>
          {isAdmin && (
            <div style={{display:'flex',gap:10,marginBottom:20}}>
              <input placeholder="Project name" value={projectName} onChange={e=>setProjectName(e.target.value)} style={{...inp,margin:0,flex:1}}/>
              <button onClick={addProject} style={{...btn,width:'auto',padding:'8px 20px'}}>Add</button>
            </div>
          )}
          {projects.map(p=>(
            <div key={p._id} style={{padding:15,marginBottom:10,background:'#f5f5f5',borderRadius:8,borderLeft:'4px solid #4A90E2',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <b>{p.name}</b>
              {isAdmin && <button onClick={()=>deleteProject(p._id)} style={{background:'#ff4444',color:'white',border:'none',borderRadius:5,padding:'4px 10px',cursor:'pointer'}}>Delete</button>}
            </div>
          ))}
          {projects.length===0 && <p style={{color:'#999'}}>{isAdmin ? 'No projects yet. Add one!' : 'No projects available.'}</p>}
        </div>
      )}

      {tab==='tasks' && (
        <div>
          <h3>Tasks</h3>
          <div style={{display:'flex',gap:10,marginBottom:20}}>
            <input placeholder="Task title" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} style={{...inp,margin:0,flex:1}}/>
            <button onClick={addTask} style={{...btn,width:'auto',padding:'8px 20px'}}>Add</button>
          </div>
          {tasks.map(t=>(
            <div key={t._id} style={{padding:15,marginBottom:10,background:'#f5f5f5',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span>{t.title}</span>
              <select value={t.status} onChange={e=>updateTask(t._id,e.target.value)} style={{padding:5,borderRadius:5}}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
          {tasks.length===0 && <p style={{color:'#999'}}>No tasks yet. Add one!</p>}
        </div>
      )}

      {tab==='dashboard' && (
        <div>
          <h3>Dashboard</h3>
          <div style={{background:'#f0f8ff',padding:15,borderRadius:8,marginBottom:20}}>
            <p><b>Role:</b> {isAdmin ? '👑 Admin — Full Access' : '👥 Member — View & Update Tasks'}</p>
          </div>
          <div style={{display:'flex',gap:15,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:150,padding:20,background:'#4A90E2',color:'white',borderRadius:10,textAlign:'center'}}>
              <h2>{projects.length}</h2><p>Projects</p>
            </div>
            <div style={{flex:1,minWidth:150,padding:20,background:'#F5A623',color:'white',borderRadius:10,textAlign:'center'}}>
              <h2>{tasks.filter(t=>t.status==='pending').length}</h2><p>Pending</p>
            </div>
            <div style={{flex:1,minWidth:150,padding:20,background:'#7ED321',color:'white',borderRadius:10,textAlign:'center'}}>
              <h2>{tasks.filter(t=>t.status==='completed').length}</h2><p>Completed</p>
            </div>
            <div style={{flex:1,minWidth:150,padding:20,background:'#9B59B6',color:'white',borderRadius:10,textAlign:'center'}}>
              <h2>{tasks.filter(t=>t.status==='in-progress').length}</h2><p>In Progress</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = {display:'block',width:'100%',padding:10,margin:'10px 0',borderRadius:5,border:'1px solid #ccc',boxSizing:'border-box'};
const btn = {padding:'10px 20px',background:'#4A90E2',color:'white',border:'none',borderRadius:5,cursor:'pointer',width:'100%'};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')||'null'));

  const handleLogin = (t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null); setUser(null);
  };

  return token ? <Dashboard token={token} user={user} onLogout={handleLogout}/> : <Login onLogin={handleLogin}/>;
}