import React, { useState, useMemo } from 'react';
import CampaignCard from './CampaignCard';
import { Search, SlidersHorizontal, AlertCircle, HeartCrack } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Clean Water',
  'Medical & Healthcare',
  'Education & Youth',
  'Hunger & Relief',
  'Disaster Relief',
  'Environment'
];

export default function CampaignList({ campaigns, onSelectCampaign, onDonateCampaign, isLoading }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const filteredCampaigns = useMemo(() => {
    let list = [...(campaigns || [])];

    if (selectedCategory !== 'All') {
      list = list.filter(c => c.category === selectedCategory);
    }

    if (selectedUrgency !== 'All') {
      list = list.filter(c => c.urgency?.toLowerCase() === selectedUrgency.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.title?.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.organizer?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'progress') {
        const pctA = (a.raised_amount / a.target_amount) || 0;
        const pctB = (b.raised_amount / b.target_amount) || 0;
        return pctB - pctA;
      }
      if (sortBy === 'urgent') {
        const order = { critical: 3, high: 2, normal: 1 };
        return (order[b.urgency] || 1) - (order[a.urgency] || 1);
      }
      if (sortBy === 'target') {
        return b.target_amount - a.target_amount;
      }
      if (b.featured !== a.featured) return (b.featured || 0) - (a.featured || 0);
      return (b.raised_amount / b.target_amount) - (a.raised_amount / a.target_amount);
    });

    return list;
  }, [campaigns, selectedCategory, selectedUrgency, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6" id="campaigns-section">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Active Humanitarian Initiatives
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Select a verified program to fund direct relief equipment and community supplies.
          </p>
        </div>

        {/* Clean Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, causes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 shadow-2xs"
          />
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-y border-slate-200 py-3">
        
        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex items-center gap-2 text-xs">
          
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="All">All Priorities</option>
            <option value="critical">Critical Need</option>
            <option value="high">High Priority</option>
            <option value="normal">Ongoing</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="featured">Featured First</option>
            <option value="urgent">Most Urgent</option>
            <option value="progress">Highest Funded</option>
            <option value="target">Goal Target</option>
          </select>

        </div>

      </div>

      {/* Campaign Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onSelect={onSelectCampaign}
              onDonate={onDonateCampaign}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-2">
          <HeartCrack className="w-6 h-6 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No campaigns found</h3>
          <p className="text-xs text-slate-500">Try changing your search terms or category filter.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSelectedUrgency('All'); setSearchQuery(''); }}
            className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
}
