const db = require('../../db');
// Note: In a real app, use: const bcrypt = require('bcryptjs'); const jwt = require('jsonwebtoken');
// For demonstration, we'll use simple hashing if modules are missing.

const register = (req, res) => {
    const { name, email, password, phone } = req.body;
    
    // Hash password (Mocked here for simplicity)
    const hashedPassword = password; // In real: await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, phone],
        function(err) {
            if (err) return res.status(400).json({ error: 'User already exists' });
            
            const userId = this.lastID;
            // Create a default account for the new user
            const accNum = 'ACC' + Math.floor(100000 + Math.random() * 900000);
            db.run(`INSERT INTO accounts (accountNumber, userId, balance) VALUES (?, ?, ?)`, [accNum, userId, 1000.0], (err) => {
                res.status(201).json({ message: 'User registered successfully', userId });
            });
        }
    );
};

const login = (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'User not found' });
        
        // Check password (Mocked)
        if (user.password !== password) return res.status(401).json({ error: 'Invalid password' });

        // Generate Token (Mocked)
        const token = 'mock-jwt-token-' + user.id;

        res.json({ 
            token, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role } 
        });
    });
};

module.exports = { register, login };
