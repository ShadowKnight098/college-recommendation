import React, { useState } from 'react';
import { api } from '../services/api';
import { Send, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('All fields are required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.feedback.submit(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff' }}>Contact</h1>
      <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: '0.5rem' }}>
        Have questions or want to list your college? Send us a message.
      </p>

      <div style={{ borderTop: '1px solid #18181b', margin: '2rem 0' }} />

      {success ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <CheckCircle size={32} style={{ color: '#10b981', margin: '0 auto' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ffffff', marginTop: '1rem' }}>
            Message sent.
          </p>
          <p style={{ fontSize: '13px', color: '#71717a', marginTop: '0.25rem' }}>
            We'll get back to you soon.
          </p>
          <button
            className="btn-secondary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => setSuccess(false)}
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{
              fontSize: '0.875rem',
              color: '#f87171',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ fontSize: '13px', color: '#71717a', marginBottom: '0.375rem', display: 'block' }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#71717a', marginBottom: '0.375rem', display: 'block' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#71717a', marginBottom: '0.375rem', display: 'block' }}>
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#71717a', marginBottom: '0.375rem', display: 'block' }}>
              Message
            </label>
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="input-field"
              style={{ resize: 'none' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Send size={16} />
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactPage;
