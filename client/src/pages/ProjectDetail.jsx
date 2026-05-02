import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById, addMember, removeMember, deleteProject } from '../api/projects';
import { createTask, deleteTask } from '../api/tasks';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import AdminOnly from '../components/AdminOnly';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add member
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);

  // Create task
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '', description: '', priority: 'medium', dueDate: '', assignee: ''
  });
  const [taskError, setTaskError] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await getProjectById(id);
      setProject(data.project);
      setTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    setMemberLoading(true);
    try {
      await addMember(id, memberEmail);
      setMemberEmail('');
      fetchProject();
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from project?')) return;
    try {
      await removeMember(id, userId);
      fetchProject();
    } catch (err) {
      alert('Failed to remove member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    setTaskLoading(true);
    try {
      const payload = { ...taskFormData };
      if (!payload.assignee) delete payload.assignee;
      if (!payload.dueDate) delete payload.dueDate;
      await createTask(id, payload);
      window.dispatchEvent(new Event('taskflow:refresh'));
      setTaskFormData({ title: '', description: '', priority: 'medium', dueDate: '', assignee: '' });
      setShowTaskForm(false);
      fetchProject();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setTaskError(errs ? errs.map(e => e.msg).join(', ') : (err.response?.data?.message || 'Failed to create task'));
    } finally {
      setTaskLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      console.log('Updating task status:', taskId, 'to:', newStatus);
      await axiosInstance.put(`/tasks/${taskId}`, { 
        status: newStatus 
      });
      fetchProject();
      window.dispatchEvent(new Event('taskflow:refresh'));
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAssigneeChange = async (taskId, newAssigneeId) => {
    try {
      console.log('Updating task assignee:', taskId, 'to:', newAssigneeId);
      await axiosInstance.put(`/tasks/${taskId}`, { 
        assigneeId: newAssigneeId  
      });
      fetchProject();
      window.dispatchEvent(new Event('taskflow:refresh'));
    } catch (err) {
      console.error('Assignee update failed:', err);
      alert('Failed to update assignee: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'all' ? true : t.status === statusFilter);

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'done').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const completionPercent = getCompletionPercentage();
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercent / 100) * circumference;

  if (loading) return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skeleton" style={{ width: '100%', maxWidth: '800px', height: '400px', borderRadius: 'var(--radius-xl)' }}></div>
    </div>
  );

  return (
    <div className="main-content page-enter">
      <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        
        <nav className="breadcrumb-nav">
          <Link to="/projects">Projects</Link>
          <span>›</span>
          <span style={{ color: 'var(--gray-900)' }}>{project?.name}</span>
        </nav>

        <header className="project-detail-header">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="project-detail-title">{project?.name}</h1>
                <p className="project-detail-desc">{project?.description || 'No description provided.'}</p>
              </div>
              <AdminOnly>
                <button className="nav-pill" style={{ color: 'var(--danger)', borderColor: '#fecaca' }} onClick={handleDeleteProject}>
                  Delete Project
                </button>
              </AdminOnly>
           </div>

           <div className="progress-ring-container">
              <div className="progress-ring">
                <svg width="48" height="48">
                  <circle className="progress-ring-circle-bg" cx="24" cy="24" r={radius} />
                  <circle 
                    className="progress-ring-circle-fill" 
                    cx="24" cy="24" r={radius} 
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                  />
                </svg>
                <div className="progress-ring-text">{completionPercent}%</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-400)' }}>
                {tasks.filter(t => t.status === 'done').length} of {tasks.length} tasks completed
              </div>
           </div>
        </header>

        <div className="project-detail-container">
          <main className="tasks-main-column">
            <div className="task-filters-container">
              {['all', 'todo', 'in_progress', 'done'].map(f => (
                <button
                  key={f}
                  className={`filter-pill ${statusFilter === f ? 'active' : ''}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'all' ? 'All Tasks' : f === 'in_progress' ? 'In Progress' : f === 'todo' ? 'To Do' : 'Completed'}
                </button>
              ))}
            </div>

            <AdminOnly>
              <div className="inline-create-task">
                {!showTaskForm ? (
                  <div className="inline-create-btn" onClick={() => setShowTaskForm(true)}>
                    <span>+</span> Add new task
                  </div>
                ) : (
                  <form onSubmit={handleCreateTask} style={{ animation: 'fadeSlideUp 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h4 style={{ color: 'var(--brand-600)' }}>New Task</h4>
                      <button type="button" onClick={() => setShowTaskForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
                    </div>
                    
                    {taskError && <div className="badge badge-danger" style={{ width: '100%', padding: '12px', marginBottom: '16px' }}>{taskError}</div>}

                    <div className="form-group-with-icon">
                      <label>Task Title</label>
                      <input
                        type="text" className="input-field" placeholder="Enter task title"
                        value={taskFormData.title}
                        onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group-with-icon">
                      <label>Description</label>
                      <textarea
                        className="input-field" style={{ height: 'auto', padding: '12px 16px' }}
                        placeholder="Enter task description"
                        value={taskFormData.description}
                        onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="form-group-with-icon">
                        <label>Priority</label>
                        <select className="input-field" value={taskFormData.priority} onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="form-group-with-icon">
                        <label>Due Date</label>
                        <input
                          type="date" className="input-field"
                          value={taskFormData.dueDate}
                          onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group-with-icon">
                        <label>Assignee</label>
                        <select className="input-field" value={taskFormData.assignee} onChange={(e) => setTaskFormData({ ...taskFormData, assignee: e.target.value })}>
                          <option value="">Unassigned</option>
                          {project?.members?.map((m) => (
                            <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button type="submit" className="btn-primary-gradient" style={{ height: '40px' }} disabled={taskLoading}>
                        {taskLoading ? 'Creating...' : 'Create Task'}
                      </button>
                      <button type="button" className="nav-pill" style={{ border: '1.5px solid var(--border)', background: 'white' }} onClick={() => setShowTaskForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </AdminOnly>

            {filteredTasks.length === 0 ? (
              <div className="empty-state-new" style={{ padding: '48px 40px', textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56,
                  borderRadius: 12,
                  background: 'var(--gray-50)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--gray-300)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </div>
                <p style={{ color: 'var(--gray-400)', fontWeight: 500, margin: 0 }}>No tasks found for this filter.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredTasks.map((task) => (
                  <div key={task._id} style={{ position: 'relative' }}>
                    <TaskCard 
                      task={{ ...task, project: { _id: id, name: project?.name } }} 
                      members={project?.members || []}
                      onStatusChange={handleStatusChange}
                      onAssigneeChange={handleAssigneeChange}
                    />
                    <AdminOnly>
                      <button
                        style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-200)', transition: '0.2s' }}
                        onMouseOver={(e) => e.target.style.color = 'var(--danger)'}
                        onMouseOut={(e) => e.target.style.color = 'var(--gray-200)'}
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                        title="Delete task"
                      >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </AdminOnly>
                  </div>
                ))}
              </div>
            )}
          </main>

          <aside className="project-sidebar">
            <div className="sidebar-panel">
              <div className="sidebar-panel-header">
                <h4>Team Members</h4>
                <span className="badge badge-brand">{project?.members?.length}</span>
              </div>
              <div className="members-list-new">
                {project?.members?.map((m) => (
                  <div key={m.user._id} className="member-row-new">
                    <div className="avatar" style={{ backgroundColor: ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b'][Math.floor(Math.random() * 4)], width: '32px', height: '32px' }}>
                      {m.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{m.user.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.user.role}</div>
                    </div>
                    <AdminOnly>
                      {m.user._id !== user?._id && (
                        <div className="member-remove-btn" onClick={() => handleRemoveMember(m.user._id)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </div>
                      )}
                    </AdminOnly>
                  </div>
                ))}
              </div>

              <AdminOnly>
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--gray-50)' }}>
                   <form onSubmit={handleAddMember}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: '8px' }}>ADD MEMBER</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="email" className="input-field" style={{ height: '38px', fontSize: '13px' }}
                        placeholder="Enter member email"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn-primary-gradient" style={{ height: '38px', padding: '0 12px' }} disabled={memberLoading}>
                        {memberLoading ? '...' : 'Invite'}
                      </button>
                    </div>
                    {memberError && <p style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{memberError}</p>}
                  </form>
                </div>
              </AdminOnly>
            </div>

            <div className="sidebar-panel">
               <h4>Project Info</h4>
               <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--gray-400)' }}>Created</span>
                    <span style={{ fontWeight: 600 }}>{new Date(project?.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--gray-400)' }}>Total Tasks</span>
                    <span style={{ fontWeight: 600 }}>{tasks.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--gray-400)' }}>Owner</span>
                    <span style={{ fontWeight: 600 }}>{project?.owner?.name}</span>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
