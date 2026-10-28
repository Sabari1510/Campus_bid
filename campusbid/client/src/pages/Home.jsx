import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [closingSoon, setClosingSoon] = useState(false);

  const fetchAuctions = () => {
    setLoading(true);
    const params = {};
    if (q) params.q = q;
    if (category) params.category = category;
    if (condition) params.condition = condition;
    if (minPrice) params.min = minPrice;
    if (maxPrice) params.max = maxPrice;
    if (closingSoon) params.closingSoon = 'true';

    axios.get('/api/auctions', { params })
      .then((res) => {
        setAuctions(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Error fetching auctions:', err);
        setAuctions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAuctions();
  }, [category, condition, closingSoon]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  const formatCountdown = (closesAt) => {
    if (!closesAt) return 'N/A';
    const now = new Date();
    const diff = new Date(closesAt) - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="container" style={{ maxWidth: 1200, padding: '2rem 1.5rem' }}>
      {/* Hero / Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1f38 0%, #1e293b 100%)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: 650 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.2rem 0.6rem',
            background: 'rgba(217, 119, 6, 0.2)',
            color: '#f59e0b',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            letterSpacing: '0.05em'
          }}>
            ⚡ GRADUATION WEEK SURPLUS EXCHANGES
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#ffffff', lineHeight: 1.2, margin: '0 0 0.5rem 0' }}>
            Campus Relay Live Auctions
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Direct senior-to-junior handovers. Public timed auctions with anti-sniping protection and proxy auto-bidding.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/create-listing"
            style={{
              padding: '0.75rem 1.25rem',
              background: '#d97706',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.95rem'
            }}
          >
            + Post Your Surplus Item
          </Link>
          <Link
            to="/wanted"
            style={{
              padding: '0.75rem 1.25rem',
              background: 'rgba(255,255,255,0.1)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.2)',
              fontWeight: 600,
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.95rem'
            }}
          >
            🎯 Wanted Alerts
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '1.25rem',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: '2 1 250px' }}>
            <input
              type="text"
              placeholder="Search cycles, books, mini-fridge, lab gear..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: '1 1 140px' }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Cycles">Cycles</option>
              <option value="Books">Books / Notes</option>
              <option value="Dorm">Dorm Essentials</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ flex: '1 1 120px' }}>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ width: '100%' }}>
              <option value="">Condition</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 160px' }}>
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ width: '50%' }}
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: '50%' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={closingSoon}
              onChange={(e) => setClosingSoon(e.target.checked)}
            />
            ⏱️ Closing Soon (24h)
          </label>

          <button
            type="submit"
            style={{
              padding: '0.55rem 1.25rem',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              borderRadius: '6px'
            }}
          >
            Filter
          </button>
        </form>
      </div>

      {/* Grid of Listings */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>
          Active Auctions ({auctions.length})
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Loading campus auctions...
        </div>
      ) : auctions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-secondary)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>No active auctions found</p>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Try resetting your filters or post the first listing on campus.
          </p>
          <Link
            to="/create-listing"
            style={{
              padding: '0.6rem 1.25rem',
              background: '#d97706',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            Post Item
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.5rem'
        }}>
          {auctions.map((auc) => (
            <div
              key={auc._id}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              {/* Card Header / Countdown */}
              <div style={{
                background: '#081224',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <span style={{ color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
                  {auc.category || 'General'}
                </span>
                <span style={{ color: '#f59e0b', fontWeight: 700, letterSpacing: '0.02em' }}>
                  ⏱️ {formatCountdown(auc.closesAt)}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
                  {auc.title}
                </h3>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  marginBottom: '1rem',
                  flex: 1
                }}>
                  {auc.description ? (auc.description.length > 90 ? auc.description.slice(0, 90) + '...' : auc.description) : 'No description'}
                </p>

                {/* Price info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Current Bid</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>
                      ₹{auc.currentPrice || auc.startPrice || 0}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Min Step: ₹{auc.minIncrement || 10}</span>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {auc.bidCount ? `${auc.bidCount} bids placed` : '0 bids yet'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/auction/${auc._id}`)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                >
                  View & Place Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;