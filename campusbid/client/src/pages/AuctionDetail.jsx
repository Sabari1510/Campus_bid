import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    axios.get(`/api/auctions/${id}`).then((res) => {
      setAuction(res.data);
      setLoading(false);
    });
    axios.get(`/api/auctions/${id}/bids`).then((res) => {
      setBids(res.data);
    });
  }, [id]);

  if (loading || !auction) return <div>Loading auction...</div>;

  const handlePlaceBid = async () => {
    if (!bidAmount || Number(bidAmount) < (auction.minIncrement || 10)) {
      alert(`Minimum bid is ₹${auction.minIncrement || 10}`);
      return;
    }
    try {
      await axios.post(`/api/auctions/${id}/bids`, { amount: Number(bidAmount) });
      setBidAmount('');
      axios.get(`/api/auctions/${id}`).then((res) => {
        setAuction(res.data);
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Bid failed');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
      {auction.status === 'ACTIVE' ? (
        <div style={{ marginBottom: '1rem' }}>
          <h2>{auction.title}</h2>
          <p>₹{auction.currentPrice} starting price</p>
          <p>Category: {auction.category || 'General'}</p>
          <p>Condition: {auction.condition || 'used'}</p>
          <p>Closes: {new Date(auction.closesAt).toLocaleString()}</p>
          
          <div style={{ marginTop: '1rem' }}>
            <label>Place Bid: ₹{bidAmount}</label>
            <input
              type="number"
              min={auction.minIncrement || 10}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              style={{ width: '100px' }}
            />
            <button onClick={handlePlaceBid}>Place Bid</button>
          </div>
        </div>
      ) : (
        <div>
          <h2>{auction.title}</h2>
          <p>Status: {auction.status}</p>
          <p>Final Price: ₹{auction.currentPrice}</p>
          <p>Winner: {auction.leaderId ? 'Top bidder' : 'No bids yet'}</p>
        </div>
      )}

      <h3>Bid History</h3>
      <ul>
        {bids.map((bid) => (
          <li key={bid._id}>
            {bid.bidderId ? bid.bidderId.name : 'Anonymous'}: ₹{bid.amount}
          </li>
        ))}
      </ul>

      {auction.sellerId._id.toString() !== localStorage.getItem('userId') && (
        <button onClick={() => {}">Ask Question</button>
      )}
    </div>
  );
};

export default AuctionDetail;