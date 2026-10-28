import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchBids = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Query auctions where user has participated or all active auctions
        const res = await axios.get('/api/auctions');
        const allAuctions = Array.isArray(res.data) ? res.data : [];
        setBids(allAuctions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [token]);

  if (!token) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>My Bids</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0' }}>Please log in to track your active bids and auto-bids.</p>
        <Link to="/login" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 900, padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
        🏷️ My Bidding Dashboard
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        Track your live bids, leading status, and proxy auto-bid caps.
      </p>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading your bids...</p>
      ) : bids.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>You have not placed bids on any auctions yet.</p>
          <Link to="/" style={{ padding: '0.5rem 1rem', background: '#38bdf8', color: '#0f172a', fontWeight: 600, borderRadius: '4px', textDecoration: 'none' }}>
            Explore Active Auctions
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bids.map((auc) => {
            const isLeader = auc.leaderId === userId || auc.leaderId?._id === userId;
            return (
              <div key={auc._id} style={{
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                padding: '1.25rem',
                border: isLeader ? '1px solid #10b981' : '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase' }}>{auc.category || 'Item'}</span>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: isLeader ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: isLeader ? '#10b981' : '#f87171'
                    }}>
                      {isLeader ? '👑 YOU ARE HIGHEST BIDDER' : 'STATUS: WATCHING / OUTBID'}
                    </span>
                  </div>
                  <h3 style={{ margin: '0.35rem 0', fontSize: '1.15rem', color: '#f8fafc' }}>{auc.title}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Current Price: <strong style={{ color: '#10b981' }}>₹{auc.currentPrice}</strong> • Closes: {new Date(auc.closesAt).toLocaleTimeString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/auction/${auc._id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: isLeader ? '#0f1f38' : '#d97706',
                      color: '#fff',
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      border: isLeader ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}
                  >
                    {isLeader ? 'View Auction' : '⚡ Raise Bid'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBids;
