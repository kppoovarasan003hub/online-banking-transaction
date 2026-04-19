const { sql } = require('../../db');

const getAccountDetails = async (req, res) => {
    const userId = req.query.userId;
    try {
        const { rows } = await sql`SELECT * FROM accounts WHERE userId = ${userId}`;
        const account = rows[0];
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    } catch (err) {
        console.error('Account Details Error:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
};

const getBeneficiaries = async (req, res) => {
    const userId = req.query.userId;
    try {
        const { rows } = await sql`SELECT * FROM beneficiaries WHERE userId = ${userId}`;
        res.json(rows || []);
    } catch (err) {
        console.error('Beneficiaries Error:', err.message);
        res.json([]);
    }
};

const addBeneficiary = async (req, res) => {
    const { userId, name, accountNumber, ifsc } = req.body;
    try {
        const result = await sql`
            INSERT INTO beneficiaries (userId, name, accountNumber, ifsc) 
            VALUES (${userId}, ${name}, ${accountNumber}, ${ifsc}) 
            RETURNING id
        `;
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error('Add Beneficiary Error:', err.message);
        res.status(500).json({ error: 'Failed to add beneficiary' });
    }
};

module.exports = { getAccountDetails, getBeneficiaries, addBeneficiary };
