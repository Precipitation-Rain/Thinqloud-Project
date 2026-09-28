import React from 'react';
import { Users, ShieldCheck, MapPin } from 'lucide-react';

export default function CampaignCard({ campaign, onSelect, onDonate }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
            Critical Need
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
            High Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            Ongoing
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-200">
      
      {/* Campaign Image */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={campaign.image_url}
          alt={campaign.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded bg-white/95 text-slate-800 text-[11px] font-bold shadow-xs">
            {campaign.category}
          </span>
          {getUrgencyBadge(campaign.urgency)}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{campaign.organizer || 'Verified Partner'}</span>
            {campaign.location && (
              <>
                <span>•</span>
                <span className="truncate">{campaign.location}</span>
              </>
            )}
          </div>

          <h3 
            onClick={() => onSelect(campaign)}
            className="text-base font-bold text-slate-900 hover:text-emerald-800 transition-colors cursor-pointer line-clamp-1"
          >
            {campaign.title}
          </h3>

          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {campaign.subtitle || campaign.description}
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-bold text-slate-900">
              {formatCurrency(campaign.raised_amount)}
              <span className="text-slate-500 font-normal text-[11px] ml-1">of {formatCurrency(campaign.target_amount)}</span>
            </span>
            <span className="font-bold text-emerald-800 text-xs">
              {campaign.percentage || Math.round((campaign.raised_amount / campaign.target_amount) * 100)}%
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-700 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, campaign.percentage || Math.round((campaign.raised_amount / campaign.target_amount) * 100))}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              {campaign.donor_count || 0} donors
            </span>
            {campaign.beneficiaries_count > 0 && (
              <span>~{campaign.beneficiaries_count} helped</span>
            )}
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => onSelect(campaign)}
            className="py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer text-center"
          >
            Details
          </button>

          <button
            onClick={() => onDonate(campaign)}
            className="py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
          >
            Donate
          </button>
        </div>

      </div>

    </div>
  );
}
