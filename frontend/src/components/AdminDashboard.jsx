import React, { useState, useEffect } from 'react';
import { 
  Plus, DollarSign, Users, PieChart, MessageSquare, 
  Sparkles, CheckCircle2, AlertCircle, Trash2, Download, Send 
} from 'lucide-react';
import { 
  fetchCampaigns, createCampaign, deleteCampaign, 
  fetchDonations, fetchDonors, fetchUtilizations, addUtilization, 
  fetchCommunications, replyCommunication, postCampaignUpdate 
} from '../api';

export default function AdminDashboard({ onRefreshData }) {
  const [adminTab, setAdminTab] = useState('campaigns');
  
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [utilizations, setUtilizations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', msg: '' });

  // Forms States
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    subtitle: '',
    category: 'Clean Water',
    target_amount: '',
    description: '',
    urgency: 'normal',
    organizer: 'KindBridge Relief Org',
    location: '',
    beneficiaries_count: 500,
    deadline: '2026-12-31',
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80'
  });

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    campaign_id: '',
    expense_title: '',
    category: 'Direct Field Equipment',
    amount_spent: '',
    proof_description: '',
    expense_date: new Date().toISOString().split('T')[0],
    verified_by: 'Global ESG Audits Board',
    invoice_ref: ''
  });

  const [replyingMessageId, setReplyingMessageId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    campaign_id: '',
    title: '',
    content: '',
    milestone_tag: 'Progress Update',
    author: 'Field Operations Lead'
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [cData, dData, dnData, uData, mData] = await Promise.all([
        fetchCampaigns(),
        fetchDonations(),
        fetchDonors(),
        fetchUtilizations(),
        fetchCommunications()
      ]);
      setCampaigns(cData || []);
      setDonations(dData || []);
      setDonors(dnData || []);
      setUtilizations(uData.items || []);
      setMessages(mData || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
      showAlert('error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      await createCampaign(newCampaign);
      showAlert('success', 'New campaign published successfully.');
      setShowAddCampaignModal(false);
      setNewCampaign({
        title: '',
        subtitle: '',
        category: 'Clean Water',
        target_amount: '',
        description: '',
        urgency: 'normal',
        organizer: 'KindBridge Relief Org',
        location: '',
        beneficiaries_count: 500,
        deadline: '2026-12-31',
        image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80'
      });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to create campaign');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await deleteCampaign(id);
      showAlert('success', 'Campaign removed');
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showAlert('error', 'Failed to delete campaign');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.campaign_id || !newExpense.expense_title || !newExpense.amount_spent) {
      showAlert('error', 'Please fill in required fields');
      return;
    }

    try {
      await addUtilization({
        ...newExpense,
        campaign_id: parseInt(newExpense.campaign_id),
        amount_spent: parseFloat(newExpense.amount_spent)
      });
      showAlert('success', 'Expense recorded into audited public ledger.');
      setShowAddExpenseModal(false);
      setNewExpense({
        campaign_id: '',
        expense_title: '',
        category: 'Direct Field Equipment',
        amount_spent: '',
        proof_description: '',
        expense_date: new Date().toISOString().split('T')[0],
        verified_by: 'Global ESG Audits Board',
        invoice_ref: ''
      });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to record expense');
    }
  };

  const handleReplyMessage = async (id) => {
    if (!replyText.trim()) return;
    try {
      await replyCommunication(id, replyText.trim());
      showAlert('success', 'Response recorded.');
      setReplyingMessageId(null);
      setReplyText('');
      loadAllAdminData();
    } catch (err) {
      showAlert('error', 'Failed to send reply');
    }
  };

  const handlePostMilestone = async (e) => {
    e.preventDefault();
    try {
      await postCampaignUpdate({
        ...newMilestone,
        campaign_id: parseInt(newMilestone.campaign_id)
      });
      showAlert('success', 'Milestone update posted.');
      setShowMilestoneModal(false);
      setNewMilestone({
        campaign_id: '',
        title: '',
        content: '',
        milestone_tag: 'Progress Update',
        author: 'Field Operations Lead'
      });
      loadAllAdminData();
    } catch (err) {
      showAlert('error', 'Failed to post milestone');
    }
  };

  const exportDonationsCSV = () => {
    const headers = ['ID,Date,Donor Name,Email,Amount,Tip,Total,Payment Method,Receipt Number,Transaction ID,Campaign'];
    const rows = donations.map(d => 
      `"${d.id}","${d.created_at}","${d.donor_name}","${d.donor_email}","${d.amount}","${d.tip_amount}","${d.total_amount}","${d.payment_method}","${d.receipt_number}","${d.transaction_id}","${d.campaign_title}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kindbridge_donations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      
      {/* Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Non-Profit Administration Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage initiatives, download transaction records, and post audited expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddCampaignModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </button>

          <button
            onClick={() => setShowMilestoneModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
          >
            Post Milestone
          </button>
        </div>
      </div>

      {alert.msg && (
        <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertCircle className="w-4 h-4 text-rose-700" />}
          <span>{alert.msg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 text-xs">
        {[
          { id: 'campaigns', label: `Campaigns (${campaigns.length})` },
          { id: 'donations', label: `Donations Ledger (${donations.length})` },
          { id: 'expenses', label: `Audited Expenses (${utilizations.length})` },
          { id: 'donors', label: `Donors (${donors.length})` },
          { id: 'messages', label: `Communications (${messages.length})` },
        ].map((tab) => {
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Campaigns */}
      {adminTab === 'campaigns' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Campaign Initiatives</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Target</th>
                  <th className="p-2.5">Raised</th>
                  <th className="p-2.5">Funded</th>
                  <th className="p-2.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{c.title}</td>
                    <td className="p-2.5 text-slate-600">{c.category}</td>
                    <td className="p-2.5 font-mono">{formatCurrency(c.target_amount)}</td>
                    <td className="p-2.5 font-mono">{formatCurrency(c.raised_amount)}</td>
                    <td className="p-2.5">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {Math.round((c.raised_amount / c.target_amount) * 100)}%
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleDeleteCampaign(c.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Donations Ledger */}
      {adminTab === 'donations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Donation Transactions</h3>
            <button
              onClick={exportDonationsCSV}
              className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Export</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="p-2.5">Receipt #</th>
                  <th className="p-2.5">Donor Name</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Payment</th>
                  <th className="p-2.5 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-700">{d.receipt_number}</td>
                    <td className="p-2.5 font-medium text-slate-900">{d.donor_name}</td>
                    <td className="p-2.5 font-mono text-slate-500">{d.donor_email}</td>
                    <td className="p-2.5 font-mono text-slate-600">{d.payment_method}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-800">${d.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audited Expenses */}
      {adminTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Documented Expenses</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="p-2.5">Date & Invoice</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Auditor</th>
                  <th className="p-2.5 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {utilizations.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono">{u.expense_date}</td>
                    <td className="p-2.5 font-medium text-slate-900">{u.expense_title}</td>
                    <td className="p-2.5 text-slate-600">{u.category}</td>
                    <td className="p-2.5 text-emerald-800">{u.verified_by}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(u.amount_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Donors */}
      {adminTab === 'donors' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Donor Directory</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Tier</th>
                  <th className="p-2.5">Donations</th>
                  <th className="p-2.5 text-right">Lifetime Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donors.map((dn) => (
                  <tr key={dn.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{dn.name}</td>
                    <td className="p-2.5 font-mono text-slate-600">{dn.email}</td>
                    <td className="p-2.5">{dn.tier}</td>
                    <td className="p-2.5">{dn.donations_count}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-800">{formatCurrency(dn.total_donated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Communications */}
      {adminTab === 'messages' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Donor Communications</h3>

          <div className="space-y-3 text-xs">
            {messages.map((m) => (
              <div key={m.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{m.subject}</span>
                  <span className="text-[11px] text-slate-500">{m.sender_name} ({m.sender_email})</span>
                </div>
                <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-200">"{m.content}"</p>

                {m.reply ? (
                  <p className="text-emerald-900 bg-emerald-50 p-2 rounded text-[11px]">
                    <strong>Reply:</strong> {m.reply}
                  </p>
                ) : (
                  <div>
                    {replyingMessageId === m.id ? (
                      <div className="space-y-1.5 pt-1">
                        <textarea
                          rows={2}
                          placeholder="Type response..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full p-2 rounded border border-slate-300 bg-white text-xs"
                        ></textarea>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReplyMessage(m.id)}
                            className="px-3 py-1 rounded bg-emerald-700 text-white text-xs font-bold"
                          >
                            Send
                          </button>
                          <button
                            onClick={() => setReplyingMessageId(null)}
                            className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setReplyingMessageId(m.id); setReplyText(''); }}
                        className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Reply to message
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Campaign */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-md w-full space-y-3">
            <h3 className="text-base font-bold text-slate-900">Add Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-medium mb-0.5">Title *</label>
                <input
                  type="text"
                  required
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-0.5">Category</label>
                  <select
                    value={newCampaign.category}
                    onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="Clean Water">Clean Water</option>
                    <option value="Medical & Healthcare">Medical & Healthcare</option>
                    <option value="Education & Youth">Education & Youth</option>
                    <option value="Hunger & Relief">Hunger & Relief</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                    <option value="Environment">Environment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-0.5">Target ($) *</label>
                  <input
                    type="number"
                    required
                    value={newCampaign.target_amount}
                    onChange={(e) => setNewCampaign({ ...newCampaign, target_amount: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-0.5">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-emerald-700 text-white font-bold"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Expense */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-md w-full space-y-3">
            <h3 className="text-base font-bold text-slate-900">Record Audited Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-medium mb-0.5">Initiative *</label>
                <select
                  required
                  value={newExpense.campaign_id}
                  onChange={(e) => setNewExpense({ ...newExpense, campaign_id: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="">Select Initiative</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-0.5">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={newExpense.expense_title}
                  onChange={(e) => setNewExpense({ ...newExpense, expense_title: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-0.5">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="Direct Field Equipment">Direct Field Equipment</option>
                    <option value="Medical Diagnostics">Medical Diagnostics</option>
                    <option value="Clean Water Infrastructure">Clean Water Infrastructure</option>
                    <option value="Educational Hardware">Educational Hardware</option>
                    <option value="Food & Nutrition">Food & Nutrition</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-0.5">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={newExpense.amount_spent}
                    onChange={(e) => setNewExpense({ ...newExpense, amount_spent: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-emerald-700 text-white font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Post Milestone */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl p-5 max-w-md w-full space-y-3">
            <h3 className="text-base font-bold text-slate-900">Post Campaign Milestone</h3>
            <form onSubmit={handlePostMilestone} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-medium mb-0.5">Campaign *</label>
                <select
                  required
                  value={newMilestone.campaign_id}
                  onChange={(e) => setNewMilestone({ ...newMilestone, campaign_id: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white"
                >
                  <option value="">Select Initiative</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-0.5">Headline *</label>
                <input
                  type="text"
                  required
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium mb-0.5">Details *</label>
                <textarea
                  required
                  rows={3}
                  value={newMilestone.content}
                  onChange={(e) => setNewMilestone({ ...newMilestone, content: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-emerald-700 text-white font-bold"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
