const db = require('../../db');

const transferMoney = (req, res) => {
    const { senderId, receiverAccount, amount, description, category } = req.body;

    db.serialize(() => {
        // 1. Check Sender Balance
        db.get(`SELECT balance, id FROM accounts WHERE userId = ?`, [senderId], (err, senderAcc) => {
            if (!senderAcc || senderAcc.balance < amount) {
                return res.status(400).json({ error: 'Insufficient funds or account error' });
            }

            // 2. Find Receiver (by Account Number)
            db.get(`SELECT id, userId FROM accounts WHERE accountNumber = ?`, [receiverAccount], (err, receiverAcc) => {
                const isInternal = !!receiverAcc;
                const receiverUserId = isInternal ? receiverAcc.userId : null;
                const txDescription = isInternal ? description : `External Transfer to ${receiverAccount}${description ? ' - ' + description : ''}`;

                // 3. Perform Transaction
                db.run('BEGIN TRANSACTION');
                
                // Update Sender
                db.run(`UPDATE accounts SET balance = balance - ? WHERE userId = ?`, [amount, senderId]);
                
                // Update Receiver if Internal
                if (isInternal) {
                    db.run(`UPDATE accounts SET balance = balance + ? WHERE id = ?`, [amount, receiverAcc.id]);
                }

                // Record Transaction
                db.run(
                    `INSERT INTO transactions (senderId, receiverId, amount, description, category) VALUES (?, ?, ?, ?, ?)`,
                    [senderId, receiverUserId, amount, txDescription, category || (isInternal ? 'Transfer' : 'External Transfer')],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Transaction failed' });
                        }
                        db.run('COMMIT');
                        res.json({ success: true, message: isInternal ? 'Transfer successful' : 'External transfer successful' });
                    }
                );
            });
        });
    });
};

const getHistory = (req, res) => {
    const userId = req.query.userId;
    db.all(
        `SELECT * FROM transactions WHERE senderId = ? OR receiverId = ? ORDER BY date DESC`,
        [userId, userId],
        (err, rows) => {
            res.json(rows || []);
        }
    );
};

module.exports = { transferMoney, getHistory };
