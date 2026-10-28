import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateListing from './pages/CreateListing';
import AuctionDetail from './pages/AuctionDetail';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateListing />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
      </Routes>
    </Router>
  );
};

export default App;