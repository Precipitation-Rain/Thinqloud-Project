import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Heart, CreditCard, QrCode, Building2, ShieldCheck, Lock, AlertCircle, RefreshCw 
} from 'lucide-react';
import { processDonation } from '../api';

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

export default function DonationModal({ isOpen, onClose, campaign, campaigns, onDonationSuccess, currentUser }) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaign?.id || '');
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [frequency, setFrequency] = useState('one-time');
  const [tipPercent, setTipPercent] = useState(10);
  
  // Donor Details
  const [donorName, setDonorName] = useState(currentUser?.name || '');
  const [donorEmail, setDonorEmail] = useState(currentUser?.email || '');
  const [donorPhone, setDonorPhone] = useState(currentUser?.phone || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dedication, setDedication] = useState('');
  
  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [upiId, setUpiId] = useState('donor@okhdfcbank');
  
  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (campaign) {
      setSelectedCampaignId(campaign.id);
    } else if (campaigns && campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaign, campaigns]);

  useEffect(() => {
    if (currentUser) {
      setDonorName(currentUser.name || '');
      setDonorEmail(currentUser.email || '');
      setDonorPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const currentAmount = isCustom ? (parseFloat(customAmount) || 0) : amount;
  const tipAmount = (currentAmount * tipPercent) / 100;
  const totalAmount = currentAmount + tipAmount;

  const handleAmountClick = (val) => {
    setIsCustom(false);
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setIsCustom(true);
    setCustomAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCampaignId) {
      setErrorMsg('Please select a campaign to support.');
      return;
    }
    if (currentAmount <= 0) {
      setErrorMsg('Please enter a valid donation amount.');
      return;
    }
    if (!donorEmail || !donorEmail.includes('@')) {
      setErrorMsg('Please enter a valid donor email address for receipt delivery.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        campaign_id: parseInt(selectedCampaignId),
        donor_name: isAnonymous ? 'Anonymous Donor' : (donorName || 'Generous Donor'),
        donor_email: donorEmail.trim(),
        donor_phone: donorPhone.trim(),
        amount: currentAmount,
        tip_amount: tipAmount,
        payment_method: paymentMethod,
        is_recurring: frequency === 'monthly' ? 1 : 0,
        frequency: frequency,
        dedication: dedication.trim(),
        is_anonymous: isAnonymous ? 1 : 0
      };

      const result = await processDonation(payload);

      try {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#047857', '#0f766e', '#0284c7', '#d97706']
        });
      } catch (err) {
        // ignore
      }

      setIsSubmitting(false);
      onClose();
      if (onDonationSuccess) {
        onDonationSuccess(result.donation);
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to process donation. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6 animate-in fade-in duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">Make a Contribution</span>
              <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 text-[10px] font-bold">
                Tax Deductible
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              100% of your funds go directly to verified project expenditures.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Campaign Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Initiative:
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs rounded-lg px-3 py-2 border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
            >
              {(campaigns || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Frequency Toggle */}
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setFrequency('one-time')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                frequency === 'one-time' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              One-Time Donation
            </button>
            <button
              type="button"
              onClick={() => setFrequency('monthly')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                frequency === 'monthly' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Monthly Sustainer
            </button>
          </div>

          {/* Amount Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Donation Amount (USD)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = !isCustom && amount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountClick(amt)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-700 text-emerald-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="Custom amount..."
                value={customAmount}
                onChange={handleCustomChange}
                className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Donor Details</span>
              {currentUser && (
                <span className="text-[11px] text-emerald-700 font-medium">
                  Logged in as {currentUser.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Dedication / In Honor Of</label>
                <input
                  type="text"
                  placeholder="Optional memorial note"
                  value={dedication}
                  onChange={(e) => setDedication(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
              />
              <span className="text-xs text-slate-600">
                Keep donation anonymous on public backers list
              </span>
            </label>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-800 block">Payment Method</span>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'Card', label: 'Card' },
                { id: 'UPI', label: 'UPI / QR' },
                { id: 'PayPal', label: 'PayPal' },
                { id: 'Bank Transfer', label: 'Bank Wire' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    paymentMethod === m.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              {paymentMethod === 'Card' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Card Number</span>
                    <span className="text-slate-500 flex items-center gap-1 font-mono text-[10px]">
                      <Lock className="w-3 h-3 text-emerald-700" /> SSL Encrypted
                    </span>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md text-xs font-mono bg-white border border-slate-300"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="px-2.5 py-1.5 rounded-md text-xs font-mono bg-white border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="px-2.5 py-1.5 rounded-md text-xs font-mono bg-white border border-slate-300"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white p-1 rounded-md border border-slate-200 flex items-center justify-center shrink-0">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-800 text-[11px]">Instant UPI QR Code</span>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-2 py-1 rounded text-xs font-mono bg-white border border-slate-300"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'PayPal' && (
                <p className="text-slate-600 text-xs py-1">Direct checkout with PayPal sandbox simulation.</p>
              )}

              {paymentMethod === 'Bank Transfer' && (
                <p className="text-slate-600 font-mono text-[11px]">Account: KindBridge Global Aid 9821-0044-8812</p>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Processing Transaction...' : `Complete Donation of $${totalAmount.toFixed(2)}`}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-1.5">
              An official 80G tax exemption receipt will be generated immediately.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}
