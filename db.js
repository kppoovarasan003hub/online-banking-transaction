const { sql } = require('@vercel/postgres');

async function initializeDatabase() {
    try {
        console.log('Initializing Postgres Database...');

        // Users Table
        await sql`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            isBlocked INTEGER DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        // Accounts Table
        await sql`CREATE TABLE IF NOT EXISTS accounts (
            id SERIAL PRIMARY KEY,
            accountNumber TEXT UNIQUE NOT NULL,
            userId INTEGER REFERENCES users(id),
            balance REAL DEFAULT 0.0,
            accountType TEXT DEFAULT 'Savings'
        )`;

        // Transactions Table
        await sql`CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            senderId INTEGER REFERENCES users(id),
            receiverId INTEGER REFERENCES users(id),
            amount REAL NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'completed',
            category TEXT,
            description TEXT
        )`;

        // Beneficiaries Table
        await sql`CREATE TABLE IF NOT EXISTS beneficiaries (
            id SERIAL PRIMARY KEY,
            userId INTEGER REFERENCES users(id),
            name TEXT NOT NULL,
            accountNumber TEXT NOT NULL,
            ifsc TEXT
        )`;

        // Seed Admin & Users if empty
        const { rows } = await sql`SELECT COUNT(*) as count FROM users`;
        if (parseInt(rows[0].count) === 0) {
            console.log('Seeding initial data...');
            
            // User 1: Admin
            const adminRes = await sql`INSERT INTO users (name, email, password, role) VALUES ('Super Admin', 'admin@zenith.bank', 'admin123', 'admin') RETURNING id`;
            const adminId = adminRes.rows[0].id;
            await sql`INSERT INTO accounts (accountNumber, userId, balance) VALUES ('ACC0001', ${adminId}, 1000000.00)`;

            // User 2: Kishor
            const kishorRes = await sql`INSERT INTO users (name, email, password) VALUES ('Kishor', 'kishor@gmail.com', '12340') RETURNING id`;
            const kishorId = kishorRes.rows[0].id;
            await sql`INSERT INTO accounts (accountNumber, userId, balance) VALUES ('ACC8899', ${kishorId}, 124560.80)`;

            // User 3: Test Recipient
            const testRes = await sql`INSERT INTO users (name, email, password) VALUES ('Test Recipient', 'test@gmail.com', 'test123') RETURNING id`;
            const testId = testRes.rows[0].id;
            await sql`INSERT INTO accounts (accountNumber, userId, balance) VALUES ('ACC1234', ${testId}, 500.00)`;
        }

        console.log('Postgres Database initialized successfully.');
    } catch (err) {
        console.error('Error initializing Postgres Database:', err.message);
    }
}

// Call init
initializeDatabase();

module.exports = { sql };
