import { useState, useEffect, useRef } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return { icon: '📝', color: '#6366f1', bg: '#eef2ff' };
      case 'task_overdue': return { icon: '⏰', color: '#ef4444', bg: '#fef2f2' };
      case 'task_updated': return { icon: '🔄', color: '#06b6d4', bg: '#ecfeff' };
      default: return { icon: '🔔', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        className="notif-button" 
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const iconData = getIcon(notif.type);
                return (
                  <div 
                    key={notif._id} 
                    className={`notif-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                  >
                    <div 
                      className="notif-icon-circle" 
                      style={{ background: iconData.bg, color: iconData.color }}
                    >
                      {iconData.icon}
                    </div>
                    <div className="notif-item-content">
                      <p className="notif-item-text">{notif.message}</p>
                      <span className="notif-item-time">
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9898b8' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>All caught up! No new notifications.</p>
              </div>
            )}
          </div>
          
          <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #e2e2f0' }}>
             <button style={{ background: 'none', border: 'none', color: '#4b4b6b', fontSize: '13px', fontWeight: 600 }}>View all notifications</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
