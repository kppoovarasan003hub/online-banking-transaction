const { sql } = require('../../db');

const register = async (req, res) => {
    const { name, email, password, phone } = req.body;
    const hashedPassword = password; 

    try {
        const result = await sql`
            INSERT INTO users (name, email, password, phone) 
            VALUES (${name}, ${email}, ${hashedPassword}, ${phone}) 
            RETURNING id
        `;
        
        const userId = result.rows[0].id;
        const accNum = 'ACC' + Math.floor(100000 + Math.random() * 900000);
        
        await sql`
            INSERT INTO accounts (accountNumber, userId, balance) 
            VALUES (${accNum}, ${userId}, 1000.0)
        `;

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(400).json({ error: 'User already exists or database error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
        const user = rows[0];

        if (!user) return res.status(401).json({ error: 'User not found' });
        if (user.password !== password) return res.status(401).json({ error: 'Invalid password' });

        const token = 'mock-jwt-token-' + user.id;

        res.json({ 
            token, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
};

module.exports = { register, login };
