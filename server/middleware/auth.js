const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Check if Authorization header exists
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Please authenticate. No token provided.' });
        }

        // Extract token
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Please authenticate. Invalid token format.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findOne({ _id: decoded.userId }).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'Please authenticate. User not found.' });
        }

        // Attach token and user to request
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Please authenticate. Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Please authenticate. Token expired.' });
        }
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        // Ensure auth middleware was called first
        if (!req.user) {
            return res.status(401).json({ error: 'Please authenticate first.' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Middleware to check if user is student
const isStudent = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Please authenticate first.' });
        }

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Access denied. Student only.' });
        }
        next();
    } catch (error) {
        console.error('Student middleware error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { auth, isAdmin, isStudent };
