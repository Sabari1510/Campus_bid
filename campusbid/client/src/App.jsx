import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import AuctionDetail from './pages/AuctionDetail';
import MyListings from './pages/MyListings';
import MyBids from './pages/MyBids';
import Wanted from './pages/Wanted';
import Assistant from './pages/Assistant';
import Notifications from './pages/Notifications';

const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, paddingBottom: '3rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />
            <Route path="/wanted" element={<Wanted />} />
            <Route path="/assistant" element={<Assistant />} />

            {/* Protected Routes */}
            <Route path="/create-listing" element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            } />
            <Route path="/edit-listing/:id" element={
              <ProtectedRoute>
                <EditListing />
              </ProtectedRoute>
            } />
            <Route path="/my-listings" element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            } />
            <Route path="/my-bids" element={
              <ProtectedRoute>
                <MyBids />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;