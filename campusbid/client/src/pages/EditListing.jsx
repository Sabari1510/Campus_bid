import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`/api/auctions/${id}`)
      .then((res) => {
        setAuction(res.data);
        setTitle(res.data.title || '');
        setDescription(res.data.description || '');
      })
      .catch((err) => {
        setError('Failed to load auction');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { description };
      if (!auction.bidCount || auction.bidCount === 0) {
        payload.title = title;
      }

      await axios.patch(`/api/auctions/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Listing updated successfully!');
      navigate(`/auction/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this auction?')) return;
    try {
      await axios.post(`/api/auctions/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Auction cancelled.');
      navigate('/my-listings');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel auction');
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading auction details...</div>;
  if (!auction) return <div className="container" style={{ padding: '2rem' }}>Auction not found.</div>;

  const hasBids = (auction.bidCount && auction.bidCount > 0) || (auction.bids && auction.bids.length > 0);

  return (
    <div className="container" style={{ maxWidth: 650, padding: '2rem 1.5rem' }}>
      <button onClick={() => navigate('/my-listings')} style={{ marginBottom: '1rem', background: 'transparent', color: '#38bdf8' }}>
        &larr; Back to My Listings
      </button>

      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
        ✏️ Edit Listing: {auction.title}
      </h1>

      {hasBids && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#fbbf24'
        }}>
          ⚠️ <strong>Bids already placed:</strong> Per fair-bidding rules, title and price are locked. You may update the description or pickup terms.
        </div>
      )}

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            Listing Title {hasBids && '(Locked)'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={hasBids}
            style={{ width: '100%', opacity: hasBids ? 0.6 : 1 }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            Description & Handover Notes
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%' }}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '0.6rem 1rem',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          >
            Cancel Listing
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.6rem 1.5rem',
              background: '#2563eb',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
