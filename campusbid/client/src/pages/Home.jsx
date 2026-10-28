import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const search = location.search ? new URLSearchParams(location.search) : new URLSearchParams();

  useEffect(() => {
    let filter = { status: 'ACTIVE' };

    if (search.get('q')) {
      filter.$or = [
        { title: { $regex: search.get('q'), $options: 'i' } },
        { description: { $regex: search.get('q'), $options: 'i' } },
      ];
    }
    if (search.get('category')) filter.category = search.get('category');
    if (search.get('condition')) filter.condition = search.get('condition');
    if (search.get('min')) filter.currentPrice = { $gte: Number(search.get('min')) };
    if (search.get('max')) {
      filter.currentPrice = { ...filter.currentPrice, $lte: Number(search.get('max')) };
    }

    axios.get('/api/auctions', { params: filter }).then((res) => {
      setAuctions(res.data);
      setLoading(false);
    });
  }, [search]);

  if (loading) return <div>Loading auctions...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Upcoming Auctions</h2>
      <p>Total: {auctions.length}</p>
      
      <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Search items..."
          onChange={(e) => {
            const newSearch = new URLSearchParams(search);
            newSearch.set('q', e.target.value);
            navigate(`?${newSearch.toString()}`);
          }}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button
          onClick={() => navigate('?reset=true')}
          style={{ padding: '0.5rem 1rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Reset
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {auctions.map((auc) => (
          <li key={auc._id} style={{ borderBottom: '1px solid #eee', padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#333' }}>{auc.title}</h3>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>
              ₹{auc.currentPrice} • {auc.category || 'General'} • Closes: {new Date(auc.closesAt).toLocaleString()}
            </p>
            <FormatCountdown closesAt={auc.closesAt} />
            
            <div style={{ marginTop: '0.5rem' }}>
              <Link to={`/auction/${auc._id}`} style={{ textDecoration: 'none' }}>
                <button style={{ padding: '0.5rem 1rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px' }}>
                  View
                </button>
              </Link>
              
              {auc.sellerId && auc.sellerId._id && auc.sellerId._id.toString() === localStorage.getItem('userId') ? (
                <button style={{ padding: '0.5rem 1rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', marginLeft: '0.5rem' }}>
                  Manage
                </button>
              ) : ''}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;