import React, { useState } from 'react';
import { ShieldCheck, Heart, User, Lock, Mail, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginUser, registerUser } from '../api';

export default function AuthPage({ 
  initialRole = 'donor', 
  initialMode = 'login', 
  onAuthSuccess, 
  onExploreAsGuest,
  promptMessage = ''
}) {
  const [role, setRole] = useState(initialRole); // 'donor' or 'admin'
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  
  // Form fields
  const [identifier, setIdentifier] = useState(role === 'admin' ? 'user' : ''); // username or email
  const [password, setPassword] = useState(role === 'admin' ? 'admin@123' : '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg('');
    setSuccessMsg('');
    if (newRole === 'admin') {
      setMode('login'); // Admin is login only with pre-set credentials
      setIdentifier('user');
      setPassword('admin@123');
    } else {
      setIdentifier('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser({ 
          email: identifier.trim(), 
          password: password.trim(), 
          role 
        });
        setSuccessMsg(res.message);
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 300);
      } else {
        // Registering a new Donor Account
        const res = await registerUser({
          name: name.trim(),
          email: identifier.trim().toLowerCase(),
          password: password.trim(),
          role: 'donor',
          phone: phone.trim()
        });
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 400);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Top Two Role Tabs */}
        <div className="bg-slate-900 p-6 text-white text-center space-y-4">
          
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Kind<span className="text-emerald-500">Bridge</span>
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {role === 'admin' 
              ? 'NGO Operations & Transaction Management Portal' 
              : 'Charity Giving & Verified Tax Exemption Platform'}
          </p>

          {/* Tab Switcher: Donor vs Admin */}
          <div className="grid grid-cols-2 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleChange('donor')}
              className={`py-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'donor'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Donor Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`py-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-slate-900 text-white font-bold border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>

        </div>

        {/* Body Form */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {promptMessage && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              {promptMessage}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Admin Info Banner */}
          {role === 'admin' && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                <span>Pre-Configured Administrator Credentials</span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono">
                Username: <strong>user</strong> • Password: <strong>admin@123</strong>
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {mode === 'register' && role === 'donor' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johnathan Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {role === 'admin' ? 'Admin Username or Email *' : mode === 'register' ? 'Email Address *' : 'Email or Username *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={role === 'admin' ? 'user' : 'donor@example.com'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {mode === 'register' && role === 'donor' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-white font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 mt-2 ${
                role === 'admin' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {isLoading 
                ? 'Authenticating...' 
                : mode === 'login' 
                  ? `Sign In as ${role === 'admin' ? 'Administrator' : 'Donor'}` 
                  : 'Create Donor Account & Continue'}
            </button>
          </form>

          {/* Bottom Switcher: Create Account Option for Donors */}
          {role === 'donor' && (
            <div className="text-center pt-3 border-t border-slate-200 text-xs text-slate-600">
              {mode === 'login' ? (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setErrorMsg(''); }}
                    className="font-bold text-emerald-800 hover:underline cursor-pointer ml-1"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already have a donor account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg(''); }}
                    className="font-bold text-emerald-800 hover:underline cursor-pointer ml-1"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          )}

          {/* Quick Demo Credentials for Donors */}
          {role === 'donor' && mode === 'login' && (
            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Quick Sample Donor:</span>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('sophia.reynolds@example.com');
                  setPassword('donor123');
                }}
                className="text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md border border-slate-200 cursor-pointer"
              >
                Autofill Sophia (Platinum Donor)
              </button>
            </div>
          )}

          {/* Guest explorer link */}
          {onExploreAsGuest && (
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onExploreAsGuest}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Explore Active Causes as Guest
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
