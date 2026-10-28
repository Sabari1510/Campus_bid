import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function MyBids() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.get('/api/auctions', { params: { status: 'ACTIVE' } })
      .then(res => setAuctions(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return (
    <div className="page-main">
      <div className="empty-state">
        <div className="icon">🔐</div>
        <h3>Log in to track your bids</h3>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Sign In</Link>
      </div>
    </div>
  );

  if (loading) return <div className="page-loader"><div className="spinner" /><span>Loading your bids…</span></div>;

  return (
    <div className="page-main fade-up" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', marginBottom: '0.3rem' }}>
          🏷️ My Bidding Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track live bids, leading status, and proxy auto-bid caps.
        </p>
      </div>

      {auctions.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <h3>No active auctions to bid on</h3>
          <p>Check out the live auctions and place your first bid!</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Explore Live Auctions
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {auctions.map((auc) => {
            const isLeader = auc.leaderId === userId || auc.leaderId?._id === userId;
            const diff = new Date(auc.closesAt) - Date.now();
            const isUrgent = diff > 0 && diff < 1800000;

            return (
              <div
                key={auc._id}
                className="card"
                style={{
                  borderColor: isLeader ? 'rgba(16,185,129,0.5)' : isUrgent ? 'rgba(245,158,11,0.35)' : 'var(--border)',
                  background: isLeader ? 'linear-gradient(145deg, rgba(16,185,129,0.06), #0a1628)' : '',
                }}
              >
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {auc.category || 'Item'}
                      </span>
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: isLeader ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)',
                          color: isLeader ? '#34d399' : '#f87171',
                          border: `1px solid ${isLeader ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
                        }}
                      >
                        {isLeader ? '👑 LEADING' : '⚡ OUTBID'}
                      </span>
                      {isUrgent && <span className="badge badge-pending">⏱ CLOSING SOON</span>}
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                      {auc.title}
                    </h3>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem' }}>
                      <span>Current: <strong style={{ color: 'var(--accent-green)' }}>₹{auc.currentPrice || auc.startPrice}</strong></span>
                      <span>Closes: {new Date(auc.closesAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isLeader && (
                      <Link to={`/auction/${auc._id}`} className="btn btn-gold btn-sm">
                        ⚡ Raise Bid
                      </Link>
                    )}
                    <Link to={`/auction/${auc._id}`} className="btn btn-ghost btn-sm">
                      View Lot
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
