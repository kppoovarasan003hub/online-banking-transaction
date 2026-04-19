const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Routes (We'll create these files next)
const authRoutes = require('./backend/routes/authRoutes');
const accountRoutes = require('./backend/routes/accountRoutes');
const transactionRoutes = require('./backend/routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// ── TEMP: one-time balance setter (remove after use) ──────────────────────
const { pool } = require('./db');
app.post('/api/admin/set-balance', async (req, res) => {
    const { secret, accountNumber, amount } = req.body;
    if (secret !== 'zenith-admin-2026') return res.status(403).json({ error: 'Forbidden' });
    try {
        const result = await pool.query(
            `UPDATE accounts SET balance = $1 WHERE accountnumber = $2 RETURNING accountnumber, balance`,
            [amount, accountNumber]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Account not found' });
        res.json({ success: true, account: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────────────────────────────────

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Banking System Backend running at http://localhost:${PORT}`);
});
