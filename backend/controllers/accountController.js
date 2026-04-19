const db = require('../../db');

const getAccountDetails = (req, res) => {
    const userId = req.query.userId;
    db.get(`SELECT * FROM accounts WHERE userId = ?`, [userId], (err, account) => {
        if (err || !account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    });
};

const getBeneficiaries = (req, res) => {
    const userId = req.query.userId;
    db.all(`SELECT * FROM beneficiaries WHERE userId = ?`, [userId], (err, rows) => {
        res.json(rows || []);
    });
};

const addBeneficiary = (req, res) => {
    const { userId, name, accountNumber, ifsc } = req.body;
    db.run(
        `INSERT INTO beneficiaries (userId, name, accountNumber, ifsc) VALUES (?, ?, ?, ?)`,
        [userId, name, accountNumber, ifsc],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
};

module.exports = { getAccountDetails, getBeneficiaries, addBeneficiary };
