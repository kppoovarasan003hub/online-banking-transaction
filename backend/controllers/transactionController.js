const { pool } = require('../../db');

const transferMoney = async (req, res) => {
    const { senderId, receiverAccount, amount, description, category } = req.body;

    try {
        // 1. Check Sender Balance
        const senderRes = await pool.query(`SELECT balance, id FROM accounts WHERE userid = $1`, [senderId]);
        const senderAcc = senderRes.rows[0];

        if (!senderAcc || senderAcc.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds or account error' });
        }

        // 2. Find Receiver by Account Number
        const receiverRes = await pool.query(`SELECT id, userid FROM accounts WHERE accountnumber = $1`, [receiverAccount]);
        const receiverAcc = receiverRes.rows[0];

        const isInternal = !!receiverAcc;
        const receiverUserId = isInternal ? receiverAcc.userid : null;
        const txDescription = isInternal
            ? description
            : `External Transfer to ${receiverAccount}${description ? ' - ' + description : ''}`;

        // 3. Deduct from Sender
        await pool.query(`UPDATE accounts SET balance = balance - $1 WHERE userid = $2`, [amount, senderId]);

        // 4. Credit Receiver if Internal
        if (isInternal) {
            await pool.query(`UPDATE accounts SET balance = balance + $1 WHERE id = $2`, [amount, receiverAcc.id]);
        }

        // 5. Record Transaction
        await pool.query(
            `INSERT INTO transactions (senderid, receiverid, amount, description, category) VALUES ($1, $2, $3, $4, $5)`,
            [senderId, receiverUserId, amount, txDescription, category || (isInternal ? 'Transfer' : 'External Transfer')]
        );

        res.json({ success: true, message: isInternal ? 'Transfer successful' : 'External transfer successful' });
    } catch (err) {
        console.error('Transfer Error:', err.message);
        res.status(500).json({ error: 'Transaction failed' });
    }
};

const getHistory = async (req, res) => {
    const userId = req.query.userId;
    try {
        const { rows } = await pool.query(
            `SELECT * FROM transactions WHERE senderid = $1 OR receiverid = $1 ORDER BY date DESC`,
            [userId]
        );
        // Normalize for frontend
        const normalized = rows.map(tx => ({
            id: tx.id,
            senderId: tx.senderid,
            receiverId: tx.receiverid,
            amount: tx.amount,
            date: tx.date,
            status: tx.status,
            category: tx.category,
            description: tx.description
        }));
        res.json(normalized || []);
    } catch (err) {
        console.error('History Error:', err.message);
        res.json([]);
    }
};

module.exports = { transferMoney, getHistory };
