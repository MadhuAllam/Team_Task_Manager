import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ── Fetch dashboard data ──────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/dashboard');
      setStats(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── On mount: fetch immediately ───────────────────
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Auto-refresh every 10 seconds ─────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // ── Listen for custom event from other pages ──────
  useEffect(() => {
    const handleTaskUpdate = () => {
      fetchDashboard();
    };

    window.addEventListener('taskflow:refresh', handleTaskUpdate);
    return () => window.removeEventListener('taskflow:refresh', handleTaskUpdate);
  }, [fetchDashboard]);

  // ── Greeting based on time ────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] || 'there';

  // ── Date string ───────────────────────────────────
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  // ── Loading state ─────────────────────────────────
  if (loading) return (
    <div className="page-wrapper page-enter">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 20, width: 200, marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="page-wrapper">
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--danger)' }}>
        {error} — <button onClick={fetchDashboard}>Retry</button>
      </div>
    </div>
  );

  const statCards = [
    {
      label : 'Total Tasks',
      value : stats?.total      || 0,
      icon  : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
      color : 'var(--brand-500)',
      bar   : 'linear-gradient(90deg, var(--brand-500), var(--brand-400))',
      bg    : 'var(--brand-50)',
    },
    {
      label : 'To Do',
      value : stats?.todo       || 0,
      icon  : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      color : 'var(--warning)',
      bar   : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
      bg    : '#fffbeb',
    },
    {
      label : 'In Progress',
      value : stats?.inProgress || 0,
      icon  : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="13 2 13 9 20 9"/>
          <path d="M21 3L13 11M11 21H3a2 2 0 01-2-2v-7"/>
          <polyline points="7.5 21 3 21 3 16.5"/>
        </svg>
      ),
      color : 'var(--info)',
      bar   : 'linear-gradient(90deg, #06b6d4, #22d3ee)',
      bg    : '#ecfeff',
    },
    {
      label : 'Completed',
      value : stats?.done       || 0,
      icon  : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      color : 'var(--success)',
      bar   : 'linear-gradient(90deg, #10b981, #34d399)',
      bg    : '#ecfdf5',
    },
  ];

  return (
    <div className="page-wrapper page-enter">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', 
                      alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0,
                         fontFamily: 'var(--font-display)' }}>
              {greeting}, {firstName}
            </h1>
            <p style={{ color: 'var(--gray-400)', marginTop: 4, fontSize: 15 }}>
              Here's what's happening with your workspace today.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, color: 'var(--gray-400)', fontWeight: 500 }}>
              {dateStr}
            </div>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', 
                          gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--success)',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>
                Live · updates every 10s
              </span>
            </div>
          </div>
        </div>

        {/* ── Overdue Banner ── */}
        {stats?.overdue > 0 && (
          <div style={{
            background : 'linear-gradient(135deg, #fef2f2, #fff5f5)',
            border     : '1px solid #fecaca',
            borderLeft : '4px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            padding    : '14px 20px',
            display    : 'flex',
            alignItems : 'center',
            gap        : 12,
            marginBottom: 24,
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <strong style={{ color: 'var(--danger)' }}>
                {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}
              </strong>
              <span style={{ color: '#991b1b', fontSize: 14, marginLeft: 8 }}>
                Please update them before they delay the project.
              </span>
            </div>
            <button
              onClick={() => navigate('/projects')}
              style={{
                marginLeft : 'auto',
                background : 'var(--danger)',
                color      : 'white',
                border     : 'none',
                borderRadius: 'var(--radius-sm)',
                padding    : '6px 14px',
                fontSize   : 13,
                fontWeight : 600,
                cursor     : 'pointer',
              }}
            >
              View Tasks →
            </button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20, marginBottom: 32
        }}>
          {statCards.map((card) => (
            <div key={card.label} className="card" style={{
              padding: '24px 24px 0',
              overflow: 'hidden',
              cursor: 'default',
              transition: 'var(--transition)',
              position: 'relative',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: card.bg,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: card.color,
                marginBottom: 16,
              }}>
                {card.icon}
              </div>

              <div style={{
                fontSize: 40, fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'var(--gray-900)', lineHeight: 1,
                marginBottom: 8,
                transition: 'all 0.3s ease',
              }}>
                {card.value}
              </div>

              <div style={{
                fontSize: 12, fontWeight: 600,
                color: 'var(--gray-400)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                {card.label}
              </div>

              {/* Bottom gradient bar */}
              <div style={{
                height: 4,
                background: card.bar,
                margin: '0 -24px',
                borderRadius: '0 0 4px 4px',
              }} />
            </div>
          ))}
        </div>

        {/* ── Recent Tasks ── */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700,
                         fontFamily: 'var(--font-display)' }}>
              Recent Tasks
            </h2>
            <button
              onClick={() => navigate('/projects')}
              style={{ background: 'none', border: 'none',
                       color: 'var(--brand-500)', fontSize: 14,
                       fontWeight: 500, cursor: 'pointer' }}
            >
              View all projects →
            </button>
          </div>

          {!stats?.recent?.length ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: 16,
                background: 'var(--gray-100)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--gray-600)' }}>
                No tasks assigned yet
              </h3>
              <p style={{ color: 'var(--gray-400)', fontSize: 14, margin: '0 0 20px' }}>
                Ask your administrator to assign tasks to get started.
              </p>
              <button
                onClick={() => navigate('/projects')}
                style={{
                  background: 'linear-gradient(135deg, var(--brand-600), var(--accent-pink))',
                  color: 'white', border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 24px', fontWeight: 600,
                  cursor: 'pointer', fontSize: 14,
                }}
              >
                Explore Projects
              </button>
            </div>
          ) : (
            <div>
              {stats.recent.map((task, i) => {
                const isOverdue = task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== 'done';

                const statusColors = {
                  todo       : { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
                  in_progress: { bg: '#cffafe', text: '#164e63', dot: '#06b6d4' },
                  done       : { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
                };
                const sc = statusColors[task.status] || statusColors.todo;

                return (
                  <div key={task._id}
                    onClick={() => navigate(
                      `/projects/${task.project?._id}/tasks/${task._id}`
                    )}
                    style={{
                      display       : 'flex',
                      alignItems    : 'center',
                      gap           : 16,
                      padding       : '14px 16px',
                      borderRadius  : 'var(--radius-md)',
                      cursor        : 'pointer',
                      transition    : 'var(--transition)',
                      borderBottom  : i < stats.recent.length - 1
                                        ? '1px solid var(--border)' : 'none',
                    }}
                    onMouseEnter={e =>
                      e.currentTarget.style.background = 'var(--brand-50)'}
                    onMouseLeave={e =>
                      e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Status dot */}
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: sc.dot, flexShrink: 0,
                    }} />

                    {/* Title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600, fontSize: 14,
                        color: 'var(--gray-900)',
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                        {task.project?.name || 'Unknown Project'}
                      </div>
                    </div>

                    {/* Due date */}
                    {task.dueDate && (
                      <div style={{
                        fontSize  : 12,
                        color     : isOverdue ? 'var(--danger)' : 'var(--gray-400)',
                        fontWeight: isOverdue ? 600 : 400,
                        flexShrink: 0,
                      }}>
                        {isOverdue ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 4, verticalAlign: 'middle' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        ) : null}
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric'
                        })}
                      </div>
                    )}

                    {/* Status badge */}
                    <div style={{
                      background   : sc.bg,
                      color        : sc.text,
                      fontSize     : 11,
                      fontWeight   : 600,
                      padding      : '3px 10px',
                      borderRadius : 'var(--radius-full)',
                      textTransform: 'capitalize',
                      flexShrink   : 0,
                    }}>
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Last updated timestamp */}
        {lastUpdated && (
          <div style={{
            textAlign: 'center', marginTop: 16,
            fontSize: 12, color: 'var(--gray-400)'
          }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
