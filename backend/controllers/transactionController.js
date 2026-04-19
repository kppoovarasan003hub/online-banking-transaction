const { sql } = require('../../db');

const transferMoney = async (req, res) => {
    const { senderId, receiverAccount, amount, description, category } = req.body;

    try {
        // 1. Check Sender Balance
        const senderRes = await sql`SELECT balance, id FROM accounts WHERE userId = ${senderId}`;
        const senderAcc = senderRes.rows[0];

        if (!senderAcc || senderAcc.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds or account error' });
        }

        // 2. Find Receiver (by Account Number)
        const receiverRes = await sql`SELECT id, userId FROM accounts WHERE accountNumber = ${receiverAccount}`;
        const receiverAcc = receiverRes.rows[0];

        const isInternal = !!receiverAcc;
        const receiverUserId = isInternal ? receiverAcc.userId : null;
        const txDescription = isInternal ? description : `External Transfer to ${receiverAccount}${description ? ' - ' + description : ''}`;

        // 3. Perform Transaction (Simplified for Vercel SQL)
        // In production, use a client transaction. For demo, we'll run sequential.
        
        // Update Sender
        await sql`UPDATE accounts SET balance = balance - ${amount} WHERE userId = ${senderId}`;
        
        // Update Receiver if Internal
        if (isInternal) {
            await sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${receiverAcc.id}`;
        }

        // Record Transaction
        await sql`
            INSERT INTO transactions (senderId, receiverId, amount, description, category) 
            VALUES (${senderId}, ${receiverUserId}, ${amount}, ${txDescription}, ${category || (isInternal ? 'Transfer' : 'External Transfer')})
        `;

        res.json({ success: true, message: isInternal ? 'Transfer successful' : 'External transfer successful' });
    } catch (err) {
        console.error('Transfer Error:', err.message);
        res.status(500).json({ error: 'Transaction failed' });
    }
};

const getHistory = async (req, res) => {
    const userId = req.query.userId;
    try {
        const { rows } = await sql`
            SELECT * FROM transactions 
            WHERE senderId = ${userId} OR receiverId = ${userId} 
            ORDER BY date DESC
        `;
        res.json(rows || []);
    } catch (err) {
        console.error('History Error:', err.message);
        res.json([]);
    }
};

module.exports = { transferMoney, getHistory };
