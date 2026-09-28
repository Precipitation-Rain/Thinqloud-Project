import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search } from 'lucide-react';
import { fetchUtilizations } from '../api';

export default function UtilizationTracker({ campaigns }) {
  const [utilizations, setUtilizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCampaignId, setSelectedCampaignId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedCampaignId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUtilizations({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        campaign_id: selectedCampaignId !== 'All' ? selectedCampaignId : undefined
      });
      setUtilizations(data.items || []);
      setCategories(data.categoryBreakdown || []);
    } catch (err) {
      console.error('Error fetching utilizations:', err);
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

  const totalSpent = (utilizations || []).reduce((sum, u) => sum + u.amount_spent, 0);

  const filteredItems = (utilizations || []).filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.expense_title?.toLowerCase().includes(q) ||
      u.campaign_title?.toLowerCase().includes(q) ||
      u.category?.toLowerCase().includes(q) ||
      u.invoice_ref?.toLowerCase().includes(q) ||
      u.verified_by?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Audited Expense Transparency</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Fund Utilization & Expenditure Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Every dollar disbursed is matched with supplier invoices, field logs, and third-party audit verification.
        </p>
      </div>

      {/* Program Categories */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Disbursement Breakdown by Program
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat, idx) => {
            const pct = totalSpent > 0 ? Math.round((cat.total_spent / totalSpent) * 100) : 20;
            return (
              <div key={idx} className="p-4 rounded-lg bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cat.category}</span>
                  <span className="font-bold text-emerald-800">{pct}%</span>
                </div>

                <div className="text-lg font-bold text-slate-900 font-mono">
                  {formatCurrency(cat.total_spent)}
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-700 rounded-full"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>{cat.items_count} verified receipts</span>
                  <span className="text-emerald-700 font-semibold">Invoiced</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Public Itemized Expense Ledger</h3>
            <p className="text-xs text-slate-500">Searchable by invoice ref, program, or certifying body.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-300 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="All">All Campaigns</option>
              {(campaigns || []).map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-slate-400 text-xs">Loading ledger records...</div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="p-3">Date & Ref</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Initiative</th>
                  <th className="p-3">Audit Body</th>
                  <th className="p-3 text-right">Disbursed (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono whitespace-nowrap">
                      <span className="font-bold text-slate-800 block">{item.expense_date}</span>
                      <span className="text-[10px] text-slate-400">{item.invoice_ref}</span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <span className="font-bold text-slate-900 block">{item.expense_title}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.proof_description}</p>
                    </td>

                    <td className="p-3 font-medium text-slate-700">
                      {item.campaign_title || 'General Relief'}
                    </td>

                    <td className="p-3 font-medium text-emerald-800">
                      {item.verified_by}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      {formatCurrency(item.amount_spent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">No records found.</div>
        )}

      </div>

    </div>
  );
}
