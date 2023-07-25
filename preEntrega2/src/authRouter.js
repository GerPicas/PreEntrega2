const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            role,
        });

        await user.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.user = user;
        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
});

module.exports = router;
