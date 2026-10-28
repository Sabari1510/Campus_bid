import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = location.search ? new URLSearchParams(location.search) : new URLSearchParams();
    let filter = { status: 'ACTIVE' };

    if (params.get('q')) {
      filter.$or = [
        { title: { $regex: params.get('q'), $options: 'i' } },
        { description: { $regex: params.get('q'), $options: 'i' } },
      ];
    }
    if (params.get('category')) filter.category = params.get('category');
    if (params.get('condition')) filter.condition = params.get('condition');
    if (params.get('min')) filter.currentPrice = { $gte: Number(params.get('min')) };
    if (params.get('max')) {
      filter.currentPrice = { ...filter.currentPrice, $lte: Number(params.get('max')) };
    }

    axios.get('/api/auctions', { params }).then((res) => {
      setAuctions(res.data);
      setLoading(false);
    });
  }, [params]);

  if (loading) return <div>Loading auctions...</div>;

  const formatCountdown = (closesAt) => {
    const now = new Date();
    const diff = new Date(closesAt) - now;
    if (diff <= 0) return 'Closed';
    const minutes = Math.max(0, Math.floor(diff / 60000));
    const seconds = Math.max(0, Math.floor((diff % 60000) / 1000));
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
      <h2>Upcoming Auctions</h2>
      <p>Total: {auctions.length}</p>
      <ul>
        {auctions.map((auc) => (
          <li key={auc._id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem', marginBottom: '0.5rem' }}>
            <h3>{auc.title}</h3>
            <p>₹{auc.currentPrice} - Category: {auc.category || 'General'}</p>
            <p>Closes: {new Date(auc.closesAt).toLocaleString()}</p>
            <span>{formatCountdown(auc.closesAt)}</span>
            <button 
              style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}
              onClick={() => navigate(`/auction/${auc._id}`)}
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;