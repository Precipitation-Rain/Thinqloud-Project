import React from 'react';
import { Heart, RefreshCw, LogOut, User, ShieldCheck } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenDonate, 
  onResetDemo, 
  isResetting,
  currentUser,
  onOpenAuth,
  onLogout 
}) {
  
  // Navigation tabs based on user role
  const getNavItems = () => {
    if (currentUser?.role === 'admin') {
      return [
        { id: 'admin', label: 'Admin Console' },
        { id: 'campaigns', label: 'Explore Causes' },
        { id: 'transparency', label: 'Fund Utilization & Ledger' },
        { id: 'community', label: 'Donor Messages Desk' }
      ];
    } else if (currentUser?.role === 'donor') {
      return [
        { id: 'campaigns', label: 'Explore Causes' },
        { id: 'transparency', label: 'Fund Utilization' },
        { id: 'donor-portal', label: 'My Impact & Receipts' },
        { id: 'community', label: 'Donor Connect' }
      ];
    } else {
      // Guest view
      return [
        { id: 'campaigns', label: 'Explore Causes' },
        { id: 'transparency', label: 'Fund Utilization & Ledger' },
        { id: 'donor-portal', label: 'My Impact (Lookup)' },
        { id: 'community', label: 'Donor Connect' }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab(currentUser?.role === 'admin' ? 'admin' : 'campaigns')}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Heart className="w-4 h-4 fill-white stroke-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Kind<span className="text-emerald-700">Bridge</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-medium text-slate-400 border-l border-slate-200 pl-2">
                {currentUser?.role === 'admin' ? 'Admin Portal' : 'Nonprofit Giving'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Auth Area */}
          <div className="flex items-center gap-2.5">
            
            {/* Reset Demo Data Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reset sample data for presentation"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin text-emerald-700' : ''}`} />
              <span>Reset</span>
            </button>

            {/* Authenticated User Status vs Login Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  
                  <div className="text-left hidden sm:block">
                    <span className="font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {currentUser.role === 'admin' ? 'NGO Administrator' : `${currentUser.donorProfile?.tier || 'Bronze'} Donor`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('donor', 'login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  onClick={() => onOpenAuth('admin', 'login')}
                  className="hidden sm:inline-flex px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Admin
                </button>
              </div>
            )}

            {/* Donate CTA */}
            <button
              onClick={() => onOpenDonate(null)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Donate
            </button>

          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                  isActive ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                {item.label.split(' ')[0]}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
