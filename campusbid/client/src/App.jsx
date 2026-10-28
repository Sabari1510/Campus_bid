import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateListing from './pages/CreateListing';
import AuctionDetail from './pages/AuctionDetail';
import MyListings from './pages/MyListings';
import Notifications from './pages/Notifications';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        });
      } catch (e) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <nav style={{ padding: '1rem', background: '#f8f9fa', margin: '-1rem', borderBottom: '1px solid #e3e6e9' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#333' }}><Link style={{ textDecoration: 'none', color: '#333' }} to="/">CampusBid</Link></h2>
            {user ? (
              <>
                <span style={{ marginRight: '1rem', fontWeight: 500, color: '#555' }}>{user.name}</span>
                <Link to="/my-listings" style={{ marginLeft: '1rem', textDecoration: 'none', color: '#0066cc' }}>My Listings</Link>
                <Link to="/notifications" style={{ marginLeft: '1rem', textDecoration: 'none', color: '#0066cc' }}>Notifications</Link>
                <button onClick={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                  window.location.href = '/login';
                }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ marginRight: '1rem', textDecoration: 'none', color: '#555' }}>Login</Link>
                <Link to="/register" style={{ textDecoration: 'none', color: '#555' }}>Register</Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/auction/:id" element={<AuctionDetail />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;