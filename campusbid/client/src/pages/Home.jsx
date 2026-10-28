import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Home = () => {
  const { category, condition, min, max, q } = useParams();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let filter = { status: 'ACTIVE' };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    // Note: Filter params would need to be passed as query string
    // This is a simplified version
    axios.get('/api/auctions', { params: { q } }).then((res) => {
      setAuctions(res.data);
      setLoading(false);
    });
  }, [q]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Upcoming Auctions</h2>
      <ul>
        {auctions.map((auc) => (
          <li key={auc._id}>
            <h3>{auc.title}</h3>
            <p>₹{auc.currentPrice} - Closes: {new Date(auc.closesAt).toLocaleString()}</p>
            <button style={{ marginTop: '0.5rem' }}>View</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;