import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const TaskCard = ({ task, onStatusChange, onAssigneeChange, members }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === 'admin';
  const isAssignee = task.assignee?._id === user?._id || task.assignee === user?._id;

  const handleClick = (e) => {
    // Prevent navigation if clicking on select dropdowns
    if (e.target.tagName === 'SELECT') return;
    
    const pId = task.project?._id || task.project;
    if (pId) {
      navigate(`/projects/${pId}/tasks/${task._id}`);
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="task-row-item" style={{ borderRadius: 'var(--radius-lg)', background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }} onClick={handleClick}>
      <div 
        className="status-dot" 
        style={{ 
          backgroundColor: task.status === 'done' ? 'var(--success)' : 
                          task.status === 'in_progress' ? 'var(--info)' : 'var(--warning)' 
        }}
      ></div>
      
      <div className="task-title-cell" style={{ flex: 1 }}>{task.title}</div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
         {task.project?.name && <span className="project-chip" style={{ maxWidth: '1200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.project.name}</span>}
         <span className={`badge ${
            task.priority === 'high' ? 'badge-danger' : 
            task.priority === 'medium' ? 'badge-warning' : 'badge-success'
          }`}>
            {task.priority}
          </span>
      </div>

      <div style={{ width: '100px', textAlign: 'right' }}>
        <div className={`due-date-cell ${isOverdue ? 'overdue' : ''}`} style={{ fontSize: '12px' }}>
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
        </div>
      </div>

      <div style={{ width: '130px', textAlign: 'right', position: 'relative' }}>
        {(isAdmin || isAssignee) && onStatusChange ? (
          <select 
            className={`badge ${
              task.status === 'done' ? 'badge-success' : 
              task.status === 'in_progress' ? 'badge-info' : 'badge-warning'
            }`}
            style={{ border: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '8px', textAlign: 'center', width: '100%' }}
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">Progress</option>
            <option value="done">Done</option>
          </select>
        ) : (
          <span className={`badge ${
            task.status === 'done' ? 'badge-success' : 
            task.status === 'in_progress' ? 'badge-info' : 'badge-warning'
          }`}>
            {task.status.replace('_', ' ')}
          </span>
        )}
      </div>
      
      <div style={{ position: 'relative', width: '28px' }}>
        <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '10px', backgroundColor: 'var(--brand-500)', color: 'white' }} title={task.assignee?.name || 'Unassigned'}>
          {task.assignee?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        {isAdmin && onAssigneeChange && members && (
          <select 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            value={task.assignee?._id || ''}
            onChange={(e) => onAssigneeChange(task._id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
