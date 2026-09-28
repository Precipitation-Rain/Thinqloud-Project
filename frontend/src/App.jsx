import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CampaignList from './components/CampaignList';
import CampaignDetailModal from './components/CampaignDetailModal';
import DonationModal from './components/DonationModal';
import ReceiptModal from './components/ReceiptModal';
import UtilizationTracker from './components/UtilizationTracker';
import DonorPortal from './components/DonorPortal';
import DonorCommunication from './components/DonorCommunication';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import Footer from './components/Footer';
import { fetchStats, fetchCampaigns, resetDatabase } from './api';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kindbridge_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('kindbridge_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'admin') return 'admin';
        return 'campaigns';
      }
    } catch (e) {}
    // If not logged in, default view is auth
    return 'auth';
  });

  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  
  // Modals State
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [selectedDonateCampaign, setSelectedDonateCampaign] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailCampaignId, setSelectedDetailCampaignId] = useState(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoadingCampaigns(true);
    try {
      const [sData, cData] = await Promise.all([
        fetchStats(),
        fetchCampaigns()
      ]);
      setStats(sData);
      setCampaigns(cData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('kindbridge_user', JSON.stringify(userData));
    setAuthPromptMessage('');
    showToast(`Welcome back, ${userData.name}!`);

    if (userData.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('campaigns');
    }
    loadInitialData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kindbridge_user');
    showToast('Signed out successfully.');
    setActiveTab('auth');
  };

  // Enforce donation protection: Only authenticated users can donate!
  const handleOpenDonate = (campaign = null) => {
    if (!currentUser) {
      setAuthPromptMessage('Please sign in or create an account to make a secure tax-deductible donation.');
      setActiveTab('auth');
      return;
    }
    setSelectedDonateCampaign(campaign);
    setIsDonateOpen(true);
  };

  const handleOpenDetail = (campaign) => {
    setSelectedDetailCampaignId(campaign.id);
    setIsDetailOpen(true);
  };

  const handleDonationSuccess = (donationResult) => {
    showToast(`Thank you! Your donation of $${donationResult.amount} has been processed.`);
    loadInitialData();
    // Open the official receipt immediately
    setReceiptData(donationResult);
    setIsReceiptOpen(true);

    // If logged in donor, update donor profile locally as well
    if (currentUser && currentUser.role === 'donor') {
      const updatedTotal = (currentUser.donorProfile?.total_donated || 0) + donationResult.total_amount;
      const updatedCount = (currentUser.donorProfile?.donations_count || 0) + 1;
      let newTier = 'Bronze';
      let newBadge = 'Supporter';
      if (updatedTotal >= 5000) { newTier = 'Platinum'; newBadge = 'Philanthropist Hero'; }
      else if (updatedTotal >= 1500) { newTier = 'Gold'; newBadge = 'Guardian Pillar'; }
      else if (updatedTotal >= 500) { newTier = 'Silver'; newBadge = 'Community Sustainer'; }

      const updatedUser = {
        ...currentUser,
        donorProfile: {
          ...currentUser.donorProfile,
          total_donated: updatedTotal,
          donations_count: updatedCount,
          tier: newTier,
          badge: newBadge
        }
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('kindbridge_user', JSON.stringify(updatedUser));
    }
  };

  const handleOpenReceiptFromPortal = (donationItem) => {
    setReceiptData(donationItem);
    setIsReceiptOpen(true);
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset the database to default pristine demo state with initial sample campaigns and donors?')) return;
    setIsResetting(true);
    try {
      await resetDatabase();
      showToast('Database reset and seeded with fresh sample data!');
      await loadInitialData();
    } catch (err) {
      console.error('Error resetting demo database:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 font-sans selection:bg-emerald-800 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-slate-900 text-white shadow-lg text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDonate={handleOpenDonate}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        currentUser={currentUser}
        onOpenAuth={(role, mode) => {
          setAuthPromptMessage('');
          setActiveTab('auth');
        }}
        onLogout={handleLogout}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        
        {/* 1. Default Auth Page when not logged in or on 'auth' tab */}
        {activeTab === 'auth' && (
          <AuthPage
            initialRole="donor"
            initialMode="login"
            onAuthSuccess={handleAuthSuccess}
            onExploreAsGuest={() => {
              setAuthPromptMessage('');
              setActiveTab('campaigns');
            }}
            promptMessage={authPromptMessage}
          />
        )}

        {/* 2. Main Causes View (Seen by Donor & Guests) */}
        {activeTab === 'campaigns' && (
          <div>
            <Hero
              stats={stats}
              onOpenDonate={handleOpenDonate}
              onExploreClick={() => {
                const el = document.getElementById('campaigns-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <CampaignList
              campaigns={campaigns}
              onSelectCampaign={handleOpenDetail}
              onDonateCampaign={handleOpenDonate}
              isLoading={isLoadingCampaigns}
            />
          </div>
        )}

        {/* 3. Transparency & Fund Utilization Ledger */}
        {activeTab === 'transparency' && (
          <UtilizationTracker
            campaigns={campaigns}
          />
        )}

        {/* 4. Donor Impact & Tax Receipts Portal */}
        {activeTab === 'donor-portal' && (
          <DonorPortal
            onOpenReceipt={handleOpenReceiptFromPortal}
            currentUser={currentUser}
            onOpenAuth={() => setActiveTab('auth')}
          />
        )}

        {/* 5. Donor Communication Desk */}
        {activeTab === 'community' && (
          <DonorCommunication
            campaigns={campaigns}
          />
        )}

        {/* 6. Admin Portal (Protected: Only accessible by logged-in Admin) */}
        {activeTab === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard
              onRefreshData={loadInitialData}
            />
          ) : (
            <div className="py-6">
              <AuthPage
                initialRole="admin"
                initialMode="login"
                onAuthSuccess={handleAuthSuccess}
                onExploreAsGuest={() => setActiveTab('campaigns')}
                promptMessage="Please log in with administrator credentials (user / admin@123) to access the NGO Console."
              />
            </div>
          )
        )}

      </main>

      {/* Global Footer */}
      <Footer
        onOpenDonate={handleOpenDonate}
        setActiveTab={setActiveTab}
      />

      {/* 1. Global Donation Modal (Authenticated donors only) */}
      <DonationModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        campaign={selectedDonateCampaign}
        campaigns={campaigns}
        onDonationSuccess={handleDonationSuccess}
        currentUser={currentUser}
      />

      {/* 2. Global Campaign Detail Modal */}
      <CampaignDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        campaignId={selectedDetailCampaignId}
        onDonateClick={handleOpenDonate}
      />

      {/* 3. Global Official Receipt / 80G Certificate Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={receiptData}
      />

    </div>
  );
}
