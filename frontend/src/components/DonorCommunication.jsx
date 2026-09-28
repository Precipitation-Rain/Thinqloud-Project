import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchCommunications, sendCommunication } from '../api';

export default function DonorCommunication({ campaigns }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [type, setType] = useState('inquiry');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCommunications();
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching communications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !email || !subject || !content) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSending(true);
    try {
      await sendCommunication({
        sender_name: name.trim(),
        sender_email: email.trim(),
        campaign_id: campaignId ? parseInt(campaignId) : null,
        message_type: type,
        subject: subject.trim(),
        content: content.trim()
      });

      setSuccessMsg('Your message has been sent to our NGO team.');
      setName('');
      setEmail('');
      setSubject('');
      setContent('');
      loadCommunications();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Donor Inquiries & Support Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Submit questions regarding fund allocation, tax receipts, or program operations. Our team responds within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Send an Inquiry to NGO Staff
          </h2>

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Topic</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden"
                >
                  <option value="inquiry">General Inquiry</option>
                  <option value="feedback">Feedback</option>
                  <option value="tax_help">Tax 80G Receipt</option>
                  <option value="volunteer">Volunteering</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Initiative</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden truncate"
                >
                  <option value="">General</option>
                  {(campaigns || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Subject *</label>
              <input
                type="text"
                required
                placeholder="Inquiry summary"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Message *</label>
              <textarea
                required
                rows={3}
                placeholder="Write details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Submit Message'}
            </button>
          </form>
        </div>

        {/* Right Q&A Feed */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            Community Questions & Verified Answers
          </h2>

          {isLoading ? (
            <div className="text-slate-400 text-xs py-6 text-center">Loading communications...</div>
          ) : messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 block">{m.subject}</span>
                      <span className="text-[11px] text-slate-500">
                        {m.sender_name} • {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      m.status === 'replied' || m.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.status === 'replied' || m.status === 'resolved' ? 'Answered' : 'Pending'}
                    </span>
                  </div>

                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                    "{m.content}"
                  </p>

                  {m.reply && (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-md space-y-0.5">
                      <span className="font-bold text-emerald-950 block text-[11px]">Official Response:</span>
                      <p className="text-emerald-900 text-[11px]">{m.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">No questions yet.</div>
          )}
        </div>

      </div>

    </div>
  );
}
