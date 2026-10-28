import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const TYPE_META = {
  wanted_match: { icon: '🎯', title: 'Wanted Alert Match', color: 'var(--accent-gold)' },
  outbid: { icon: '⚔️', title: 'You have been outbid!', color: 'var(--accent-red, #f87171)' },
  auction_closed: { icon: '🔒', title: 'Auction Closed', color: 'var(--accent-green)' },
  system: { icon: '⚙️', title: 'System', color: 'var(--text-secondary)' },
};

function getTitle(n) {
  const meta = TYPE_META[n.type];
  return meta ? `${meta.icon} ${meta.title}` : '🔔 Notification';
}

function getMessage(n) {
  return n.payload?.message || n.message || n.text || '';
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchNotifs = () => {
    if (!token) { setLoading(false); return; }
    axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setNotifs(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifs(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifs(n => n.map(x => ({ ...x, read: true })));
    } catch { /* ignore */ }
  };

  const handleOpen = (n) => {
    if (!n.read) markRead(n._id);
    if (n.payload?.auctionId) navigate(`/auction/${n.payload.auctionId}`);
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

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="page-main fade-up" style={{ maxWidth: 700 }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">🔔 Notifications</h1>
          <p className="section-sub">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
        )}
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
              onClick={() => handleOpen(n)}
              style={{
                cursor: n.payload?.auctionId ? 'pointer' : 'default',
                borderColor: n.read ? 'var(--border)' : 'rgba(56,189,248,0.35)',
                background: n.read ? '' : 'rgba(56,189,248,0.04)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div className="card-body" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.read ? 500 : 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {getTitle(n)}
                  </div>
                  {getMessage(n) && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      {getMessage(n)}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-gold, #ffd700)' }} />}
                  {n.payload?.auctionId && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue, #38bdf8)' }}>
                      View auction →
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}