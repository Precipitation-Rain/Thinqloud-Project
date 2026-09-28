import React from 'react';
import { ShieldCheck, HeartHandshake, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero({ stats, onOpenDonate, onExploreClick }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <section className="bg-slate-50/60 border-b border-slate-200 pt-12 pb-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Header Text */}
        <div className="max-w-3xl space-y-4">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Audited Non-Profit • 100% Tax-Deductible Receipts</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Give with confidence. Track every dollar to the front lines.
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            KindBridge connects donors directly to vetted humanitarian initiatives. Every donation is paired with itemized field invoices, live milestone reports, and instant tax exemption certificates.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenDonate(null)}
              className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Make a Donation
            </button>
            
            <button
              onClick={onExploreClick}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
            >
              Explore Active Causes
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Instant 80G / 501(c)(3) Receipts
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Audited Public Ledger
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Direct Field Reports
            </span>
          </div>

        </div>

        {/* Clean 4-Column Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Funds Raised</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(stats?.totalRaised || 181950)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              100% disbursed to programs
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Verified Donors</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {stats?.totalDonors || 1420}+
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Community contributors
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Lives Impacted</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {(stats?.totalBeneficiaries || 24700).toLocaleString()}+
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Documented beneficiaries
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Program Utilization</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {stats?.utilizationRate || 92}%
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Audited by GlobalTrust ESG
            </p>
          </div>

        </div>

        {/* Clean Live Feed Ticker */}
        {stats?.recentDonations && stats.recentDonations.length > 0 && (
          <div className="mt-6 p-3 rounded-lg bg-white border border-slate-200 flex items-center gap-3 text-xs text-slate-600 overflow-hidden">
            <div className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider shrink-0">
              Live Feed
            </div>
            <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none text-slate-600">
              {stats.recentDonations.map((d) => (
                <div key={d.id} className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">{d.donor_name}</span>
                  <span className="text-slate-400">donated</span>
                  <span className="font-bold text-emerald-700">${d.amount}</span>
                  <span className="text-slate-500 text-[11px]">to {d.campaign_title}</span>
                  <span className="text-slate-300">•</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
