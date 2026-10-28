import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function formatCountdown(ms) {
  if (ms <= 0) return 'CLOSED';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [autoBidMax, setAutoBidMax] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answerTexts, setAnswerTexts] = useState({});
  const [submittingBid, setSubmittingBid] = useState(false);
  const [submittingAuto, setSubmittingAuto] = useState(false);
  const [submittingQ, setSubmittingQ] = useState(false);
  const [bidMsg, setBidMsg] = useState({ type: '', text: '' });
  const [msLeft, setMsLeft] = useState(0);

  const token = localStorage.getItem('token');

  // Derive current user id from the JWT (robust; falls back to stored userId)
  let userId = null;
  if (token) {
    try {
      let b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      userId = JSON.parse(atob(b64)).userId;
    } catch { /* ignore */ }
  }
  if (!userId) userId = localStorage.getItem('userId');

  const fetchDetails = useCallback(async () => {
    try {
      const [aucRes, bidsRes, qRes] = await Promise.all([
        axios.get(`/api/auctions/${id}`),
        axios.get(`/api/auctions/${id}/bids`),
        axios.get(`/api/questions/${id}`),
      ]);
      setAuction(aucRes.data);
      setBids(Array.isArray(bidsRes.data) ? bidsRes.data : []);
      setQuestions(Array.isArray(qRes.data) ? qRes.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
    const pollIv = setInterval(fetchDetails, 4000);
    return () => clearInterval(pollIv);
  }, [fetchDetails]);

  // Live countdown
  useEffect(() => {
    if (!auction) return;
    const tick = () => setMsLeft(new Date(auction.closesAt) - Date.now());
    tick();
    const iv = setInterval(tick, 500);
    return () => clearInterval(iv);
  }, [auction]);

  const isClosed = msLeft <= 0;
  const isClosingSoon = msLeft > 0 && msLeft < 120000; // 2 min
  const sellerId = auction ? (typeof auction.sellerId === 'object' ? auction.sellerId?._id : auction.sellerId) : null;
  const isSeller = userId && sellerId && sellerId.toString() === userId.toString();
  const currentPrice = Number(auction?.currentPrice || auction?.startPrice || 0);
  const minIncrement = Number(auction?.minIncrement || 10);
  const nextMinBid = currentPrice + minIncrement;

  const showBidMsg = (type, text) => {
    setBidMsg({ type, text });
    setTimeout(() => setBidMsg({ type: '', text: '' }), 3000);
  };

  const handlePlaceBid = async (amount) => {
    const finalAmount = amount || Number(bidAmount);
    if (!token) { navigate('/login'); return; }
    if (!finalAmount || finalAmount < nextMinBid) {
      showBidMsg('error', `Minimum bid is ₹${nextMinBid}`);
      return;
    }
    setSubmittingBid(true);
    try {
      await axios.post(`/api/auctions/${id}/bids`, { amount: finalAmount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBidAmount('');
      showBidMsg('success', `Bid of ₹${finalAmount} placed!`);
      fetchDetails();
    } catch (err) {
      showBidMsg('error', err.response?.data?.message || 'Bid failed');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleSetAutoBid = async () => {
    if (!token) { navigate('/login'); return; }
    if (!autoBidMax) return;
    setSubmittingAuto(true);
    try {
      await axios.post(`/api/auctions/${id}/autobid`, { maxAmount: Number(autoBidMax) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutoBidMax('');
      showBidMsg('success', `Auto-bid max set to ₹${autoBidMax}`);
    } catch (err) {
      showBidMsg('error', err.response?.data?.message || 'Auto-bid failed');
    } finally {
      setSubmittingAuto(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    if (!token) { navigate('/login'); return; }
    setSubmittingQ(true);
    try {
      await axios.post(`/api/questions/${id}`, { text: questionText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestionText('');
      showBidMsg('success', 'Question sent to seller!');
      fetchDetails();
    } catch (err) {
      showBidMsg('error', err.response?.data?.message || 'Failed to submit question');
    } finally {
      setSubmittingQ(false);
    }
  };

  const handleAnswer = async (qid) => {
    const answer = (answerTexts[qid] || '').trim();
    if (!answer) return;
    try {
      await axios.post(`/api/questions/${qid}/answer`, { answer }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnswerTexts(prev => ({ ...prev, [qid]: '' }));
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post answer');
    }
  };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
      <span>Loading auction lot…</span>
    </div>
  );

  if (!auction) return (
    <div className="page-main">
      <div className="empty-state">
        <div className="icon">🔍</div>
        <h3>Auction not found</h3>
        <p>This lot may have been removed.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Live Auctions</Link>
      </div>
    </div>
  );

  const photos = auction.photos || [];

  return (
    <div className="page-main fade-up">
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
        ← Back to Live Auctions
      </button>

      {/* Anti-snipe banner */}
      {isClosingSoon && (
        <div className="snipe-banner">
          ⚡ ANTI-SNIPE ACTIVE — bids placed in last 30s extend closing time by +60s automatically!
        </div>
      )}

      {/* Bid status message */}
      {bidMsg.text && (
        <div className={`alert alert-${bidMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
          {bidMsg.type === 'success' ? '✅' : '⚠️'} {bidMsg.text}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── LEFT: Details & Q&A ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Item Card */}
          <div className="card">
            <div className="card-body">
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {auction.category || 'General'} · Lot #{auction._id.slice(-6).toUpperCase()}
                </span>
                <span className={`badge badge-${auction.status === 'ACTIVE' ? 'active' : 'closed'}`}>
                  {auction.status}
                </span>
              </div>

              {/* Photos */}
              {photos.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
                  {photos.map((p, i) => (
                    <img
                      key={i}
                      src={p.url || p}
                      alt={`Photo ${i + 1}`}
                      style={{ height: 160, width: 220, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ))}
                </div>
              )}

              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {auction.title}
              </h1>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Listed by <strong style={{ color: 'var(--text-primary)' }}>{auction.sellerId?.name || 'Graduating Senior'}</strong>
                &nbsp;·&nbsp;Condition: <strong style={{ color: 'var(--text-primary)' }}>{auction.condition || 'Used'}</strong>
              </div>

              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {auction.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Q&A */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                💬 Pre-Bid Q&A
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Public clarifications visible to all bidders.
              </p>

              {!isSeller && !isClosed && (
                <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <input
                    className="form-input"
                    placeholder="Ask about condition, accessories, hostel pickup…"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submittingQ}>
                    {submittingQ ? '…' : 'Ask'}
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {questions.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No questions yet. Be the first to ask!</div>
                ) : (
                  questions.map((q) => (
                    <div key={q._id} style={{ padding: '0.75rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Q: {q.text}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        — {q.askerId?.name || 'Anonymous bidder'} · {new Date(q.createdAt).toLocaleString()}
                      </div>
                      {q.answer ? (
                        <div style={{
                          fontSize: '0.8rem', color: 'var(--text-primary)',
                          background: 'rgba(74,222,128,0.08)', borderLeft: '3px solid var(--accent-green, #4ade80)',
                          padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                        }}>
                          <strong style={{ color: 'var(--accent-green, #4ade80)' }}>Seller:</strong> {q.answer}
                        </div>
                      ) : isSeller ? (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                          <input
                            className="form-input"
                            placeholder="Write your answer (visible to everyone)…"
                            value={answerTexts[q._id] || ''}
                            onChange={(e) => setAnswerTexts(prev => ({ ...prev, [q._id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAnswer(q._id); } }}
                            style={{ flex: 1, fontSize: '0.85rem' }}
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAnswer(q._id)}
                          >Reply</button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Awaiting seller's answer…
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Bidding ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '80px' }}>

          {/* Countdown + Price */}
          <div className="card">
            <div className="card-body">
              {/* Countdown */}
              <div className="countdown-display">
                <div className="countdown-label">Time Remaining</div>
                <div className={`countdown-value ${isClosed ? 'closed' : isClosingSoon ? 'urgent' : 'live'}`}>
                  {formatCountdown(msLeft)}
                </div>
                <div className="countdown-closes">
                  Closes: {new Date(auction.closesAt).toLocaleString()}
                </div>
              </div>

              {/* Price row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Current High Bid</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                    ₹{currentPrice}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Min Next Bid</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>₹{nextMinBid}</div>
                </div>
              </div>

              {/* Bidding Controls */}
              {!isClosed && !isSeller && (
                <>
                  {/* Quick bid */}
                  <div className="quick-bid-row">
                    {[minIncrement, minIncrement * 5, minIncrement * 10].map((inc) => (
                      <button
                        key={inc}
                        className="quick-bid-btn"
                        onClick={() => handlePlaceBid(currentPrice + inc)}
                        disabled={submittingBid}
                      >
                        +₹{inc}
                      </button>
                    ))}
                  </div>

                  {/* Custom bid */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <input
                      className="form-input"
                      type="number"
                      min={nextMinBid}
                      placeholder={`Min: ₹${nextMinBid}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-gold"
                      onClick={() => handlePlaceBid()}
                      disabled={submittingBid}
                    >
                      {submittingBid ? '…' : 'Place Bid'}
                    </button>
                  </div>

                  {/* Auto-bid */}
                  <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                      🤖 Proxy Auto-Bid
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      We auto-outbid rivals by ₹{minIncrement} up to your ceiling.
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        className="form-input"
                        type="number"
                        placeholder={`e.g. ₹${currentPrice + minIncrement * 10}`}
                        value={autoBidMax}
                        onChange={(e) => setAutoBidMax(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={handleSetAutoBid} disabled={submittingAuto}>
                        {submittingAuto ? '…' : 'Set Max'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {isClosed && (
                <div className="alert alert-error" style={{ textAlign: 'center' }}>
                  🔒 This auction has closed.
                </div>
              )}

              {isSeller && (
                <div className="alert alert-warning">
                  ℹ️ You are the seller.{' '}
                  <Link to="/my-listings" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Manage in Seller Dashboard →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Bid History */}
          <div className="card">
            <div className="card-body" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
                📊 Bid History <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({bids.length})</span>
              </h3>
              {bids.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No bids yet. Opening: ₹{auction.startPrice}
                </p>
              ) : (
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {bids.map((b, i) => (
                    <div key={b._id || i} className={`bid-row ${i === 0 ? 'top' : ''}`}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {i === 0 ? '🥇 ' : ''}{b.bidderId?.name || 'Student'}
                        </strong>
                        {b.isAuto && <span style={{ fontSize: '0.68rem', color: 'var(--accent-blue)', marginLeft: 4 }}>(auto)</span>}
                      </div>
                      <span className="bid-row-amount">₹{b.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}