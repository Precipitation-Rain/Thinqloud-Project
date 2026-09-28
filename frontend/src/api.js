const API_BASE = '/api';

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function fetchCampaigns(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.urgency && params.urgency !== 'All') query.append('urgency', params.urgency);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/campaigns?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  return res.json();
}

export async function fetchCampaignById(id) {
  const res = await fetch(`${API_BASE}/campaigns/${id}`);
  if (!res.ok) throw new Error('Failed to fetch campaign details');
  return res.json();
}

export async function createCampaign(data) {
  const res = await fetch(`${API_BASE}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create campaign');
  }
  return res.json();
}

export async function updateCampaign(id, data) {
  const res = await fetch(`${API_BASE}/campaigns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update campaign');
  return res.json();
}

export async function deleteCampaign(id) {
  const res = await fetch(`${API_BASE}/campaigns/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete campaign');
  return res.json();
}

export async function processDonation(donationData) {
  const res = await fetch(`${API_BASE}/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donationData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to process donation');
  }
  return res.json();
}

export async function fetchDonations(params = {}) {
  const query = new URLSearchParams();
  if (params.campaign_id) query.append('campaign_id', params.campaign_id);
  if (params.email) query.append('email', params.email);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/donations?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch donations');
  return res.json();
}

export async function fetchReceipt(idOrReceiptNumber) {
  const res = await fetch(`${API_BASE}/donations/${idOrReceiptNumber}/receipt`);
  if (!res.ok) throw new Error('Failed to fetch receipt');
  return res.json();
}

export async function fetchDonors(params = {}) {
  const query = new URLSearchParams();
  if (params.tier && params.tier !== 'All') query.append('tier', params.tier);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/donors?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch donors');
  return res.json();
}

export async function lookupDonor(email) {
  const res = await fetch(`${API_BASE}/donors/lookup?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Donor not found');
  }
  return res.json();
}

export async function fetchUtilizations(params = {}) {
  const query = new URLSearchParams();
  if (params.campaign_id) query.append('campaign_id', params.campaign_id);
  if (params.category && params.category !== 'All') query.append('category', params.category);

  const res = await fetch(`${API_BASE}/utilizations?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch fund utilizations');
  return res.json();
}

export async function addUtilization(data) {
  const res = await fetch(`${API_BASE}/utilizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to record expense');
  }
  return res.json();
}

export async function fetchCommunications(params = {}) {
  const query = new URLSearchParams();
  if (params.campaign_id) query.append('campaign_id', params.campaign_id);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.type && params.type !== 'All') query.append('type', params.type);

  const res = await fetch(`${API_BASE}/communications?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch communications');
  return res.json();
}

export async function sendCommunication(data) {
  const res = await fetch(`${API_BASE}/communications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send message');
  }
  return res.json();
}

export async function replyCommunication(id, reply) {
  const res = await fetch(`${API_BASE}/communications/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply })
  });
  if (!res.ok) throw new Error('Failed to reply to message');
  return res.json();
}

export async function fetchCampaignUpdates(campaignId) {
  const query = campaignId ? `?campaign_id=${campaignId}` : '';
  const res = await fetch(`${API_BASE}/campaign-updates${query}`);
  if (!res.ok) throw new Error('Failed to fetch campaign updates');
  return res.json();
}

export async function postCampaignUpdate(data) {
  const res = await fetch(`${API_BASE}/campaign-updates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add campaign update');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/seed/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}
