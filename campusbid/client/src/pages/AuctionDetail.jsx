import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AuctionDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [showQuestion, setShowQuestion] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  useEffect(() => {
    axios.get(`/api/auctions/${id}`).then((res) => {
      setAuction(res.data);
      setLoading(false);
    });
    axios.get(`/api/auctions/${id}/bids`).then((res) => {
      setBids(res.data);
    });
  }, [id]);

  const formatCountdown = (closesAt) => {
    const now = new Date();
    const diff = new Date(closesAt) - now;
    if (diff <= 0) return 'Closed';
    const minutes = Math.max(0, Math.floor(diff / 60000));
    const seconds = Math.max(0, Math.floor((diff % 60000) / 1000));
    return `${minutes}m ${seconds}s ${diff <= 30 * 1000 ? '(extension: +60s)' : ''}`;
  };

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

  const askQuestion = async () => {
    if (!questionText.trim()) return;
    try {
      await axios.post(`/api/auctions/${id}/questions`, { text: questionText });
      setQuestionText('');
      setShowQuestion(false);
      axios.get(`/api/auctions/${id}`).then((res) => {
        setAuction(res.data);
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Question failed');
    }
  };

  if (loading || !auction) return <div>Loading auction...</div>;

  const isSeller = auction.sellerId && auction.sellerId._id && auction.sellerId._id.toString() === userId;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {auction.status === 'ACTIVE' ? (
        <div>
          <h2>{auction.title}</h2>
          <p style={{ color: '#666' }}>₹{auction.currentPrice} starting price</p>
          <p style={{ color: '#666' }}>Category: {auction.category || 'General'}</p>
          <p style={{ color: '#666' }}>Condition: {auction.condition || 'used'}</p>
          <p style={{ color: '#666' }}>Closes: {new Date(auction.closesAt).toLocaleString()}</p>
          <div>{formatCountdown(auction.closesAt)}</div>
          <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <h3>Place Bid</h3>
            <p>Minimum bid: ₹{auction.minIncrement || 10}</p>
            <input
              type="number"
              min={auction.minIncrement || 10}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              style={{ width: '100px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button onClick={handlePlaceBid} style={{ padding: '0.5rem 1rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', marginLeft: '0.5rem' }}>
              Bid
            </button>
          </div>

          {isSeller ? (
            <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
              <h3>Seller Actions</h3>
              <button style={{ padding: '0.5rem 1rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', marginBottom: '0.5rem' }}>
                Approve Winner
              </button>
              <button style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                Reject Winner
              </button>
              <button style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                Complete Handover
              </button>
              <button style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                Cancel Auction
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <h2>{auction.title}</h2>
          <p>Status: {auction.status}</p>
          <p>Final Price: ₹{auction.currentPrice}</p>
          <p>Winner: {auction.leaderId ? 'Top bidder' : 'No bids yet'}</p>
          {auction.outcomeNote && <p>{auction.outcomeNote}</p>}
        </div>
      )}

      <h3>Bid History</h3>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {bids.map((bid) => (
          <li key={bid._id} style={{ margin: '0.5rem 0', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <strong>{bid.bidderId && bid.bidderId.name ? bid.bidderId.name : 'Anonymous'}</strong>: ₹{bid.amount}
            {bid.isAuto && <span style={{ color: '#666', fontSize: '0.8rem' }}> (auto-bid)</span>
            </span>
          </li>
        ))}
      </ul>

      {isSeller ? null : (
        <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Ask Question</h3>
          <input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Your question..."
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.5rem' }}
          />
          <button onClick={askQuestion} style={{ padding: '0.5rem 1rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px' }}>
            Ask
          </button>
        </div>
      )}

      {auction.questions && auction.questions.length > 0 ? (
        <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Q&A</h3>
          {auction.questions.map((q) => (
            <div key={q._id} style={{ marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
              <strong>{q.askerId && q.askerId.name ? q.askerId.name : 'Asker'}:</strong> {q.text}
              {q.answer && (
                <p style={{ margin: '0.5rem 0', color: '#28a745' }}><strong>Answer:</strong> {q.answer}</p>
              )}
              {q.askerId && q.askerId._id.toString() === userId && !q.answer && (
                <button style={{ float: 'right', padding: '0.3rem 0.5rem', background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', borderRadius: '4px' }}>Hide</button>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AuctionDetail;