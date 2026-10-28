import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Assistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "👋 Hi! I'm your CampusBid AI Assistant. Ask me to find surplus gear, compare prices, or help you set an auto-bid within your budget.",
      results: null,
      proposal: null
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const sendQuery = async (queryText) => {
    const q = queryText || input;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', { message: q }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const assistantMsg = {
        sender: 'assistant',
        text: res.data.reply || "Here is what I found on campus:",
        results: res.data.listings || null,
        proposal: res.data.action || null
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      // Fallback search directly on API if AI endpoint is cut or pending
      try {
        const searchRes = await axios.get('/api/auctions', { params: { q } });
        const list = Array.isArray(searchRes.data) ? searchRes.data : [];
        setMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: list.length > 0 
              ? `Found ${list.length} active listings matching "${q}":`
              : `No exact matches found for "${q}". Try browsing all active auctions on the Home page.`,
            results: list
          }
        ]);
      } catch (e) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: "Could not reach assistant service right now. You can search directly on the Home page!"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async (proposal) => {
    if (!token) {
      alert('Please log in to confirm auto-bidding.');
      return;
    }
    try {
      await axios.put(`/api/auctions/${proposal.auctionId}/autobid`, {
        maxAmount: proposal.maxAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Auto-bid confirmed! Your max budget is capped at ₹${proposal.maxAmount}.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm auto-bid');
    }
  };

  const samplePrompts = [
    "Find me a cycle under ₹2000",
    "Show books or notes",
    "Find electronics closing soon",
    "What dorm essentials are available?"
  ];

  return (
    <div className="container" style={{ maxWidth: 850, padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
          🤖 AI Campus Assistant
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Natural language campus search • Real listings only • Bidding requires explicit confirmation
        </p>
      </div>

      {/* Suggested prompts */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => sendQuery(p)}
            style={{
              padding: '0.35rem 0.75rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: '#38bdf8',
              borderRadius: '999px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            "{p}"
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        minHeight: '400px',
        maxHeight: '550px',
        overflowY: 'auto',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.sender === 'user' ? '#2563eb' : 'rgba(15, 31, 56, 0.7)',
              color: '#f8fafc',
              padding: '0.85rem 1rem',
              borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{m.text}</div>

            {/* Results Cards */}
            {m.results && m.results.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {m.results.map((auc) => (
                  <div key={auc._id} style={{
                    padding: '0.75rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ color: '#f8fafc' }}>{auc.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        ₹{auc.currentPrice} • Category: {auc.category} • Closes: {new Date(auc.closesAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <Link
                      to={`/auction/${auc._id}`}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        textDecoration: 'none'
                      }}
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Confirmation Gate */}
            {m.proposal && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(217, 119, 6, 0.15)',
                border: '1px solid #d97706',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>
                  ⚠️ Confirmation Required (AI Safety Gate)
                </div>
                <p style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>
                  Auto-bid proposal on <strong>{m.proposal.title}</strong> up to <strong>₹{m.proposal.maxAmount}</strong>.
                </p>
                <button
                  onClick={() => confirmAction(m.proposal)}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    background: '#d97706',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    borderRadius: '4px'
                  }}
                >
                  ✓ Confirm Auto-Bid (₹{m.proposal.maxAmount})
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.85rem' }}>
            Thinking & searching campus database...
          </div>
        )}
      </div>

      {/* Input box */}
      <form onSubmit={(e) => { e.preventDefault(); sendQuery(); }} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Ask e.g. 'find cycles under ₹1500' or 'what lab equipment is listed?'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Assistant;
