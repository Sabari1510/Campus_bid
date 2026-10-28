import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search ? new URLSearchParams(location.search) : new URLSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('used');
  const [startPrice, setStartPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('10');
  const [closesAt, setClosesAt] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const now = new Date();
    const defaultCloses = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    setClosesAt(defaultCloses.toISOString());
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('condition', condition);
      formData.append('startPrice', Number(startPrice));
      formData.append('minIncrement', Number(minIncrement || 10));
      formData.append('closesAt', closesAt);

      photos.forEach((photo) => formData.append('photos', photo));

      const response = await axios.post('/api/auctions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Listing created successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
      setStartPrice('');
      setPhotos([]);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create listing');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {success && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <h2>Create Listing</h2>
      <form onSubmit={handleCreate}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5' }}>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5' }}>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          ></textarea>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5' }}>Category:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="e.g., Electronics, Sports, Education"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5' }}>Condition:</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="new">New</option>
            <option value="like-new">Like New</option>
            <option value="used">Used</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5' }}>Start Price (₹):</label>
          <input
            type="number"
            value={startPrice}
            onChange={(e) => setStartPrice(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5' }}>Min Increment (₹):</label>
          <input
            type="number"
            value={minIncrement}
            onChange={(e) => setMinIncrement(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            min="1"
            placeholder="e.g., 10"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5' }}>Closes At:</label>
          <input
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5' }}>Photos (max 3):</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
              setPhotos(validFiles.length > 0 ? validFiles : photos);
            }}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            style={{ padding: '0.5rem 1rem', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            Add Photos
          </button>
          {photos.length > 0 && photos.map((photo, i) => (
            <div key={i} style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
              <img
                src={URL.createObjectURL(photo)}
                alt="Preview"
                style={{ width: '80px', height: '60px', objectFit: 'cover', marginRight: '0.5rem', borderRadius: '4px' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#666' }}>{photo.name}</span>
            </div>
          ))}
        </div>

        <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px' }}>
          {photos.length > 0 ? 'Create Auction' : 'Add photos first'}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;