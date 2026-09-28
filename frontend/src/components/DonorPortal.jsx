import React, { useState, useEffect } from 'react';
import { Search, Printer, AlertCircle, User, ShieldCheck } from 'lucide-react';
import { lookupDonor } from '../api';

const SAMPLE_DONORS = [
  { name: 'Sophia Reynolds', email: 'sophia.reynolds@example.com', tier: 'Platinum' },
  { name: 'Marcus Vance', email: 'marcus.v@example.com', tier: 'Gold' },
  { name: 'Elena Rostova', email: 'elena.rostova@example.com', tier: 'Gold' },
  { name: 'David Chen', email: 'david.chen@example.com', tier: 'Silver' },
];

export default function DonorPortal({ onOpenReceipt, currentUser, onOpenAuth }) {
  const defaultEmail = currentUser?.email || 'sophia.reynolds@example.com';
  const [emailInput, setEmailInput] = useState(defaultEmail);
  const [donorData, setDonorData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const targetEmail = currentUser?.email || 'sophia.reynolds@example.com';
    setEmailInput(targetEmail);
    handleLookup(targetEmail);
  }, [currentUser]);

  const handleLookup = async (emailToSearch) => {
    const target = emailToSearch || emailInput;
    if (!target.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await lookupDonor(target);
      setDonorData(data);
    } catch (err) {
      setErrorMsg(err.message || 'No donor found with this email.');
      setDonorData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Top Banner & Search */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Donor Impact & Receipt Records
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {currentUser 
                ? `Viewing personal giving record and 80G receipts for ${currentUser.name}.`
                : 'Access lifetime contributions, 80G tax exemption receipts, and impact updates.'}
            </p>
          </div>

          {!currentUser && (
            <button
              onClick={() => onOpenAuth('donor', 'login')}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0"
            >
              Sign In to Your Account
            </button>
          )}
        </div>

        {/* Email Lookup form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleLookup(); }} 
          className="flex flex-col sm:flex-row gap-2 pt-2 max-w-md"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="donor@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {isLoading ? 'Searching...' : 'Find Records'}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
          <span>Demo profiles:</span>
          {SAMPLE_DONORS.map((sd) => (
            <button
              key={sd.email}
              type="button"
              onClick={() => {
                setEmailInput(sd.email);
                handleLookup(sd.email);
              }}
              className="px-2 py-0.5 rounded bg-white text-slate-700 text-[11px] font-medium border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {sd.name}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Donor Record Dashboard */}
      {donorData && donorData.donor && (
        <div className="space-y-6">
          
          {/* Summary Box */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{donorData.donor.name}</h2>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  {donorData.donor.tier} Tier
                </span>
                <span className="text-xs text-slate-400">• {donorData.donor.badge || 'Supporter'}</span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{donorData.donor.email}</p>
            </div>

            <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Lifetime Giving</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {formatCurrency(donorData.donor.total_donated)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contributions</span>
                <span className="text-lg font-bold text-emerald-800 font-mono">
                  {donorData.donor.donations_count}
                </span>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Donation Transactions & Tax Receipts</h3>
              <span className="text-xs text-slate-500">{donorData.donations?.length || 0} Total</span>
            </div>

            {donorData.donations && donorData.donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Initiative</th>
                      <th className="p-3">Receipt No.</th>
                      <th className="p-3">Payment Mode</th>
                      <th className="p-3 text-right">Amount (USD)</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donorData.donations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="p-3 whitespace-nowrap text-slate-600">
                          {new Date(d.created_at).toLocaleDateString()}
                        </td>

                        <td className="p-3 font-semibold text-slate-800">
                          {d.campaign_title}
                          {d.dedication && <span className="block text-[10px] text-slate-400 font-normal italic">"{d.dedication}"</span>}
                        </td>

                        <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                          {d.receipt_number}
                        </td>

                        <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                          {d.payment_method}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          ${d.amount}
                        </td>

                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onOpenReceipt(d)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Download Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-4 text-center">No donation history recorded.</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
