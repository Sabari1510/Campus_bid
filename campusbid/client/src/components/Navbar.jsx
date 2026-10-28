import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.userId, name: payload.name, email: payload.email });
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
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
                <Link to="/notifications" className="nav-link">
                  🔔
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
