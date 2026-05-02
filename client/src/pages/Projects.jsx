import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject } from '../api/projects';
import { AuthContext } from '../context/AuthContext';
import AdminOnly from '../components/AdminOnly';

const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const Projects = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setError(null);
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Projects Error:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await createProject(formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setFormLoading(false);
    }
  };

  const safeProjects = Array.isArray(projects) ? projects : [];
  const filteredProjects = safeProjects.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getGradient = (name = 'Project') => {
    const gradients = [
      'linear-gradient(90deg, var(--brand-600), var(--accent-pink))',
      'linear-gradient(90deg, var(--accent-cyan), var(--brand-600))',
      'linear-gradient(90deg, var(--accent-amber), #f97316)',
      'linear-gradient(90deg, var(--accent-green), var(--accent-cyan))',
      'linear-gradient(90deg, #ec4899, #8b5cf6)'
    ];
    let hash = 0;
    const str = String(name || 'Project');
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  if (loading) return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skeleton" style={{ width: '320px', height: '200px', borderRadius: 'var(--radius-lg)' }}></div>
    </div>
  );

  if (error) return (
    <div className="main-content" style={{ padding: 40, textAlign: 'center' }}>
       <div className="badge badge-danger" style={{ padding: '24px', fontSize: '16px', borderRadius: '12px' }}>
         <div style={{ fontWeight: 800, marginBottom: '8px' }}>⚠️ Error loading projects</div>
         <div style={{ opacity: 0.8 }}>{error}</div>
         <button className="nav-pill" style={{ marginTop: '16px', background: 'white' }} onClick={fetchProjects}>Try Again</button>
       </div>
    </div>
  );

  return (
    <div className="main-content page-enter">
      <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        
        <header className="projects-page-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{ fontSize: '28px' }}>Projects</h1>
            <span className="projects-count-badge">{(safeProjects).length} Total</span>
          </div>
          <AdminOnly>
            <button 
              className="btn-primary-gradient" 
              style={{ height: '44px', padding: '0 20px', borderRadius: 'var(--radius-full)' }}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Close' : '+ New Project'}
            </button>
          </AdminOnly>
        </header>

        <div className="search-container-pill">
          <span className="search-icon-pill">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            type="text" 
            className="search-input-pill" 
            placeholder="Search your projects by name or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showForm && (
          <div className="card" style={{ padding: '32px', marginBottom: '40px', animation: 'fadeSlideUp 0.3s ease' }}>
            <h3 style={{ marginBottom: '24px' }}>Create New Project</h3>
            {formError && <div className="badge badge-danger" style={{ width: '100%', padding: '12px', marginBottom: '16px' }}>{formError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group-with-icon">
                <label>Project Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group-with-icon">
                <label>Description</label>
                <textarea
                  className="input-field"
                  style={{ height: 'auto', padding: '12px 16px' }}
                  placeholder="Enter project description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="submit" className="btn-primary-gradient" style={{ height: '44px' }} disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Create Project'}
                </button>
                <button 
                  type="button" 
                  className="nav-pill" 
                  style={{ border: '1.5px solid var(--border)', background: 'white' }}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {filteredProjects.length === 0 ? (
          <div className="empty-state-new">
            <div className="empty-illustration">
              <div className="empty-circle" style={{ borderColor: 'var(--brand-50)' }}></div>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 48, height: 48,
                background: 'var(--gray-50)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
            </div>
            <h3>No projects found</h3>
            <p style={{ color: 'var(--gray-400)' }}>
              {searchTerm ? `We couldn't find any projects matching "${searchTerm}"` : 'Your project library is currently empty.'}
            </p>
          </div>
        ) : (
          <div className="projects-grid-new">
            {filteredProjects.map((project) => (
              <div 
                key={project?._id} 
                className="project-card-new" 
                onClick={() => navigate(`/projects/${project?._id}`)}
              >
                <div 
                  className="project-card-top-bar" 
                  style={{ background: getGradient(project?.name) }}
                ></div>
                
                <div className="project-card-body">
                  <h3 className="project-card-title">{project?.name || 'Untitled Project'}</h3>
                  <p className="project-card-description">
                    {project?.description || 'No description provided for this project.'}
                  </p>

                  <div className="project-member-stack">
                    {project?.members?.slice(0, 4).map((member, idx) => (
                      <div 
                        key={member?.user?._id || idx} 
                        className="project-member-avatar"
                        style={{ 
                          backgroundColor: ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b'][idx % 4],
                          zIndex: 5 - idx
                        }}
                        title={member?.user?.name}
                      >
                        {getInitials(member.user?.name || '?')}
                      </div>
                    ))}
                    {(project?.members?.length || 0) > 4 && (
                      <div className="more-members-badge">+{(project.members.length) - 4}</div>
                    )}
                  </div>
                </div>

                <div className="project-card-footer">
                  <div className="project-stats-row">
                    <span>{project?.taskCount || 0} tasks</span>
                    <div className="project-progress-mini">
                       <div className="project-progress-bar-mini" style={{ width: `${project?.completionRate || 0}%` }}></div>
                    </div>
                  </div>
                  <div className={`badge ${project?.owner?._id === user?._id ? 'badge-brand' : 'badge-info'}`}>
                    {project?.owner?._id === user?._id ? 'Owner' : 'Member'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
