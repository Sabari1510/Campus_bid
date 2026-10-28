import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auctions', {
      params: { sellerId: localStorage.getItem('userId') }
    }).then((res) => {
      setListings(res.data);
      setLoading(false);
    });
  }, []);
  if (loading) return <div>Loading your listings...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>My Listings</h2>
      <p>Total: {listings.length}</p>
      {listings.length === 0 ? <p>No listings yet.</p> : null}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {listings.map((auc) => (
          <li key={auc._id} style={{ borderBottom: '1px solid #eee', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{auc.title}</h3>
            <p>₹{auc.currentPrice} • {auc.status} • Closes: {new Date(auc.closesAt).toLocaleString()}</p>
            <Link to={`/auction/${auc._id}`} style={{ color: '#0066cc' }}>View</Link>
            {auc.status === 'ACTIVE' && (
              <button style={{ float: 'right', padding: '0.3rem 0.5rem', background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', borderRadius: '4px' }}>Edit</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyListings;