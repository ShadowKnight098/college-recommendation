import React, { useState } from 'react';
import { api } from '../services/api';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('All fields are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      await api.feedback.submit(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 px-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start animate-fade-in">
      {/* Contact Info Sidebar */}
      <div className="md:col-span-2 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-white heading">Get in Touch</h1>
          <p className="text-xs text-gray-450 leading-relaxed">
            Have questions about predictions? Or want to list your college details on our portal? Drop us a feedback message.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3 text-xs text-gray-300">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Mail size={14} />
            </div>
            <span>support@collegepredictor.edu</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-300">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={14} />
            </div>
            <span>Immediate Response within 24h</span>
          </div>
        </div>
      </div>

      {/* Feedback Form Card */}
      <div className="md:col-span-3 glass-card rounded-2xl p-6 md:p-8 space-y-6">
        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-bold text-white text-base">Message Submitted!</h3>
            <p className="text-xs text-gray-450 max-w-xs mx-auto leading-relaxed">
              Thank you for your feedback. Our administrative team will check the details and reply shortly.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-2 border border-gray-850 hover:bg-slate-900 text-gray-350 text-xs rounded-xl font-medium transition"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-450">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="px-4 py-3 bg-[#0d1222] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-450">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. john@example.com"
                className="px-4 py-3 bg-[#0d1222] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-450">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Help with cutoff rank prediction"
                className="px-4 py-3 bg-[#0d1222] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-455">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your feedback message here..."
                rows={5}
                className="px-4 py-3 bg-[#0d1222] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={13} />
              {submitting ? 'Submitting feedback...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
