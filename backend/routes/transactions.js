const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get Balance
router.get('/balance', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ balance: user.balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Transfer Money
router.post('/transfer', auth, async (req, res) => {
    try {
        const { receiverEmail, amount } = req.body;
        const senderId = req.user.id;

        if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        const sender = await User.findById(senderId);
        if (sender.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) return res.status(404).json({ error: 'Receiver not found' });
        if (receiver._id.equals(sender._id)) return res.status(400).json({ error: 'Cannot transfer to yourself' });

        // Atomic-ish update
        sender.balance -= amount;
        receiver.balance += amount;

        await sender.save();
        await receiver.save();

        const transaction = new Transaction({
            senderId: sender._id,
            receiverId: receiver._id,
            senderName: sender.name,
            receiverName: receiver.name,
            amount
        });
        await transaction.save();

        res.json({ message: 'Transfer successful', newBalance: sender.balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Transaction History
router.get('/history', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
        }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
