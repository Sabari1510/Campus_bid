import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Electronics', 'Cycles', 'Books', 'Dorm', 'Sports', 'Clothing', 'Other'];

export default function CreateListing() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [condition, setCondition] = useState('used');
  const [startPrice, setStartPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('10');
  const [closesAt, setClosesAt] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const d = new Date(Date.now() + 7 * 86400000);
    const pad = (n) => String(n).padStart(2, '0');
    setClosesAt(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  }, []);

  const handleFileChange = (e) => {
    const valid = Array.from(e.target.files)
      .filter(f => f.type.startsWith('image/'))
      .filter(f => {
        if (f.size > 5 * 1024 * 1024) {
          setError(`Photo "${f.name}" is too large (max 5MB)`);
          return false;
        }
        return true;
      })
      .slice(0, 3);
    if (valid.length > 0) setError('');
    setPhotos(valid);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('category', category);
      fd.append('condition', condition);
      fd.append('startPrice', Number(startPrice));
      fd.append('minIncrement', Number(minIncrement || 10));
      fd.append('closesAt', new Date(closesAt).toISOString());
      photos.forEach(p => fd.append('photos', p));

      await axios.post('/api/auctions', fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      setSuccess('✅ Listing created! Redirecting…');
      setTimeout(() => navigate('/my-listings'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-main fade-up" style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', marginBottom: '0.25rem' }}>
          Create Auction Listing
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          List your item for the campus community. Escrow-protected, anti-snipe enabled.
        </p>
      </div>

      {error   && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleCreate}>
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Item Details
            </h2>

            <div className="form-group">
              <label className="form-label">Item Title</label>
              <input id="cl-title" className="form-input" placeholder="e.g. Casio FX-991EX Scientific Calculator" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea id="cl-desc" className="form-input form-textarea" placeholder="Describe condition, what's included, hostel, etc." value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select id="cl-category" className="form-input form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select id="cl-condition" className="form-input form-select" value={condition} onChange={e => setCondition(e.target.value)}>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="used">Used</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-body">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Auction Settings
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Starting Price (₹)</label>
                <input id="cl-price" className="form-input" type="number" min="1" placeholder="e.g. 500" value={startPrice} onChange={e => setStartPrice(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Min Increment (₹)</label>
                <input id="cl-increment" className="form-input" type="number" min="1" placeholder="10" value={minIncrement} onChange={e => setMinIncrement(e.target.value)} />
                <div className="form-hint">Minimum step between bids.</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Closes At</label>
              <input id="cl-closes" className="form-input" type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)} required />
              <div className="form-hint">Anti-snipe: last-minute bids auto-extend by 60s.</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-body">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Photos (max 3)
            </h2>

            <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="cl-photos" />
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
              📷 Choose Photos
            </button>

            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(p)}
                      alt={`Preview ${i + 1}`}
                      style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                    />
                    <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {(p.size / 1024).toFixed(0)}KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button id="cl-submit" type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '1.5rem' }} disabled={loading}>
          {loading ? 'Creating…' : '🚀 Launch Auction'}
        </button>
      </form>
    </div>
  );
}