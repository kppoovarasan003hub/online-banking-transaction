const { pool } = require('../../db');

const register = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id`,
            [name, email, password, phone]
        );
        const userId = result.rows[0].id;
        const accNum = 'ACC' + Math.floor(100000 + Math.random() * 900000);
        await pool.query(
            `INSERT INTO accounts (accountnumber, userid, balance) VALUES ($1, $2, $3)`,
            [accNum, userId, 1000.0]
        );
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(400).json({ error: 'User already exists or database error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
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
