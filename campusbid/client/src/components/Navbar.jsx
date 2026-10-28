import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const TICKER_ITEMS = [
  { label: 'Anti-Snipe 30s Extension Active', dot: 'gold' },
  { label: '4-Day Senior Departure Countdown', dot: '' },
  { label: 'Escrow Verified by Student Senate', dot: 'red' },
  { label: 'Live Auctions Running Now', dot: '' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);

  const fetchUnread = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setUnread(0); return; }
    try {
      const res = await axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      setUnread((res.data || []).filter(n => !n.read).length);
    } catch { setUnread(0); }
  };

  const syncUser = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        let b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const payload = JSON.parse(atob(b64));
        setUser({ id: payload.userId, name: payload.name || 'User', email: payload.email });
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();
    fetchUnread();
    const onAuthChange = () => { syncUser(); fetchUnread(); };
    window.addEventListener('auth-change', onAuthChange);
    window.addEventListener('storage', onAuthChange);
    return () => {
      window.removeEventListener('auth-change', onAuthChange);
      window.removeEventListener('storage', onAuthChange);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Duplicate items for seamless loop
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement-bar">
        ⚡ CAMPUS AUCTION PLATFORM · Senate-Verified Escrow · Anti-Snipe Protection Active
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">🎓</div>
            Campus<span className="accent">Bid</span>
          </Link>

          {/* Ticker */}
          <div className="navbar-ticker">
            <div className="navbar-ticker-inner">
              {tickerItems.map((item, i) => (
                <span key={i} className="ticker-item">
                  <span className={`dot ${item.dot}`}></span>
                  {item.label}
                  &nbsp;•
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              🏠 Live
            </Link>
            <Link to="/wanted" className={`nav-link ${isActive('/wanted') ? 'active' : ''}`}>
              🎯 Wanted
            </Link>

            {user ? (
              <>
                <Link to="/create-listing" className="btn btn-gold btn-sm">
                  + List Item
                </Link>
                <Link to="/my-listings" className={`nav-link ${isActive('/my-listings') ? 'active' : ''}`}>
                  My Listings
                </Link>
                <Link to="/notifications" className="nav-link" style={{ position: 'relative' }}>
                  🔔
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      background: 'var(--accent-gold, #ffd700)', color: '#0f1f38',
                      borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700,
                      minWidth: '16px', height: '16px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                    }}>{unread}</span>
                  )}
                </Link>
                <div className="navbar-user" onClick={handleLogout} title="Click to logout">
                  <div className="user-avatar">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
