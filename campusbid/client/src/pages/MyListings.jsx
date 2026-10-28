import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const fetchListings = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('/api/auctions', {
        params: { sellerId: userId }
      });
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [userId, token]);

  const handleDecision = async (auctionId, approve) => {
    try {
      await axios.post(`/api/auctions/${auctionId}/decision`, { approve }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Winning bid ${approve ? 'approved (item RESERVED for buyer)' : 'rejected'}.`);
      fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleHandover = async (auctionId, outcome) => {
    try {
      await axios.post(`/api/auctions/${auctionId}/handover`, { outcome }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Handover recorded as: ${outcome}.`);
      fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Handover update failed');
    }
  };

  if (!token) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Seller Dashboard</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0' }}>Please log in to manage your listings and seller approvals.</p>
        <Link to="/login" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 950, padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#f8fafc', margin: 0 }}>
            📦 My Listings & Seller Dashboard
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage active auctions, approve winning bids, and track handover outcomes.
          </p>
        </div>
        <Link
          to="/create-listing"
          style={{
            padding: '0.5rem 1rem',
            background: '#d97706',
            color: '#fff',
            fontWeight: 600,
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}
        >
          + Post New Item
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading your items...</p>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <p style={{ color: '#94a3b8', marginBottom: '1.25rem' }}>You have not listed any items for auction yet.</p>
          <Link
            to="/create-listing"
            style={{
              padding: '0.6rem 1.25rem',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            Post Your First Surplus Item
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {listings.map((auc) => (
            <div
              key={auc._id}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase' }}>
                      {auc.category || 'General'}
                    </span>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: auc.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                      color: auc.status === 'ACTIVE' ? '#10b981' : '#f59e0b'
                    }}>
                      {auc.status}
                    </span>
                  </div>
                  <h3 style={{ margin: '0.35rem 0', fontSize: '1.2rem', color: '#f8fafc' }}>
                    {auc.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Current Price: <strong style={{ color: '#10b981' }}>₹{auc.currentPrice}</strong> • Closes: {new Date(auc.closesAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link
                    to={`/auction/${auc._id}`}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    View
                  </Link>
                  {auc.status === 'ACTIVE' && (
                    <Link
                      to={`/edit-listing/${auc._id}`}
                      style={{
                        padding: '0.4rem 0.8rem',
                        background: '#334155',
                        color: '#f8fafc',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        textDecoration: 'none'
                      }}
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>

              {/* Lifecycle Actions */}
              {auc.status === 'PENDING_APPROVAL' && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #d97706',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <strong style={{ color: '#f59e0b', fontSize: '0.9rem' }}>Auction Ended with Bids!</strong>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Review highest bidder price and approve for pickup reservation.</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDecision(auc._id, true)}
                      style={{ padding: '0.4rem 0.8rem', background: '#10b981', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      ✓ Approve Winner
                    </button>
                    <button
                      onClick={() => handleDecision(auc._id, false)}
                      style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              )}

              {auc.status === 'RESERVED' && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <strong style={{ color: '#10b981', fontSize: '0.9rem' }}>Item Reserved for Winner Handover</strong>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Meet the junior at your hostel/dorm and record the outcome:</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleHandover(auc._id, 'COMPLETED')}
                      style={{ padding: '0.4rem 0.8rem', background: '#10b981', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      ✓ Handover Completed
                    </button>
                    <button
                      onClick={() => handleHandover(auc._id, 'PICKUP_FAILED')}
                      style={{ padding: '0.4rem 0.8rem', background: '#64748b', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      ✕ Buyer No-Show
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;