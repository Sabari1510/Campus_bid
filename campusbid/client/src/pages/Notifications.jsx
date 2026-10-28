import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setNotifs(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifs(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    } catch { /* ignore */ }
  };

  if (!token) return (
    <div className="page-main">
      <div className="empty-state">
        <div className="icon">🔐</div>
        <h3>Log in to see notifications</h3>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Sign In</Link>
      </div>
    </div>
  );

  if (loading) return <div className="page-loader"><div className="spinner" /><span>Loading notifications…</span></div>;

  return (
    <div className="page-main fade-up" style={{ maxWidth: 700 }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">🔔 Notifications</h1>
          <p className="section-sub">{notifs.filter(n => !n.read).length} unread</p>
        </div>
      </div>

      {notifs.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔕</div>
          <h3>No notifications yet</h3>
          <p>Set wanted alerts and bid on auctions to start receiving updates.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifs.map((n) => (
            <div
              key={n._id}
              className="card"
              style={{
                borderColor: n.read ? 'var(--border)' : 'rgba(56,189,248,0.35)',
                background: n.read ? '' : 'rgba(56,189,248,0.04)',
              }}
            >
              <div className="card-body" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.read ? 400 : 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {n.message || n.text || 'Notification'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </div>
                </div>
                {!n.read && (
                  <button className="btn btn-ghost btn-sm" onClick={() => markRead(n._id)}>Mark read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}