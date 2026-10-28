import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function StatusBadge({ status }) {
  const cls = status === 'ACTIVE' ? 'active' : status === 'CLOSED' ? 'closed' : 'pending';
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);

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
          {listings.map((a) => (
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
                  <button className="btn btn-red btn-sm" onClick={() => handleDelete(a._id)} disabled={deleting === a._id}>
                    {deleting === a._id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}