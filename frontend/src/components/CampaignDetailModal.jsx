import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { fetchCampaignById } from '../api';

export default function CampaignDetailModal({ isOpen, onClose, campaignId, onDonateClick }) {
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('story');

  useEffect(() => {
    if (isOpen && campaignId) {
      loadCampaign();
    }
  }, [isOpen, campaignId]);

  const loadCampaign = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCampaignById(campaignId);
      setCampaign(data);
    } catch (err) {
      console.error('Error fetching campaign detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6 animate-in fade-in duration-150 flex flex-col max-h-[85vh]">
        
        {/* Header Hero */}
        {campaign && (
          <div className="relative h-56 w-full bg-slate-900 shrink-0">
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-4 left-5 right-5 text-white space-y-1">
              <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[11px] font-bold">
                {campaign.category}
              </span>
              <h1 className="text-xl font-bold tracking-tight">
                {campaign.title}
              </h1>
            </div>
          </div>
        )}

        {/* Body Content */}
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading campaign information...</div>
        ) : campaign ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Funding Progress Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(campaign.raised_amount)}
                    <span className="text-slate-500 font-normal text-xs ml-1">of {formatCurrency(campaign.target_amount)} goal</span>
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {campaign.percentage}% Funded
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-700 rounded-full"
                    style={{ width: `${campaign.percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <strong>{campaign.donor_count}</strong> Backers
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Deadline: <strong>{campaign.deadline}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onDonateClick(campaign);
                }}
                className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Donate to this Initiative
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-xs">
              {[
                { id: 'story', label: 'Story & Objectives' },
                { id: 'utilization', label: `Audited Expenses (${campaign.utilizations?.length || 0})` },
                { id: 'updates', label: `Milestones (${campaign.updates?.length || 0})` },
                { id: 'donors', label: `Backers (${campaign.donations?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Story */}
            {activeTab === 'story' && (
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p className="whitespace-pre-line leading-relaxed text-slate-600">{campaign.description}</p>
                
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">Organizer & Operations</span>
                  <p>Coordinated by {campaign.organizer} in {campaign.location || 'Global Field Operations'}.</p>
                </div>
              </div>
            )}

            {/* Tab: Utilization */}
            {activeTab === 'utilization' && (
              <div className="space-y-3 text-xs">
                {campaign.utilizations && campaign.utilizations.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {campaign.utilizations.map((u) => (
                      <div key={u.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-900 block">{u.expense_title}</span>
                          <span className="text-[11px] text-slate-500 font-mono">Ref: {u.invoice_ref} • {u.expense_date}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(u.amount_spent)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 py-4 text-center">No expense entries logged yet.</p>
                )}
              </div>
            )}

            {/* Tab: Updates */}
            {activeTab === 'updates' && (
              <div className="space-y-3 text-xs">
                {campaign.updates && campaign.updates.length > 0 ? (
                  campaign.updates.map((up) => (
                    <div key={up.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{up.title}</span>
                        <span className="text-[10px] text-slate-400">{new Date(up.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600">{up.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 py-4 text-center">No field updates posted yet.</p>
                )}
              </div>
            )}

            {/* Tab: Donors */}
            {activeTab === 'donors' && (
              <div className="space-y-2 text-xs">
                {campaign.donations && campaign.donations.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {campaign.donations.map((d) => (
                      <div key={d.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{d.donor_name}</span>
                          {d.dedication && <span className="text-[10px] text-slate-400 italic">"{d.dedication}"</span>}
                        </div>
                        <span className="font-mono font-bold text-emerald-800">${d.amount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 py-4 text-center">No contributions yet.</p>
                )}
              </div>
            )}

          </div>
        ) : null}

      </div>
    </div>
  );
}
