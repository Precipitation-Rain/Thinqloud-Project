const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'charity.db');
const db = new sqlite3.Database(DB_PATH);

// Initialize Tables and seed data
db.serialize(() => {
  // 1. Users Table (Authentication for Donors and Admins)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      username TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'donor',
      phone TEXT,
      organization TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure username column exists if db was created previously
  db.run(`ALTER TABLE users ADD COLUMN username TEXT`, (err) => {
    // ignore if column already exists
  });

  // 2. Campaigns Table
  db.run(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      target_amount REAL NOT NULL,
      raised_amount REAL DEFAULT 0,
      donor_count INTEGER DEFAULT 0,
      image_url TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'active',
      urgency TEXT DEFAULT 'normal',
      organizer TEXT,
      location TEXT,
      beneficiaries_count INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Donors Table
  db.run(`
    CREATE TABLE IF NOT EXISTS donors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      tier TEXT DEFAULT 'Bronze',
      total_donated REAL DEFAULT 0,
      donations_count INTEGER DEFAULT 0,
      is_anonymous INTEGER DEFAULT 0,
      badge TEXT DEFAULT 'Supporter',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Donations Table
  db.run(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      donor_id INTEGER,
      donor_name TEXT NOT NULL,
      donor_email TEXT NOT NULL,
      amount REAL NOT NULL,
      tip_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'Card',
      payment_status TEXT DEFAULT 'completed',
      is_recurring INTEGER DEFAULT 0,
      frequency TEXT DEFAULT 'one-time',
      dedication TEXT,
      receipt_number TEXT UNIQUE NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      tax_exempt_code TEXT DEFAULT '501(c)(3)-TAX-DEDUCTIBLE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY(donor_id) REFERENCES donors(id)
    )
  `);

  // 5. Utilizations (Expense Transparency) Table
  db.run(`
    CREATE TABLE IF NOT EXISTS utilizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      expense_title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount_spent REAL NOT NULL,
      proof_description TEXT,
      expense_date TEXT NOT NULL,
      verified_by TEXT DEFAULT 'Audited by GlobalTrust ESG',
      invoice_ref TEXT,
      status TEXT DEFAULT 'Verified',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
    )
  `);

  // 6. Communications Table
  db.run(`
    CREATE TABLE IF NOT EXISTS communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER,
      donor_id INTEGER,
      sender_name TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      recipient_email TEXT,
      message_type TEXT DEFAULT 'inquiry',
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 7. Campaign Updates Table
  db.run(`
    CREATE TABLE IF NOT EXISTS campaign_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      milestone_tag TEXT,
      author TEXT DEFAULT 'Field Coordinator',
      media_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
    )
  `);

  // Seed default admin and sample users
  setTimeout(() => {
    seedUsers();
  }, 100);
});

function seedUsers() {
  // Pre-seed Admin with requested credentials: username 'user', password 'admin@123'
  db.run(`
    INSERT OR REPLACE INTO users (id, name, email, username, password, role, phone, organization)
    VALUES (1, 'NGO Administrator', 'admin@kindbridge.org', 'user', 'admin@123', 'admin', '+1 (555) 019-2834', 'KindBridge Global Trust')
  `);

  const sampleDonors = [
    { name: "Sophia Reynolds", email: "sophia.reynolds@example.com", username: "sophia", password: "donor123", role: "donor", phone: "+1 (555) 234-5678" },
    { name: "Marcus Vance", email: "marcus.v@example.com", username: "marcus", password: "donor123", role: "donor", phone: "+1 (555) 345-6789" },
    { name: "Elena Rostova", email: "elena.rostova@example.com", username: "elena", password: "donor123", role: "donor", phone: "+1 (555) 456-7890" }
  ];

  const stmtUsers = db.prepare(`
    INSERT OR IGNORE INTO users (name, email, username, password, role, phone, organization)
    VALUES (?, ?, ?, ?, ?, ?, NULL)
  `);

  sampleDonors.forEach(u => {
    stmtUsers.run(u.name, u.email, u.username, u.password, u.role, u.phone);
  });
  stmtUsers.finalize();
}

module.exports = db;
