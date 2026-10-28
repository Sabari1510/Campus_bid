import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'Electronics', 'Cycles', 'Books', 'Dorm', 'Sports', 'Clothing', 'Other'];

export default function Wanted() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const token = localStorage.getItem('token');

  const fetchAlerts = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await axios.get('/api/wanted', { headers: { Authorization: `Bearer ${token}` } });
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await axios.post('/api/wanted', {
        keywords,
        category: category === 'All' ? undefined : category,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setKeywords(''); setMaxPrice('');
      showMsg('success', '✅ Alert created! You\'ll be notified when a match appears.');
      fetchAlerts();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to create alert');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/wanted/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAlerts();
    } catch { showMsg('error', 'Failed to delete alert'); }
  };

  return (
    <div className="page-main fade-up" style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', marginBottom: '0.4rem' }}>
          🎯 Wanted Item Alerts
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Looking for something specific? Set keyword alerts and get notified the moment a match goes live.
        </p>
      </div>

      {/* How it works */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        💡 <strong>How it works:</strong> When a seller posts an auction matching your keywords, category, or price cap — you get an instant in-app notification.
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      {/* Create Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
            + Create New Alert
          </h2>
          {!token ? (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <Link to="/login" className="btn btn-primary">Sign in to create alerts</Link>
            </div>
          ) : (
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Keywords (comma-separated)</label>
                  <input
                    id="wanted-keywords"
                    className="form-input"
                    placeholder="e.g. cycle, calculator, fridge"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select id="wanted-category" className="form-input form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Max Budget (₹)</label>
                  <input
                    id="wanted-maxprice"
                    className="form-input"
                    type="number"
                    placeholder="e.g. 2500"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
              <button id="wanted-submit" type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : '🔔 Set Alert'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Your Active Alerts</h2>
          <p className="section-sub">{alerts.length} alert{alerts.length !== 1 ? 's' : ''} watching</p>
        </div>
      </div>

      {!token ? (
        <div className="empty-state">
          <div className="icon">🔐</div>
          <h3>Sign in to see your alerts</h3>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Sign In</Link>
        </div>
      ) : loading ? (
        <div className="page-loader"><div className="spinner" /><span>Loading…</span></div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔕</div>
          <h3>No active alerts</h3>
          <p>Create one above to be notified when matching items appear.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.map((item) => (
            <div key={item._id} className="card">
              <div className="card-body" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🔍</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {Array.isArray(item.keywords) ? item.keywords.join(', ') : item.keywords}
                    </strong>
                    {item.category && item.category !== 'All' && (
                      <span className="badge badge-new">{item.category}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                    <span>Budget: {item.maxPrice ? `up to ₹${item.maxPrice}` : 'No limit'}</span>
                    <span>Created: {new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="btn btn-red btn-sm" onClick={() => handleDelete(item._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
