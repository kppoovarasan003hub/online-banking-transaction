const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'bank.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            isBlocked INTEGER DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Accounts Table
        db.run(`CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            accountNumber TEXT UNIQUE NOT NULL,
            userId INTEGER,
            balance REAL DEFAULT 0.0,
            accountType TEXT DEFAULT 'Savings',
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        // Transactions Table
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            senderId INTEGER,
            receiverId INTEGER,
            amount REAL NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'completed',
            category TEXT,
            description TEXT,
            FOREIGN KEY(senderId) REFERENCES users(id),
            FOREIGN KEY(receiverId) REFERENCES users(id)
        )`);

        // Beneficiaries Table
        db.run(`CREATE TABLE IF NOT EXISTS beneficiaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            name TEXT NOT NULL,
            accountNumber TEXT NOT NULL,
            ifsc TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        // OTPs Table (Simple mockup for now)
        db.run(`CREATE TABLE IF NOT EXISTS otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            expiresAt DATETIME
        )`);

        // Seed Admin & Users
        db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
            if (row && row.count === 0) {
                // User 1: Super Admin
                db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
                    ['Super Admin', 'admin@zenith.bank', 'admin123', 'admin'], function() {
                        const adminId = this.lastID;
                        db.run(`INSERT INTO accounts (accountNumber, userId, balance) VALUES (?, ?, ?)`, 
                            ['ACC0001', adminId, 1000000.00]);
                    });
                
                // User 2: Kishor
                db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
                    ['Kishor', 'kishor@gmail.com', '12340'], function() {
                        const userId = this.lastID;
                        db.run(`INSERT INTO accounts (accountNumber, userId, balance) VALUES (?, ?, ?)`, 
                            ['ACC8899', userId, 124560.80]);
                    });

                // User 3: Test Recipient
                db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
                    ['Test Recipient', 'test@gmail.com', 'test123'], function() {
                        const testId = this.lastID;
                        db.run(`INSERT INTO accounts (accountNumber, userId, balance) VALUES (?, ?, ?)`, 
                            ['ACC1234', testId, 500.00]);
                    });
            }
        });
    });
}

module.exports = db;
