import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function StatusBadge({ status }) {
  const cls = status === 'ACTIVE' ? 'active' : status === 'CLOSED' ? 'closed' : 'pending';
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

const CATEGORIES = ['Electronics', 'Cycles', 'Books', 'Dorm', 'Sports', 'Clothing', 'Other'];
const CONDITIONS = ['new', 'like-new', 'used', 'damaged'];

function EditForm({ auction, onSaved, onCancel }) {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    title: auction.title,
    description: auction.description || '',
    category: auction.category || 'Other',
    condition: auction.condition || 'used',
    closesAt: new Date(auction.closesAt).toISOString().slice(0, 16),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const bidLocked = (auction.bidCount || 0) > 0;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        description: form.description,
        category: form.category,
        condition: form.condition,
        closesAt: new Date(form.closesAt).toISOString(),
      };
      if (!bidLocked) payload.title = form.title;
      await axios.patch(`/api/auctions/${auction._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ borderColor: 'var(--accent-gold)' }}>
      <div className="card-body">
        <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>✏️ Edit Listing</div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={form.title} onChange={set('title')} disabled={bidLocked}
              placeholder={bidLocked ? 'Locked after first bid' : ''} required />
            {bidLocked && <small style={{ color: 'var(--text-muted)' }}>Title cannot be changed after the first bid.</small>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={set('description')} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
              <label className="form-label">Condition</label>
              <select className="form-input" value={form.condition} onChange={set('condition')}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
              <label className="form-label">Closes At</label>
              <input className="form-input" type="datetime-local" value={form.closesAt} onChange={set('closesAt')} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchListings = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await axios.get('/api/auctions/mine', { headers: { Authorization: `Bearer ${token}` } });
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/auctions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchListings();
    } catch {
      alert('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  if (!token) return (
    <div className="page-main">
      <div className="empty-state">
        <div className="icon">🔐</div>
        <h3>Please log in to see your listings</h3>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Sign In</Link>
      </div>
    </div>
  );

  if (loading) return <div className="page-loader"><div className="spinner" /><span>Loading your listings…</span></div>;

  return (
    <div className="page-main fade-up">
      <div className="section-header">
        <div>
          <h1 className="section-title">My Listings</h1>
          <p className="section-sub">Items you've listed for auction.</p>
        </div>
        <Link to="/create-listing" className="btn btn-gold">+ New Listing</Link>
      </div>

      {listings.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏷️</div>
          <h3>No listings yet</h3>
          <p>Put your first item up for auction and let the campus bid!</p>
          <Link to="/create-listing" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create a Listing</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {listings.map((a) =>
            editingId === a._id ? (
              <EditForm key={a._id} auction={a} onSaved={() => { setEditingId(null); fetchListings(); }} onCancel={() => setEditingId(null)} />
            ) : (
              <div key={a._id} className="card" style={{ cursor: 'default' }}>
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <StatusBadge status={a.status} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {a.category} · Lot #{a._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{a.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem' }}>
                      <span>Start: ₹{a.startPrice}</span>
                      <span>Current: <strong style={{ color: 'var(--accent-green)' }}>₹{a.currentPrice || a.startPrice}</strong></span>
                      <span>Closes: {new Date(a.closesAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/auction/${a._id}`)}>View</button>
                    {a.status === 'ACTIVE' && (
                      <button className="btn btn-primary btn-sm" onClick={() => setEditingId(a._id)}>Edit</button>
                    )}
                    <button className="btn btn-red btn-sm" onClick={() => handleDelete(a._id)} disabled={deleting === a._id}>
                      {deleting === a._id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}