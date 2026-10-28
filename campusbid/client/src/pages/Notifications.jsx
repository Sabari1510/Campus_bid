import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchNotifs = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await axios.post('/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Notifications & Alerts</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0' }}>Please log in to see your alerts and bidding updates.</p>
        <Link to="/login" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 850, padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#f8fafc', margin: 0 }}>
            🔔 Live Alerts & Notifications
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Outbid events, anti-snipe countdown extensions, and Wanted matches.
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            style={{
              padding: '0.4rem 0.8rem',
              background: 'transparent',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              borderRadius: '4px',
              fontSize: '0.85rem'
            }}
          >
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading alerts...</p>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <p style={{ color: '#94a3b8' }}>All caught up! No unread notifications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((notif) => (
            <div
              key={notif._id}
              style={{
                background: notif.read ? 'rgba(30, 41, 59, 0.4)' : 'var(--bg-secondary)',
                border: notif.read ? '1px solid var(--border-color)' : '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>
                    {notif.type === 'OUTBID' ? '⚠️' : notif.type === 'EXTENSION' ? '⏱️' : notif.type === 'WANTED_MATCH' ? '🎯' : '📢'}
                  </span>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>
                    {notif.type || 'Notice'}
                  </strong>
                  {!notif.read && (
                    <span style={{ padding: '0.1rem 0.4rem', borderRadius: '999px', fontSize: '0.65rem', background: '#38bdf8', color: '#0f172a', fontWeight: 700 }}>
                      NEW
                    </span>
                  )}
                </div>
                <p style={{ margin: '0.35rem 0', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  {typeof notif.payload === 'string' 
                    ? notif.payload 
                    : notif.payload?.message || JSON.stringify(notif.payload || {})}
                </p>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {new Date(notif.createdAt || Date.now()).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;