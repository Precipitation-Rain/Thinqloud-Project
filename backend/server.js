const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper for db queries using Promises
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// -------------------------------------------------------------
// 0. AUTHENTICATION (DONOR & ADMIN LOGIN / REGISTER)
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'donor', phone, organization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await dbGet(`SELECT * FROM users WHERE LOWER(email) = ?`, [cleanEmail]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'donor';
    const username = cleanEmail.split('@')[0];

    const result = await dbRun(`
      INSERT INTO users (name, email, username, password, role, phone, organization)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name.trim(), cleanEmail, username, password, assignedRole, phone || '', organization || '']);

    // If registered as donor, ensure a matching donor record exists in donors table
    if (assignedRole === 'donor') {
      const existingDonor = await dbGet(`SELECT * FROM donors WHERE LOWER(email) = ?`, [cleanEmail]);
      if (!existingDonor) {
        await dbRun(`
          INSERT INTO donors (name, email, phone, tier, total_donated, donations_count, badge)
          VALUES (?, ?, ?, 'Bronze', 0, 0, 'Supporter')
        `, [name.trim(), cleanEmail, phone || '']);
      }
    }

    const user = await dbGet(`SELECT id, name, email, username, role, phone, organization, created_at FROM users WHERE id = ?`, [result.lastID]);

    res.status(201).json({
      message: `Account created successfully! Welcome, ${user.name}.`,
      user: {
        ...user,
        donorProfile: { tier: 'Bronze', badge: 'Supporter', total_donated: 0, donations_count: 0 }
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    const cleanId = email.trim().toLowerCase();
    
    // Check by username OR email
    const user = await dbGet(`
      SELECT * FROM users 
      WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND password = ?
    `, [cleanId, cleanId, password]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    // Check role match if requested from specific login portal
    if (role && user.role !== role) {
      if (role === 'admin') {
        return res.status(403).json({ error: 'Access denied. This account does not have Admin privileges. Please switch to the Donor Login tab.' });
      } else {
        return res.status(403).json({ error: 'This is an Administrator account. Please switch to the Admin Login tab.' });
      }
    }

    // Attach donor stats if user is a donor
    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await dbGet(`SELECT * FROM donors WHERE LOWER(email) = ?`, [user.email.toLowerCase()]);
    }

    res.json({
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        donorProfile: donorProfile || { tier: 'Bronze', badge: 'Supporter', total_donated: 0, donations_count: 0 }
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// -------------------------------------------------------------
// 1. STATS / DASHBOARD OVERVIEW
// -------------------------------------------------------------
app.get('/api/stats', async (req, res) => {
  try {
    const totalRaisedRow = await dbGet(`SELECT SUM(total_amount) as total_raised, COUNT(*) as donation_count FROM donations WHERE payment_status = 'completed'`);
    const totalDonorsRow = await dbGet(`SELECT COUNT(*) as donor_count FROM donors`);
    const activeCampaignsRow = await dbGet(`SELECT COUNT(*) as campaign_count FROM campaigns WHERE status = 'active'`);
    const totalBeneficiariesRow = await dbGet(`SELECT SUM(beneficiaries_count) as total_beneficiaries FROM campaigns`);
    const totalUtilizedRow = await dbGet(`SELECT SUM(amount_spent) as total_spent FROM utilizations`);
    
    const categoryStats = await dbAll(`
      SELECT c.category, SUM(d.amount) as amount_raised, COUNT(d.id) as donations_count
      FROM campaigns c
      LEFT JOIN donations d ON c.id = d.campaign_id
      GROUP BY c.category
    `);

    const recentDonations = await dbAll(`
      SELECT d.id, d.donor_name, d.amount, d.created_at, d.payment_method, c.title as campaign_title, d.dedication
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      ORDER BY d.id DESC
      LIMIT 6
    `);

    const totalRaised = totalRaisedRow?.total_raised || 0;
    const totalSpent = totalUtilizedRow?.total_spent || 0;
    const utilizationRate = totalRaised > 0 ? Math.min(100, Math.round((totalSpent / totalRaised) * 100)) : 88;

    res.json({
      totalRaised,
      totalDonors: totalDonorsRow?.donor_count || 0,
      totalDonationsCount: totalRaisedRow?.donation_count || 0,
      activeCampaigns: activeCampaignsRow?.campaign_count || 0,
      totalBeneficiaries: totalBeneficiariesRow?.total_beneficiaries || 0,
      totalSpent,
      utilizationRate,
      categoryStats,
      recentDonations
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
});

// -------------------------------------------------------------
// 2. CAMPAIGNS API
// -------------------------------------------------------------
app.get('/api/campaigns', async (req, res) => {
  try {
    const { category, search, urgency, status } = req.query;
    let query = `SELECT * FROM campaigns WHERE 1=1`;
    const params = [];

    if (category && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (urgency && urgency !== 'All') {
      query += ` AND urgency = ?`;
      params.push(urgency);
    }
    if (status && status !== 'All') {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (title LIKE ? OR subtitle LIKE ? OR description LIKE ? OR organizer LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY featured DESC, (raised_amount / target_amount) DESC, id DESC`;

    const campaigns = await dbAll(query, params);
    
    const enriched = campaigns.map(c => ({
      ...c,
      percentage: Math.min(100, Math.round((c.raised_amount / c.target_amount) * 100)),
      remaining_amount: Math.max(0, c.target_amount - c.raised_amount)
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const campaign = await dbGet(`SELECT * FROM campaigns WHERE id = ?`, [req.params.id]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const updates = await dbAll(`SELECT * FROM campaign_updates WHERE campaign_id = ? ORDER BY id DESC`, [req.params.id]);
    
    const donations = await dbAll(`
      SELECT id, donor_name, amount, created_at, dedication, is_recurring
      FROM donations
      WHERE campaign_id = ?
      ORDER BY id DESC
      LIMIT 10
    `, [req.params.id]);

    const utilizations = await dbAll(`
      SELECT * FROM utilizations WHERE campaign_id = ? ORDER BY expense_date DESC
    `, [req.params.id]);

    const totalUtilized = utilizations.reduce((sum, u) => sum + u.amount_spent, 0);

    res.json({
      ...campaign,
      percentage: Math.min(100, Math.round((campaign.raised_amount / campaign.target_amount) * 100)),
      remaining_amount: Math.max(0, campaign.target_amount - campaign.raised_amount),
      total_utilized: totalUtilized,
      updates,
      donations,
      utilizations
    });
  } catch (error) {
    console.error('Error fetching campaign detail:', error);
    res.status(500).json({ error: 'Failed to fetch campaign details' });
  }
});

app.post('/api/campaigns', async (req, res) => {
  try {
    const {
      title,
      subtitle,
      category,
      description,
      target_amount,
      image_url,
      deadline,
      urgency = 'normal',
      organizer = 'KindBridge Verified Initiative',
      location = 'Global Operations',
      beneficiaries_count = 0,
      featured = 0
    } = req.body;

    if (!title || !category || !target_amount || !description) {
      return res.status(400).json({ error: 'Missing required campaign fields (title, category, target_amount, description)' });
    }

    const defaultImg = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80";

    const result = await dbRun(`
      INSERT INTO campaigns (title, subtitle, category, description, target_amount, raised_amount, donor_count, image_url, deadline, status, urgency, organizer, location, beneficiaries_count, featured)
      VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, 'active', ?, ?, ?, ?, ?)
    `, [
      title,
      subtitle || title,
      category,
      description,
      parseFloat(target_amount),
      image_url || defaultImg,
      deadline || new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0],
      urgency,
      organizer,
      location,
      parseInt(beneficiaries_count) || 100,
      featured ? 1 : 0
    ]);

    const created = await dbGet(`SELECT * FROM campaigns WHERE id = ?`, [result.lastID]);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

app.put('/api/campaigns/:id', async (req, res) => {
  try {
    const { title, subtitle, category, description, target_amount, status, urgency, organizer, location, beneficiaries_count, featured } = req.body;
    
    await dbRun(`
      UPDATE campaigns
      SET title = COALESCE(?, title),
          subtitle = COALESCE(?, subtitle),
          category = COALESCE(?, category),
          description = COALESCE(?, description),
          target_amount = COALESCE(?, target_amount),
          status = COALESCE(?, status),
          urgency = COALESCE(?, urgency),
          organizer = COALESCE(?, organizer),
          location = COALESCE(?, location),
          beneficiaries_count = COALESCE(?, beneficiaries_count),
          featured = COALESCE(?, featured)
      WHERE id = ?
    `, [
      title, subtitle, category, description, target_amount ? parseFloat(target_amount) : null,
      status, urgency, organizer, location, beneficiaries_count ? parseInt(beneficiaries_count) : null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      req.params.id
    ]);

    const updated = await dbGet(`SELECT * FROM campaigns WHERE id = ?`, [req.params.id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    await dbRun(`DELETE FROM campaigns WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Campaign deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// -------------------------------------------------------------
// 3. DONATIONS & RECEIPT GENERATOR API
// -------------------------------------------------------------
app.post('/api/donations', async (req, res) => {
  try {
    const {
      campaign_id,
      donor_name,
      donor_email,
      donor_phone,
      amount,
      tip_amount = 0,
      payment_method = 'Card',
      is_recurring = 0,
      frequency = 'one-time',
      dedication = '',
      is_anonymous = 0
    } = req.body;

    if (!campaign_id || !donor_email || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid donation details: campaign_id, donor_email, and positive amount are required.' });
    }

    const donAmount = parseFloat(amount);
    const donTip = parseFloat(tip_amount) || 0;
    const totalAmount = donAmount + donTip;

    const campaign = await dbGet(`SELECT * FROM campaigns WHERE id = ?`, [campaign_id]);
    if (!campaign) {
      return res.status(404).json({ error: 'Target campaign not found' });
    }

    // Manage Donor record
    let donor = await dbGet(`SELECT * FROM donors WHERE LOWER(email) = LOWER(?)`, [donor_email]);
    let donorId;

    if (donor) {
      donorId = donor.id;
      const newTotal = donor.total_donated + totalAmount;
      const newCount = donor.donations_count + 1;
      
      let tier = 'Bronze';
      let badge = 'Supporter';
      if (newTotal >= 5000) {
        tier = 'Platinum';
        badge = 'Philanthropist Hero';
      } else if (newTotal >= 1500) {
        tier = 'Gold';
        badge = 'Guardian Pillar';
      } else if (newTotal >= 500) {
        tier = 'Silver';
        badge = 'Community Sustainer';
      }

      await dbRun(`
        UPDATE donors
        SET total_donated = ?,
            donations_count = ?,
            tier = ?,
            badge = ?,
            name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            is_anonymous = ?
        WHERE id = ?
      `, [newTotal, newCount, tier, badge, donor_name, donor_phone || donor.phone, is_anonymous ? 1 : 0, donorId]);
    } else {
      let tier = 'Bronze';
      let badge = 'Supporter';
      if (totalAmount >= 5000) {
        tier = 'Platinum';
        badge = 'Philanthropist Hero';
      } else if (totalAmount >= 1500) {
        tier = 'Gold';
        badge = 'Guardian Pillar';
      } else if (totalAmount >= 500) {
        tier = 'Silver';
        badge = 'Community Sustainer';
      }

      const newDonorRes = await dbRun(`
        INSERT INTO donors (name, email, phone, tier, total_donated, donations_count, is_anonymous, badge)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
      `, [donor_name || 'Anonymous Donor', donor_email, donor_phone || '', tier, totalAmount, is_anonymous ? 1 : 0, badge]);
      donorId = newDonorRes.lastID;
    }

    // Generate receipt and transaction IDs
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `KB-RCPT-${new Date().getFullYear()}-${timestamp}${randomSuffix}`;
    const transactionId = `TXN-${payment_method.toUpperCase().slice(0, 3)}-${Date.now()}`;

    // Create Donation record
    const donationRes = await dbRun(`
      INSERT INTO donations (campaign_id, donor_id, donor_name, donor_email, amount, tip_amount, total_amount, payment_method, payment_status, is_recurring, frequency, dedication, receipt_number, transaction_id, tax_exempt_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, '501(c)(3)-SEC-80G-TAX-EXEMPT')
    `, [
      campaign_id,
      donorId,
      is_anonymous ? 'Kind Anonymous Donor' : (donor_name || 'Generous Donor'),
      donor_email,
      donAmount,
      donTip,
      totalAmount,
      payment_method,
      is_recurring ? 1 : 0,
      frequency,
      dedication || '',
      receiptNumber,
      transactionId
    ]);

    // Update Campaign Raised Amount & Donor Count
    await dbRun(`
      UPDATE campaigns
      SET raised_amount = raised_amount + ?,
          donor_count = donor_count + 1
      WHERE id = ?
    `, [donAmount, campaign_id]);

    // Record communication log
    await dbRun(`
      INSERT INTO communications (campaign_id, donor_id, sender_name, sender_email, recipient_email, message_type, subject, content, status, reply)
      VALUES (?, ?, 'KindBridge Automated Donor Care', 'receipts@kindbridge.org', ?, 'thank_you', ?, ?, 'resolved', 'Thank you letter generated and dispatched with tax certificate.')
    `, [
      campaign_id,
      donorId,
      donor_email,
      `Thank You for your generous contribution to "${campaign.title}"!`,
      `Dear ${donor_name || 'Valued Donor'},\n\nWe gratefully acknowledge your contribution of $${totalAmount.toFixed(2)} towards "${campaign.title}". Your official tax-deductible receipt number is ${receiptNumber}.\n\nYour support creates direct, tangible impact on ground.\n\nWarm regards,\nThe KindBridge Relief & Aid Operations Team.`
    ]);

    const fullDonation = await dbGet(`
      SELECT d.*, c.title as campaign_title, c.category as campaign_category, c.organizer as campaign_organizer
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.id = ?
    `, [donationRes.lastID]);

    res.status(201).json({
      message: 'Donation processed successfully!',
      donation: fullDonation
    });
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({ error: 'Failed to process donation transaction' });
  }
});

app.get('/api/donations', async (req, res) => {
  try {
    const { campaign_id, email, search } = req.query;
    let query = `
      SELECT d.*, c.title as campaign_title, c.category as campaign_category
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (campaign_id) {
      query += ` AND d.campaign_id = ?`;
      params.push(campaign_id);
    }
    if (email) {
      query += ` AND LOWER(d.donor_email) = LOWER(?)`;
      params.push(email);
    }
    if (search) {
      query += ` AND (d.donor_name LIKE ? OR d.donor_email LIKE ? OR d.receipt_number LIKE ? OR d.transaction_id LIKE ? OR c.title LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    query += ` ORDER BY d.id DESC`;

    const donations = await dbAll(query, params);
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations list' });
  }
});

app.get('/api/donations/:id/receipt', async (req, res) => {
  try {
    const donation = await dbGet(`
      SELECT d.*, c.title as campaign_title, c.category as campaign_category, c.organizer as campaign_organizer, c.location as campaign_location,
             dn.tier as donor_tier, dn.badge as donor_badge
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN donors dn ON d.donor_id = dn.id
      WHERE d.id = ? OR d.receipt_number = ?
    `, [req.params.id, req.params.id]);

    if (!donation) {
      return res.status(404).json({ error: 'Receipt not found for this donation' });
    }

    res.json({
      receiptNumber: donation.receipt_number,
      transactionId: donation.transaction_id,
      donationDate: donation.created_at,
      donorName: donation.donor_name,
      donorEmail: donation.donor_email,
      donorTier: donation.donor_tier || 'Supporter',
      amount: donation.amount,
      tipAmount: donation.tip_amount,
      totalAmount: donation.total_amount,
      paymentMethod: donation.payment_method,
      frequency: donation.frequency,
      dedication: donation.dedication,
      campaignTitle: donation.campaign_title,
      campaignCategory: donation.campaign_category,
      campaignOrganizer: donation.campaign_organizer,
      taxExemptionCode: donation.tax_exempt_code,
      organizationName: "KindBridge Global Charitable Foundation",
      regNumber: "NGO-REG-80G-501C3-99418A",
      taxBenefitNotice: "This contribution qualifies for 100% tax exemption under Section 80G / 501(c)(3) statutory charitable provisions."
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

// -------------------------------------------------------------
// 4. DONORS ROSTER & PORTAL API
// -------------------------------------------------------------
app.get('/api/donors', async (req, res) => {
  try {
    const { search, tier } = req.query;
    let query = `SELECT * FROM donors WHERE 1=1`;
    const params = [];

    if (tier && tier !== 'All') {
      query += ` AND tier = ?`;
      params.push(tier);
    }
    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ` ORDER BY total_donated DESC, donations_count DESC`;

    const donors = await dbAll(query, params);
    res.json(donors);
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ error: 'Failed to fetch donors' });
  }
});

app.get('/api/donors/lookup', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for lookup' });
    }

    const donor = await dbGet(`SELECT * FROM donors WHERE LOWER(email) = LOWER(?)`, [email.trim()]);
    if (!donor) {
      return res.status(404).json({ error: 'No donor profile found with this email' });
    }

    const donations = await dbAll(`
      SELECT d.*, c.title as campaign_title, c.category as campaign_category
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.donor_id = ? OR LOWER(d.donor_email) = LOWER(?)
      ORDER BY d.id DESC
    `, [donor.id, email.trim()]);

    res.json({
      donor,
      donations,
      stats: {
        totalDonated: donor.total_donated,
        donationsCount: donor.donations_count,
        tier: donor.tier,
        badge: donor.badge
      }
    });
  } catch (error) {
    console.error('Error in donor lookup:', error);
    res.status(500).json({ error: 'Failed to lookup donor' });
  }
});

// -------------------------------------------------------------
// 5. UTILIZATIONS (TRANSPARENCY & EXPENSE LOGS)
// -------------------------------------------------------------
app.get('/api/utilizations', async (req, res) => {
  try {
    const { campaign_id, category } = req.query;
    let query = `
      SELECT u.*, c.title as campaign_title, c.category as campaign_category
      FROM utilizations u
      JOIN campaigns c ON u.campaign_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (campaign_id) {
      query += ` AND u.campaign_id = ?`;
      params.push(campaign_id);
    }
    if (category && category !== 'All') {
      query += ` AND u.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY u.expense_date DESC, u.id DESC`;

    const utilizations = await dbAll(query, params);

    const categoryBreakdown = await dbAll(`
      SELECT category, SUM(amount_spent) as total_spent, COUNT(*) as items_count
      FROM utilizations
      GROUP BY category
      ORDER BY total_spent DESC
    `);

    res.json({
      items: utilizations,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching utilizations:', error);
    res.status(500).json({ error: 'Failed to fetch transparency records' });
  }
});

app.post('/api/utilizations', async (req, res) => {
  try {
    const {
      campaign_id,
      expense_title,
      category,
      amount_spent,
      proof_description,
      expense_date,
      verified_by = 'KindBridge ESG Compliance Board',
      invoice_ref
    } = req.body;

    if (!campaign_id || !expense_title || !category || !amount_spent) {
      return res.status(400).json({ error: 'Missing required expense fields (campaign_id, expense_title, category, amount_spent)' });
    }

    const invRef = invoice_ref || `INV-KB-${Date.now().toString().slice(-6)}`;
    const expDate = expense_date || new Date().toISOString().split('T')[0];

    const result = await dbRun(`
      INSERT INTO utilizations (campaign_id, expense_title, category, amount_spent, proof_description, expense_date, verified_by, invoice_ref, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Verified')
    `, [
      campaign_id,
      expense_title,
      category,
      parseFloat(amount_spent),
      proof_description || 'Audited field disbursement and procurement invoice.',
      expDate,
      verified_by,
      invRef
    ]);

    const created = await dbGet(`
      SELECT u.*, c.title as campaign_title
      FROM utilizations u
      JOIN campaigns c ON u.campaign_id = c.id
      WHERE u.id = ?
    `, [result.lastID]);

    res.status(201).json(created);
  } catch (error) {
    console.error('Error adding utilization:', error);
    res.status(500).json({ error: 'Failed to record expense utilization' });
  }
});

// -------------------------------------------------------------
// 6. DONOR COMMUNICATIONS & MESSAGES
// -------------------------------------------------------------
app.get('/api/communications', async (req, res) => {
  try {
    const { campaign_id, status, type } = req.query;
    let query = `
      SELECT cm.*, c.title as campaign_title
      FROM communications cm
      LEFT JOIN campaigns c ON cm.campaign_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (campaign_id) {
      query += ` AND cm.campaign_id = ?`;
      params.push(campaign_id);
    }
    if (status && status !== 'All') {
      query += ` AND cm.status = ?`;
      params.push(status);
    }
    if (type && type !== 'All') {
      query += ` AND cm.message_type = ?`;
      params.push(type);
    }

    query += ` ORDER BY cm.id DESC`;

    const messages = await dbAll(query, params);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/communications', async (req, res) => {
  try {
    const { campaign_id, donor_id, sender_name, sender_email, recipient_email = 'admin@kindbridge.org', message_type = 'inquiry', subject, content } = req.body;

    if (!sender_name || !sender_email || !subject || !content) {
      return res.status(400).json({ error: 'sender_name, sender_email, subject, and content are required.' });
    }

    const result = await dbRun(`
      INSERT INTO communications (campaign_id, donor_id, sender_name, sender_email, recipient_email, message_type, subject, content, status, reply)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NULL)
    `, [
      campaign_id || null,
      donor_id || null,
      sender_name,
      sender_email,
      recipient_email,
      message_type,
      subject,
      content
    ]);

    const created = await dbGet(`SELECT * FROM communications WHERE id = ?`, [result.lastID]);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error sending communication:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/api/communications/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    await dbRun(`
      UPDATE communications
      SET reply = ?, status = 'replied'
      WHERE id = ?
    `, [reply, req.params.id]);

    const updated = await dbGet(`SELECT * FROM communications WHERE id = ?`, [req.params.id]);
    res.json(updated);
  } catch (error) {
    console.error('Error replying to communication:', error);
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

// -------------------------------------------------------------
// 7. CAMPAIGN UPDATES & FIELD REPORTS
// -------------------------------------------------------------
app.get('/api/campaign-updates', async (req, res) => {
  try {
    const { campaign_id } = req.query;
    let query = `
      SELECT cu.*, c.title as campaign_title
      FROM campaign_updates cu
      JOIN campaigns c ON cu.campaign_id = c.id
    `;
    const params = [];
    if (campaign_id) {
      query += ` WHERE cu.campaign_id = ?`;
      params.push(campaign_id);
    }
    query += ` ORDER BY cu.id DESC`;

    const updates = await dbAll(query, params);
    res.json(updates);
  } catch (error) {
    console.error('Error fetching campaign updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

app.post('/api/campaign-updates', async (req, res) => {
  try {
    const { campaign_id, title, content, milestone_tag, author, media_url } = req.body;
    if (!campaign_id || !title || !content) {
      return res.status(400).json({ error: 'campaign_id, title, and content are required' });
    }

    const result = await dbRun(`
      INSERT INTO campaign_updates (campaign_id, title, content, milestone_tag, author, media_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      campaign_id,
      title,
      content,
      milestone_tag || 'Progress Milestone',
      author || 'Field Coordinator',
      media_url || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80'
    ]);

    const created = await dbGet(`SELECT * FROM campaign_updates WHERE id = ?`, [result.lastID]);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating campaign update:', error);
    res.status(500).json({ error: 'Failed to add campaign update' });
  }
});

// -------------------------------------------------------------
// 8. DATABASE RESET / SEED HELPER
// -------------------------------------------------------------
app.post('/api/seed/reset', async (req, res) => {
  try {
    await dbRun(`DROP TABLE IF EXISTS users`);
    await dbRun(`DROP TABLE IF EXISTS campaigns`);
    await dbRun(`DROP TABLE IF EXISTS donors`);
    await dbRun(`DROP TABLE IF EXISTS donations`);
    await dbRun(`DROP TABLE IF EXISTS utilizations`);
    await dbRun(`DROP TABLE IF EXISTS communications`);
    await dbRun(`DROP TABLE IF EXISTS campaign_updates`);
    
    delete require.cache[require.resolve('./database')];
    require('./database');

    setTimeout(() => {
      res.json({ message: 'Database reset and seeded with users and sample data successfully!' });
    }, 800);
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Charity & Donation Management Backend API listening on http://localhost:${PORT}`);
});
