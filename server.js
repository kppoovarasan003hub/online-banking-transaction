const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Routes (We'll create these files next)
const authRoutes = require('./backend/routes/authRoutes');
const accountRoutes = require('./backend/routes/accountRoutes');
const transactionRoutes = require('./backend/routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Banking System Backend running at http://localhost:${PORT}`);
});
