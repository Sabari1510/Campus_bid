import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [bidAmount, setBidAmount] = useState('');
  const [autoBidMax, setAutoBidMax] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [sellerAnswer, setSellerAnswer] = useState({});
  const [submittingBid, setSubmittingBid] = useState(false);
  const [submittingAuto, setSubmittingAuto] = useState(false);
  const [submittingQ, setSubmittingQ] = useState(false);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const fetchDetails = async () => {
    try {
      const [aucRes, bidsRes] = await Promise.all([
        axios.get(`/api/auctions/${id}`),
        axios.get(`/api/auctions/${id}/bids`)
      ]);
      setAuction(aucRes.data);
      setBids(Array.isArray(bidsRes.data) ? bidsRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 4000); // 4s fallback polling
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>Loading auction lot #{id}...</div>;
  if (!auction) return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>Auction lot not found. <Link to="/">Return home</Link></div>;

  const currentPrice = Number(auction.currentPrice || auction.startPrice || 0);
  const minIncrement = Number(auction.minIncrement || 10);
  const nextMinBid = currentPrice + minIncrement;

  // Seller check
  const sellerId = typeof auction.sellerId === 'object' ? auction.sellerId?._id : auction.sellerId;
  const isSeller = userId && sellerId && sellerId.toString() === userId.toString();

  // Time remaining
  const now = new Date();
  const closesAt = new Date(auction.closesAt);
  const diffMs = closesAt - now;
  const isClosingSoon = diffMs > 0 && diffMs <= 30000; // <= 30 seconds
  const isClosed = diffMs <= 0 || auction.status !== 'ACTIVE';

  const formatCountdown = () => {
    if (isClosed) return 'AUCTION CLOSED';
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  // Bid handlers
  const handlePlaceBid = async (amountToBid) => {
    const val = Number(amountToBid || bidAmount);
    if (!val || val < nextMinBid) {
      alert(`Minimum allowed bid is ₹${nextMinBid}`);
      return;
    }
    if (!token) {
      alert('Please log in to place bids');
      navigate('/login');
      return;
    }

    setSubmittingBid(true);
    try {
      await axios.post(`/api/auctions/${id}/bids`, { amount: val }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBidAmount('');
      await fetchDetails();
      alert('Bid accepted!');
    } catch (err) {
      alert(err.response?.data?.message || 'Bid failed');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleSetAutoBid = async () => {
    const maxVal = Number(autoBidMax);
    if (!maxVal || maxVal <= currentPrice) {
      alert(`Proxy max must be higher than current price ₹${currentPrice}`);
      return;
    }
    if (!token) {
      alert('Please log in to set auto-bid');
      navigate('/login');
      return;
    }

    setSubmittingAuto(true);
    try {
      await axios.put(`/api/auctions/${id}/autobid`, { maxAmount: maxVal }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutoBidMax('');
      alert(`Auto-bid proxy set to ₹${maxVal}! System will automatically outbid competitors up to this maximum.`);
      await fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Auto-bid failed');
    } finally {
      setSubmittingAuto(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    if (!token) {
      alert('Please log in to ask questions');
      navigate('/login');
      return;
    }

    setSubmittingQ(true);
    try {
      await axios.post(`/api/auctions/${id}/questions`, { text: questionText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestionText('');
      alert('Question posted for seller!');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit question');
    } finally {
      setSubmittingQ(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 950, padding: '2rem 1.5rem' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '1rem', background: 'transparent', color: '#38bdf8' }}>
        &larr; Back to Live Auctions
      </button>

      {/* Anti-snipe Banner */}
      {isClosingSoon && (
        <div style={{
          background: 'rgba(217, 119, 6, 0.2)',
          border: '2px solid #d97706',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          color: '#fbbf24',
          fontWeight: 700,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'pulse 1.5s infinite'
        }}>
          ⚡ ANTI-SNIPE ACTIVE: Bids placed under 30s remaining automatically extend closing time by +60 seconds!
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Details & Q&A */}
        <div>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 600 }}>
                {auction.category || 'General'} • Lot #{auction._id.slice(-6)}
              </span>
              <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: auction.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: auction.status === 'ACTIVE' ? '#10b981' : '#ef4444'
              }}>
                {auction.status}
              </span>
            </div>

            <h1 style={{ fontSize: '1.8rem', color: '#f8fafc', margin: '0.5rem 0' }}>
              {auction.title}
            </h1>

            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Listed by <strong>{auction.sellerId?.name || 'Graduating Senior'}</strong> • Condition: <strong>{auction.condition || 'Used'}</strong>
            </div>

            <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {auction.description || 'No description provided.'}
            </p>
          </div>

          {/* Q&A Section */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
              💬 Pre-Bid Questions & Answers
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Public clarifications visible to all bidders to guarantee fair competition.
            </p>

            {/* Ask form */}
            {!isSeller && (
              <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Ask seller about working condition, accessories, hostel pickup..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={submittingQ}
                  style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', fontWeight: 600 }}
                >
                  {submittingQ ? 'Posting...' : 'Ask'}
                </button>
              </form>
            )}

            {/* List questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>
                  Q: Does this come with original charger/cables?
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  A: Yes, original box and charger included. Pickup at Hostel 14.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bidding Card & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Bidding Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            padding: '1.5rem'
          }}>
            <div style={{
              background: '#081224',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1.25rem',
              border: isClosingSoon ? '1px solid #d97706' : '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Time Remaining</div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: isClosed ? '#ef4444' : isClosingSoon ? '#f59e0b' : '#38bdf8',
                fontFamily: 'Space Grotesk, monospace'
              }}>
                {formatCountdown()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                Closes: {closesAt.toLocaleTimeString()}
              </div>
            </div>

            {/* Current Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Current High Bid</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>
                  ₹{currentPrice}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Next Min Allowed</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#cbd5e1' }}>
                  ₹{nextMinBid}
                </div>
              </div>
            </div>

            {/* Bidding Controls */}
            {!isClosed && !isSeller && (
              <>
                {/* Quick Bid Triggers */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[10, 50, 100].map(inc => (
                    <button
                      key={inc}
                      onClick={() => handlePlaceBid(currentPrice + inc)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      +₹{inc}
                    </button>
                  ))}
                </div>

                {/* Custom Bid */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <input
                    type="number"
                    min={nextMinBid}
                    placeholder={`Min: ₹${nextMinBid}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => handlePlaceBid()}
                    disabled={submittingBid}
                    style={{
                      padding: '0.6rem 1.2rem',
                      background: '#d97706',
                      color: '#ffffff',
                      fontWeight: 700,
                      borderRadius: '6px'
                    }}
                  >
                    {submittingBid ? 'Bidding...' : 'Place Bid'}
                  </button>
                </div>

                {/* Proxy Auto-Bid */}
                <div style={{
                  padding: '1rem',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.25rem' }}>
                    🤖 Set Proxy Auto-Bid Max
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    Our system will automatically outbid competitors by ₹{minIncrement} up to your cap.
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      placeholder="e.g. 1800"
                      value={autoBidMax}
                      onChange={(e) => setAutoBidMax(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={handleSetAutoBid}
                      disabled={submittingAuto}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#2563eb',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      Set Max
                    </button>
                  </div>
                </div>
              </>
            )}

            {isSeller && (
              <div style={{
                padding: '0.75rem',
                background: 'rgba(217, 119, 6, 0.1)',
                border: '1px solid #d97706',
                borderRadius: '6px',
                color: '#fbbf24',
                fontSize: '0.85rem'
              }}>
                ℹ️ You are the seller of this item. Manage approvals in your{' '}
                <Link to="/my-listings" style={{ color: '#38bdf8', textDecoration: 'underline' }}>Seller Dashboard</Link>.
              </div>
            )}
          </div>

          {/* Bid History */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            padding: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '0.75rem' }}>
              📊 Public Bid History ({bids.length})
            </h3>
            {bids.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No bids yet. Opening bid starts at ₹{auction.startPrice}!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                {bids.map((b, i) => (
                  <div
                    key={b._id || i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.45rem 0.6rem',
                      background: i === 0 ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
                      border: i === 0 ? '1px solid #10b981' : '1px solid var(--border-color)',
                      borderRadius: '4px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <strong style={{ color: '#f8fafc' }}>
                        {b.bidderId?.name || 'Student Bidder'}
                      </strong>
                      {b.isAuto && <span style={{ fontSize: '0.7rem', color: '#38bdf8', marginLeft: '0.3rem' }}>(auto)</span>}
                    </div>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>₹{b.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;