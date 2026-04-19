const { pool } = require('../../db');

const getAccountDetails = async (req, res) => {
    const userId = req.query.userId;
    try {
        const { rows } = await pool.query(`SELECT * FROM accounts WHERE userid = $1`, [userId]);
        const account = rows[0];
        if (!account) return res.status(404).json({ error: 'Account not found' });
        // Normalize field names for frontend compatibility
        res.json({
            id: account.id,
            accountNumber: account.accountnumber,
            userId: account.userid,
            balance: account.balance,
            accountType: account.accounttype
        });
    } catch (err) {
        console.error('Account Details Error:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
};

const getBeneficiaries = async (req, res) => {
    const userId = req.query.userId;
    try {
        const { rows } = await pool.query(`SELECT * FROM beneficiaries WHERE userid = $1`, [userId]);
        const normalized = rows.map(b => ({
            id: b.id,
            userId: b.userid,
            name: b.name,
            accountNumber: b.accountnumber,
            ifsc: b.ifsc
        }));
        res.json(normalized || []);
    } catch (err) {
        console.error('Beneficiaries Error:', err.message);
        res.json([]);
    }
};

const addBeneficiary = async (req, res) => {
    const { userId, name, accountNumber, ifsc } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO beneficiaries (userid, name, accountnumber, ifsc) VALUES ($1, $2, $3, $4) RETURNING id`,
            [userId, name, accountNumber, ifsc]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error('Add Beneficiary Error:', err.message);
        res.status(500).json({ error: 'Failed to add beneficiary' });
    }
};

module.exports = { getAccountDetails, getBeneficiaries, addBeneficiary };
