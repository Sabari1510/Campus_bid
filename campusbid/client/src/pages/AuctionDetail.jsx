import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCountdown } from '../utils/time';

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
      <h2>{auction.title}</h2>
      <p>₹{auction.currentPrice} starting price</p>
      <p>Closes: {new Date(auction.closesAt).toLocaleString()}</p>
      {formatCountdown(auction.closesAt)}
      
      <h3>Bid History</h3>
      <ul>
        {bids.map((bid) => (
          <li key={bid._id}>
            {bid.bidderId.name}: ₹{bid.amount}
          </li>
        ))}
      </ul>

      {auction.status === 'ACTIVE' && (
        <div>
          <h3>Place Bid</h3>
          <p>Minimum bid: ₹{auction.minIncrement}</p>
          <input
            ref={(input) => { this.input = input; }}
            type="number"
            min={auction.minIncrement}
            placeholder="Bid amount"
          />
          <button onClick={() => {}">Place Bid</button>
        </div>
      )}

      {auction.sellerId._id.toString() !== localStorage.getItem('userId') && (
        <button>Ask Question</button>
      )}
    </div>
  );
};

export default AuctionDetail;