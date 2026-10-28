import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    if (token) {
      setUser({ name: name || 'Student', id: userId });
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: '#0f1f38',
      color: '#ffffff',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Top Banner */}
      <div style={{
        background: '#081224',
        padding: '0.35rem 1.5rem',
        fontSize: '0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#94a3b8'
      }}>
        <div>🎓 <strong>CampusBid</strong> • Senior Departure Auctions • Anti-Snipe 30s Extension Active</div>
        <div style={{ color: '#f59e0b', fontWeight: 600 }}>CAMPUS VERIFIED • HANDOVER AT DORM</div>
      </div>

      {/* Main Navbar */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏛️</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#38bdf8' }}>CampusBid</span>
          </Link>

          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              background: isActive('/') ? '#1e293b' : 'transparent',
              color: isActive('/') ? '#38bdf8' : '#cbd5e1'
            }}>
              Live Auctions
            </Link>

            <Link to="/wanted" style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              background: isActive('/wanted') ? '#1e293b' : 'transparent',
              color: isActive('/wanted') ? '#38bdf8' : '#cbd5e1'
            }}>
              Wanted Alerts
            </Link>

            <Link to="/assistant" style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              background: isActive('/assistant') ? '#1e293b' : 'transparent',
              color: isActive('/assistant') ? '#38bdf8' : '#cbd5e1'
            }}>
              🤖 AI Assistant
            </Link>

            {user && (
              <>
                <Link to="/my-listings" style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: isActive('/my-listings') ? '#1e293b' : 'transparent',
                  color: isActive('/my-listings') ? '#38bdf8' : '#cbd5e1'
                }}>
                  My Listings
                </Link>

                <Link to="/my-bids" style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: isActive('/my-bids') ? '#1e293b' : 'transparent',
                  color: isActive('/my-bids') ? '#38bdf8' : '#cbd5e1'
                }}>
                  My Bids
                </Link>

                <Link to="/notifications" style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: isActive('/notifications') ? '#1e293b' : 'transparent',
                  color: isActive('/notifications') ? '#38bdf8' : '#cbd5e1'
                }}>
                  🔔 Alerts
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/create-listing" style={{
            padding: '0.45rem 0.9rem',
            background: '#d97706',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            + Post Item
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                👤 {user.name}
              </span>
              <button onClick={handleLogout} style={{
                padding: '0.35rem 0.7rem',
                background: 'rgba(255,255,255,0.1)',
                color: '#f8fafc',
                borderRadius: '4px',
                fontSize: '0.8rem',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" style={{
                padding: '0.4rem 0.8rem',
                background: 'transparent',
                color: '#f8fafc',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)',
                textDecoration: 'none',
                fontSize: '0.85rem'
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                padding: '0.4rem 0.8rem',
                background: '#2563eb',
                color: '#fff',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
