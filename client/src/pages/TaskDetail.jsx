import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const TaskDetail = () => {
  const { projectId, taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [task, setTask]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  // Local editable state
  const [status,      setStatus]      = useState('');
  const [priority,    setPriority]    = useState('');
  const [description, setDescription] = useState('');
  const [dueDate,     setDueDate]     = useState('');

  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [file,        setFile]        = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');

  // ── Fetch task ──────────────────────────────────
  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/tasks/project/${projectId}`
      );
      const found = res.data.tasks?.find(t => t._id === taskId);
      if (!found) {
        setError('Task not found');
        return;
      }
      setTask(found);
      setStatus(found.status      || 'todo');
      setPriority(found.priority  || 'medium');
      setDescription(found.description || '');
      setDueDate(
        found.dueDate
          ? new Date(found.dueDate).toISOString().split('T')[0]
          : ''
      );
      setAttachments(found.attachments || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTask(); }, [taskId]);

  // ── Save changes ────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put(`/tasks/${taskId}`, {
        status,
        priority,
        description,
        dueDate: dueDate || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      window.dispatchEvent(new Event('taskflow:refresh'));
      fetchTask();
    } catch (err) {
      alert('Save failed: ' + err.response?.data?.error);
    } finally {
      setSaving(false);
    }
  };

  // ── Upload attachment ───────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setUploadError('');
    try {
      const res = await axiosInstance.post(
        `/tasks/${taskId}/attachments`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setAttachments(prev => [...prev, res.data.attachment]);
      setFile(null);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete attachment ───────────────────────────
  const handleDeleteAttachment = async (attId) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await axiosInstance.delete(`/tasks/${taskId}/attachments/${attId}`);
      setAttachments(prev => prev.filter(a => a._id !== attId));
    } catch {
      alert('Delete failed');
    }
  };

  // ── Helpers ─────────────────────────────────────
  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = [
    '#6366f1','#ec4899','#06b6d4','#10b981','#f59e0b'
  ];

  const formatDate = (d) => {
    if (!d) return 'Not set';
    const date = new Date(d);
    if (isNaN(date)) return 'Not set';
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const isOverdue = task?.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  // ── Status config ────────────────────────────────
  const statusOptions = [
    { value: 'todo',        label: 'To Do',       color: '#f59e0b', bg: '#fffbeb' },
    { value: 'in_progress', label: 'In Progress',  color: '#06b6d4', bg: '#ecfeff' },
    { value: 'done',        label: 'Done',         color: '#10b981', bg: '#ecfdf5' },
  ];

  const priorityOptions = [
    { value: 'low',    label: 'Low',    color: '#10b981', bg: '#ecfdf5' },
    { value: 'medium', label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
    { value: 'high',   label: 'High',   color: '#ef4444', bg: '#fef2f2' },
  ];

  // ── Render ───────────────────────────────────────
  if (loading) return (
    <div className="page-wrapper page-enter">
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
        <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 48, width: '60%', marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--danger)' }}>
      <h2>{error}</h2>
      <button onClick={() => navigate(`/projects/${projectId}`)}>
        ← Back to Project
      </button>
    </div>
  );

  if (!task) return null;

  const isAdmin = user?.role === 'admin';
  const isMyTask = task.assignee?._id === user?._id;
  const canEdit = isAdmin || isMyTask;

  return (
    <div className="page-wrapper page-enter">
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Breadcrumb ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>
          <Link to="/projects" style={{ color: 'var(--gray-400)',
                                        textDecoration: 'none' }}>
            Projects
          </Link>
          <span>›</span>
          <Link to={`/projects/${projectId}`}
            style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>
            {task.project?.name || 'Project'}
          </Link>
          <span>›</span>
          <span style={{ color: 'var(--gray-900)', fontWeight: 500 }}>
            {task.title}
          </span>
        </div>

        {/* ── Task Title ── */}
        <h1 style={{
          fontSize: 26, fontWeight: 800, margin: '0 0 8px',
          fontFamily: 'var(--font-display)', color: 'var(--gray-900)',
          lineHeight: 1.3,
        }}>
          {task.title}
        </h1>

        {/* ── Meta row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12,
                      marginBottom: 32, flexWrap: 'wrap' }}>
          {/* Current status badge */}
          {(() => {
            const s = statusOptions.find(o => o.value === task.status);
            return (
              <span style={{
                background: s?.bg, color: s?.color,
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                fontSize: 12, fontWeight: 600,
              }}>
                {s?.label}
              </span>
            );
          })()}

          {/* Priority badge */}
          {(() => {
            const p = priorityOptions.find(o => o.value === task.priority);
            return (
              <span style={{
                background: p?.bg, color: p?.color,
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                fontSize: 12, fontWeight: 600,
              }}>
                {p?.label} Priority
              </span>
            );
          })()}

          {isOverdue && (
            <span style={{
              background: '#fef2f2', color: 'var(--danger)',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              fontSize: 12, fontWeight: 600,
            }}>
              ⚠️ Overdue
            </span>
          )}
        </div>

        {/* ── Two column layout ── */}
        <div style={{ display: 'grid',
                      gridTemplateColumns: '1fr 320px',
                      gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: Description + Attachments ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Description */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14,
                           fontWeight: 600, color: 'var(--gray-600)',
                           textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Description
              </h3>
              {isAdmin ? (
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add a detailed description for this task..."
                  rows={6}
                  style={{
                    width: '100%', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '12px 14px',
                    fontSize: 14, fontFamily: 'var(--font-body)',
                    resize: 'vertical', outline: 'none',
                    color: 'var(--gray-900)',
                    background: 'var(--bg-subtle)',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--brand-500)';
                    e.target.style.background  = 'white';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.background  = 'var(--bg-subtle)';
                  }}
                />
              ) : (
                <p style={{ color: description ? 'var(--gray-900)' : 'var(--gray-400)',
                            fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  {description || 'No description added.'}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600,
                             color: 'var(--gray-600)',
                             textTransform: 'uppercase',
                             letterSpacing: '0.06em' }}>
                  Attachments
                </h3>
                <span style={{
                  background: 'var(--brand-50)', color: 'var(--brand-600)',
                  padding: '2px 8px', borderRadius: 'var(--radius-full)',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {attachments.length}
                </span>
              </div>

              {/* Attachment grid */}
              {attachments.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 12, marginBottom: 16,
                }}>
                  {attachments.map(att => (
                    <div key={att._id} style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden', position: 'relative',
                    }}>
                      {att.fileType?.startsWith('image/') ? (
                        <img src={att.url} alt={att.filename}
                          style={{ width: '100%', height: 100,
                                   objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{
                          height: 100, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          background: 'var(--bg-subtle)', fontSize: 32,
                        }}>
                          {att.fileType?.includes('pdf') ? '📄' : '📝'}
                        </div>
                      )}
                      <div style={{ padding: '8px 10px' }}>
                        <div style={{
                          fontSize: 11, fontWeight: 500,
                          color: 'var(--gray-900)',
                          whiteSpace: 'nowrap', overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {att.filename}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <a href={att.url} target="_blank" rel="noreferrer"
                            style={{ fontSize: 11, color: 'var(--brand-500)',
                                     textDecoration: 'none' }}>
                            View
                          </a>
                          {isAdmin && (
                            <button onClick={() => handleDeleteAttachment(att._id)}
                              style={{ fontSize: 11, color: 'var(--danger)',
                                       background: 'none', border: 'none',
                                       cursor: 'pointer', padding: 0 }}>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              <form onSubmit={handleUpload}>
                <label style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: '24px 16px',
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', background: 'var(--bg-subtle)',
                  transition: 'var(--transition)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span style={{ fontSize: 13, color: 'var(--gray-400)',
                                 fontWeight: 500 }}>
                    {file ? file.name : 'Drop files here or click to upload'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                    JPG, PNG, PDF, DOC up to 5MB
                  </span>
                  <input type="file" hidden
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={e => setFile(e.target.files[0])} />
                </label>
                {uploadError && (
                  <p style={{ color: 'var(--danger)', fontSize: 13,
                               marginTop: 8 }}>
                    {uploadError}
                  </p>
                )}
                {file && (
                  <button type="submit" disabled={uploading}
                    style={{
                      marginTop: 10, width: '100%', height: 40,
                      background: uploading
                        ? 'var(--gray-200)'
                        : 'linear-gradient(135deg, var(--brand-600), var(--accent-pink))',
                      color: uploading ? 'var(--gray-400)' : 'white',
                      border: 'none', borderRadius: 'var(--radius-md)',
                      fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    }}>
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Status */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600,
                           color: 'var(--gray-400)', textTransform: 'uppercase',
                           letterSpacing: '0.08em' }}>
                Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {statusOptions.map(opt => (
                  <button key={opt.value}
                    onClick={() => canEdit && setStatus(opt.value)}
                    disabled={!canEdit}
                    style={{
                      padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      border: status === opt.value
                        ? `2px solid ${opt.color}`
                        : '2px solid var(--border)',
                      background: status === opt.value ? opt.bg : 'white',
                      color: status === opt.value
                        ? opt.color : 'var(--gray-600)',
                      fontWeight: status === opt.value ? 700 : 500,
                      fontSize: 14, cursor: canEdit ? 'pointer' : 'default',
                      textAlign: 'left', transition: 'var(--transition)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: opt.color,
                    }} />
                    {opt.label}
                    {status === opt.value && (
                      <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600,
                           color: 'var(--gray-400)', textTransform: 'uppercase',
                           letterSpacing: '0.08em' }}>
                Priority
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {priorityOptions.map(opt => (
                  <button key={opt.value}
                    onClick={() => isAdmin && setPriority(opt.value)}
                    disabled={!isAdmin}
                    style={{
                      flex: 1, padding: '8px 4px',
                      borderRadius: 'var(--radius-md)',
                      border: priority === opt.value
                        ? `2px solid ${opt.color}`
                        : '2px solid var(--border)',
                      background: priority === opt.value ? opt.bg : 'white',
                      color: priority === opt.value
                        ? opt.color : 'var(--gray-500)',
                      fontWeight: priority === opt.value ? 700 : 500,
                      fontSize: 12, cursor: isAdmin ? 'pointer' : 'default',
                      transition: 'var(--transition)',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600,
                           color: 'var(--gray-400)', textTransform: 'uppercase',
                           letterSpacing: '0.08em' }}>
                Assigned To
              </h3>
              {task.assignee ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{
                    background: avatarColors[0], width: 36, height: 36,
                    fontSize: 13,
                  }}>
                    {getInitials(task.assignee.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14,
                                  color: 'var(--gray-900)' }}>
                      {task.assignee.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      {task.assignee.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--gray-400)', fontSize: 14 }}>
                  Unassigned
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600,
                           color: 'var(--gray-400)', textTransform: 'uppercase',
                           letterSpacing: '0.08em' }}>
                Dates
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)',
                                marginBottom: 4, fontWeight: 500 }}>
                    DUE DATE
                  </div>
                  {isAdmin ? (
                    <input type="date" value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 10px',
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', fontSize: 13,
                        color: isOverdue ? 'var(--danger)' : 'var(--gray-900)',
                        fontFamily: 'var(--font-body)', outline: 'none',
                        boxSizing: 'border-box',
                      }} />
                  ) : (
                    <div style={{
                      fontSize: 14, fontWeight: 500,
                      color: isOverdue ? 'var(--danger)' : 'var(--gray-900)',
                    }}>
                      {formatDate(task.dueDate)}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)',
                                marginBottom: 4, fontWeight: 500 }}>
                    CREATED
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--gray-900)' }}>
                    {formatDate(task.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            {canEdit && (
              <button onClick={handleSave} disabled={saving}
                style={{
                  width: '100%', height: 46,
                  background: saved
                    ? 'var(--success)'
                    : 'linear-gradient(135deg, var(--brand-600), var(--accent-pink))',
                  color: 'white', border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700, fontSize: 15,
                  cursor: saving ? 'default' : 'pointer',
                  transition: 'var(--transition)',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                }}>
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            )}

            {/* Back button */}
            <button onClick={() => navigate(`/projects/${projectId}`)}
              style={{
                width: '100%', height: 40, background: 'white',
                color: 'var(--gray-600)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)', fontWeight: 500,
                fontSize: 14, cursor: 'pointer',
              }}>
              ← Back to Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
