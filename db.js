const { Pool } = require('pg');

// pg pool will automatically use DATABASE_URL from environment
// This works with Prisma Postgres, Vercel Postgres, Supabase, and any standard Postgres
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Helper to mimic @vercel/postgres tagged template style
const sql = async (strings, ...values) => {
    const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '');
    return pool.query(text, values);
};

async function initializeDatabase() {
    try {
        console.log('Initializing Postgres Database...');

        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            isblocked INTEGER DEFAULT 0,
            createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS accounts (
            id SERIAL PRIMARY KEY,
            accountnumber TEXT UNIQUE NOT NULL,
            userid INTEGER REFERENCES users(id),
            balance REAL DEFAULT 0.0,
            accounttype TEXT DEFAULT 'Savings'
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            senderid INTEGER REFERENCES users(id),
            receiverid INTEGER REFERENCES users(id),
            amount REAL NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'completed',
            category TEXT,
            description TEXT
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS beneficiaries (
            id SERIAL PRIMARY KEY,
            userid INTEGER REFERENCES users(id),
            name TEXT NOT NULL,
            accountnumber TEXT NOT NULL,
            ifsc TEXT
        )`);

        // Seed initial users if empty
        const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
        if (parseInt(rows[0].count) === 0) {
            console.log('Seeding initial data...');

            const adminRes = await pool.query(
                `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
                ['Super Admin', 'admin@zenith.bank', 'admin123', 'admin']
            );
            await pool.query(
                `INSERT INTO accounts (accountnumber, userid, balance) VALUES ($1, $2, $3)`,
                ['ACC0001', adminRes.rows[0].id, 1000000.00]
            );

            const kishorRes = await pool.query(
                `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id`,
                ['Kishor', 'kishor@gmail.com', '12340']
            );
            await pool.query(
                `INSERT INTO accounts (accountnumber, userid, balance) VALUES ($1, $2, $3)`,
                ['ACC8899', kishorRes.rows[0].id, 15000.00]
            );

            const testRes = await pool.query(
                `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id`,
                ['Test Recipient', 'test@gmail.com', 'test123']
            );
            await pool.query(
                `INSERT INTO accounts (accountnumber, userid, balance) VALUES ($1, $2, $3)`,
                ['ACC1234', testRes.rows[0].id, 5000.00]
            );

            console.log('Seeding complete.');
        }

        console.log('Postgres Database initialized successfully.');
    } catch (err) {
        console.error('Error initializing Postgres Database:', err.message);
    }
}

initializeDatabase();

module.exports = { pool, sql };
