const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiter');

// Create initial admin (protected, one-time setup)
router.post('/create-admin', async (req, res) => {
    try {
        const adminExists = await User.findOne({ email: 'admin@gmail.com' });
        if (adminExists) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        const admin = new User({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: 'admin123',
            role: 'admin'
        });

        await admin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Register a new user
router.post('/register', authLimiter, validateRegister, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            role: 'student' // Default to student
        });

        await user.save();

        // Generate token with expiration (24 hours)
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
router.post('/login', authLimiter, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // First check if this is an admin login
        const adminCredentials = [
            {
                email: 'admin@gmail.com',
                password: 'admin123'
            }
        ];

        const isAdmin = adminCredentials.find(
            admin => admin.email.toLowerCase() === email.toLowerCase() && 
            admin.password === password
        );

        if (isAdmin) {
            // Create or update admin user in database
            let adminUser = await User.findOne({ email: email.toLowerCase() });
            
            if (!adminUser) {
                adminUser = new User({
                    name: 'Admin',
                    email: email.toLowerCase(),
                    password: password,
                    role: 'admin'
                });
                await adminUser.save();
            }

            const token = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET);
            return res.json({
                token,
                user: {
                    id: adminUser._id,
                    name: adminUser.name,
                    email: adminUser.email,
                    role: 'admin'
                }
            });
        }

        // If not admin, proceed with regular user login
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token with expiration (24 hours)
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users (admin only)
router.get('/users', auth, async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        // Fetch all users
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        
        // Add last login info (you can implement this later)
        const usersWithActivity = users.map(user => ({
            ...user.toObject(),
            lastLogin: user.createdAt, // For now, using createdAt as lastLogin
            active: true // You can implement actual active status later
        }));

        res.json(usersWithActivity);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user (admin only)
router.delete('/users/:id', auth, async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const userId = req.params.id;

        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        // Find and delete user
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 