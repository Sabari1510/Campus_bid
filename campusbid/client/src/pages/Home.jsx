import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'Electronics', 'Cycles', 'Books', 'Dorm', 'Sports', 'Clothing', 'Other'];
const CONDITIONS  = ['All', 'new', 'like-new', 'used', 'damaged'];

const EMOJI = {
  Electronics: '💻', Cycles: '🚲', Books: '📚', Dorm: '🏠',
  Sports: '⚽', Clothing: '👕', Other: '📦',
};

function Countdown({ closesAt }) {
  const [label, setLabel] = useState('');
  const [cls, setCls] = useState('live');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(closesAt) - Date.now();
      if (diff <= 0) { setLabel('CLOSED'); setCls('closed'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (diff < 1800000) setCls('urgent');
      else setCls('live');
      setLabel(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [closesAt]);

  return <span className={`countdown-chip ${cls === 'urgent' ? 'urgent' : ''}`}>⏱ {label}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');

  const fetchAuctions = useCallback(async () => {
    try {
      const params = { status: 'ACTIVE' };
      if (search) params.q = search;
      if (category !== 'All') params.category = category;
      if (condition !== 'All') params.condition = condition;
      const res = await axios.get('/api/auctions', { params });
      setAuctions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, category, condition]);

  useEffect(() => {
    fetchAuctions();
    const iv = setInterval(fetchAuctions, 8000);
    return () => clearInterval(iv);
  }, [fetchAuctions]);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
      <span>Loading live auctions…</span>
    </div>
  );

  return (
    <div className="page-main fade-up">
      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">
          <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s ease infinite' }}></span>
          Live Auction Platform
        </div>
        <h1>
          Campus Clearance <span className="gradient-text">Auction Hub</span>
        </h1>
        <p>
          Graduating seniors liquidating essentials — cycles, electronics, dorm gear &amp; more.
          Bid live, win big, with anti-snipe &amp; escrow protection.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/create-listing')}>
            + List Your Item
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/wanted')}>
            🎯 Set Wanted Alert
          </button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat-item">
            <div className="hero-stat-value">{auctions.length}</div>
            <div className="hero-stat-label">Live Lots</div>
          </div>
          <div className="hero-stat-item">
            <div className="hero-stat-value">30s</div>
            <div className="hero-stat-label">Anti-Snipe Extension</div>
          </div>
          <div className="hero-stat-item">
            <div className="hero-stat-value">100%</div>
            <div className="hero-stat-label">Escrow Protected</div>
          </div>
          <div className="hero-stat-item">
            <div className="hero-stat-value">₹0</div>
            <div className="hero-stat-label">Platform Fee</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span className="search-icon" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search cycles, calculators, fridges…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="chip-group">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`chip-btn ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {EMOJI[c] || ''} {c}
            </button>
          ))}
        </div>
        <select
          className="form-select"
          style={{ width: 140 }}
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          {CONDITIONS.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'Any Condition' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Section Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Live Lots</h2>
          <p className="section-sub">{auctions.length} active auction{auctions.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchAuctions}>↻ Refresh</button>
      </div>

      {/* Grid */}
      {auctions.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏷️</div>
          <h3>No live auctions found</h3>
          <p>Try a different search or category. Check back soon — seniors list daily!</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/create-listing')}>
            Be the first to list
          </button>
        </div>
      ) : (
        <div className="auction-grid">
          {auctions.map((auc) => {
            const photos = auc.photos || [];
            const emoji = EMOJI[auc.category] || '📦';
            return (
              <div
                key={auc._id}
                className="auction-card"
                onClick={() => navigate(`/auction/${auc._id}`)}
              >
                {/* Image / Placeholder */}
                <div className="auction-card-img">
                  {photos.length > 0 ? (
                    <img
                      src={photos[0].url || photos[0]}
                      alt={auc.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>{emoji}</span>
                  )}
                </div>

                <div className="auction-card-body">
                  <div className="auction-card-meta">
                    <span className="badge badge-active">
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                      LIVE
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {auc.category || 'General'} · {auc.condition || 'used'}
                    </span>
                  </div>
                  <div className="auction-card-title">{auc.title}</div>
                  <div className="auction-card-desc">{auc.description || 'No description provided.'}</div>

                  <div className="auction-card-footer">
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>Current Bid</div>
                      <div className="auction-card-price">₹{auc.currentPrice || auc.startPrice}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Countdown closesAt={auc.closesAt} />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        {auc.bidCount || 0} bid{auc.bidCount !== 1 ? 's' : ''}
                      </div>
                    </div>
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