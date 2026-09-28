import React, { useState } from 'react';
import { Heart, ShieldCheck, Mail, Lock, FileText } from 'lucide-react';

export default function Footer({ onOpenDonate, setActiveTab }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-700 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="text-base font-bold text-white">
                KindBridge
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent, accountable giving network. 100% of donations are audited and tied to real field invoices.
            </p>

            <p className="text-[11px] text-slate-500 font-mono">
              NGO Reg: 80G-501C3-99418A
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => setActiveTab('campaigns')} className="hover:text-white transition-colors">
                  Explore Causes
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('transparency')} className="hover:text-white transition-colors">
                  Fund Utilization Ledger
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('donor-portal')} className="hover:text-white transition-colors">
                  My Impact & Receipts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('community')} className="hover:text-white transition-colors">
                  Donor Support Desk
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-white transition-colors">
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Trust & Governance</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Audited Program Expenses</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Secured</span>
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tax Exemption 80G / 501(c)(3)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Monthly Field Report</h4>
            <p className="text-xs text-slate-400">
              Receive audited transparency statements and field progress reports.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-1.5 pt-1">
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© 2026 KindBridge Global Charitable Trust.</p>
          <p>Full-Stack Charity & Donation Management System</p>
        </div>

      </div>
    </footer>
  );
}
