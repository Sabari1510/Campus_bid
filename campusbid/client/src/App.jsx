import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateListing from './pages/CreateListing';
import AuctionDetail from './pages/AuctionDetail';
import MyListings from './pages/MyListings';
import Notifications from './pages/Notifications';
import Wanted from './pages/Wanted';
import MyBids from './pages/MyBids';
import Assistant from './pages/Assistant';

const App = () => {
  return (
    <Router>
      <div className="page-wrapper">
        <Navbar />
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/auction/:id"    element={<AuctionDetail />} />
          <Route path="/my-listings"    element={<MyListings />} />
          <Route path="/notifications"  element={<Notifications />} />
          <Route path="/wanted"         element={<Wanted />} />
          <Route path="/my-bids"        element={<MyBids />} />
          <Route path="/assistant"      element={<Assistant />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;