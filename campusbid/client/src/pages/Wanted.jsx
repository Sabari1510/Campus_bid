import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Wanted = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  const fetchAlerts = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('/api/wanted', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to create wanted alerts');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      await axios.post('/api/wanted', {
        keywords,
        category: category === 'All' ? undefined : category,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setKeywords('');
      setMaxPrice('');
      setMessage('Wanted alert created! You will be notified when matching listings appear.');
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/wanted/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (err) {
      alert('Failed to delete alert');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 850, padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
          🎯 Wanted Item Alerts
        </h1>
        <p style={{ color: '#94a3b8' }}>
          Looking for surplus items from graduating seniors? Set keyword alerts and get notified as soon as someone posts a match.
        </p>
      </div>

      {/* Info Card */}
      <div style={{
        background: 'rgba(37, 99, 235, 0.1)',
        border: '1px solid rgba(37, 99, 235, 0.3)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '2rem',
        fontSize: '0.9rem',
        color: '#bfdbfe'
      }}>
        💡 <strong>How it works:</strong> Whenever a senior publishes an auction matching your keywords or price cap, you'll receive an in-app alert and browser notification.
      </div>

      {/* Form */}
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '1.5rem',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#f8fafc' }}>+ Create New Alert</h2>
        {message && <div style={{ color: 'var(--accent-success)', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>}

        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Keywords (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. cycle, calculator, fridge"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Cycles">Cycles</option>
              <option value="Books">Books</option>
              <option value="Dorm">Dorm Essentials</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Max Budget (₹)</label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              height: '38px'
            }}
          >
            {submitting ? 'Saving...' : 'Set Alert'}
          </button>
        </form>
      </div>

      {/* Active Alerts List */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#f8fafc' }}>Your Active Alerts</h2>
      {!token ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          Please <a href="/login" style={{ color: '#38bdf8' }}>log in</a> to view and manage your wanted alerts.
        </div>
      ) : loading ? (
        <p style={{ color: '#94a3b8' }}>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '8px', color: '#94a3b8' }}>
          You have no active wanted alerts. Add one above to get notified!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.map((item) => (
            <div key={item._id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>
                  🔍 {Array.isArray(item.keywords) ? item.keywords.join(', ') : item.keywords}
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Category: {item.category || 'Any'} {item.maxPrice ? `• Max: ₹${item.maxPrice}` : '• No price limit'}
                </div>
              </div>
              <button
                onClick={() => handleDelete(item._id)}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wanted;
