import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/notifications', {
      params: { userId: localStorage.getItem('userId') }
    }).then((res) => {
      setNotifications(res.data);
      setLoading(false);
    });
  }, []);
  if (loading) return <div>Loading notifications...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Notifications</h2>
      <p>Total: {notifications.length}</p>
      {notifications.length === 0 ? <p>No notifications.</p> : null}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {notifications.map((notif) => (
          <li key={notif._id} style={{ borderBottom: '1px solid #eee', padding: '1rem', marginBottom: '1rem' }}>
            <p>{notif.type}: {notif.payload ? JSON.stringify(notif.payload) : 'No details'}</p>
            <button style={{ float: 'right', padding: '0.3rem 0.5rem', background: '#e9ecef', color: '#666', border: '1px solid #dee2e6', borderRadius: '4px' }}>Mark Read</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;