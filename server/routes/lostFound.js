const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const { validateLostFoundItem } = require('../middleware/validators');
const LostFound = require('../models/LostFound');
const User = require('../models/User');

// Get all lost and found items
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/lost-found - Fetching all items');
        const items = await LostFound.find()
            .sort({ createdAt: -1 })
            .lean(); // Convert to plain JavaScript objects
        
        // Fetch user names for all items and ensure reporterName is set
        const itemsWithReporters = await Promise.all(items.map(async (item) => {
            let userId = null;
            let reporterName = null;
            let reporterEmail = '';
            
            // Extract user ID from reportedBy field
            if (!item.reportedBy) {
                userId = null;
            } else if (typeof item.reportedBy === 'string') {
                userId = item.reportedBy;
            } else if (item.reportedBy && typeof item.reportedBy === 'object') {
                if (item.reportedBy._id) {
                    userId = item.reportedBy._id.toString();
                } else if (item.reportedBy.toString) {
                    userId = item.reportedBy.toString();
                } else {
                    userId = String(item.reportedBy);
                }
                
                // Check if already populated
                if (item.reportedBy.name) {
                    reporterName = item.reportedBy.name;
                    reporterEmail = item.reportedBy.email || '';
                }
            } else {
                userId = item.reportedBy ? item.reportedBy.toString() : null;
            }
            
            // Use stored reporterName if available
            if (item.reporterName) {
                reporterName = item.reporterName;
            }
            
            // If we still don't have the name, fetch it from database
            if (!reporterName && userId && mongoose.Types.ObjectId.isValid(userId)) {
                try {
                    const user = await User.findById(userId).select('name email');
                    if (user) {
                        reporterName = user.name;
                        reporterEmail = user.email || '';
                        // Update the item in database with reporterName for future queries
                        await LostFound.findByIdAndUpdate(item._id, { reporterName: user.name });
                        console.log(`✅ Fetched and saved reporter name "${user.name}" for item ${item._id}`);
                    } else {
                        console.log(`⚠️ User not found for ID: ${userId}`);
                        reporterName = 'Unknown Reporter';
                    }
                } catch (err) {
                    console.error(`❌ Error fetching user for ID ${userId}:`, err.message);
                    reporterName = 'Unknown Reporter';
                }
            } else if (!reporterName) {
                reporterName = 'Unknown Reporter';
            }
            
            // Format reportedBy for frontend
            item.reportedBy = {
                _id: userId || '',
                name: reporterName,
                email: reporterEmail
            };
            item.reporterName = reporterName; // Ensure reporterName is always set
            
            return item;
        }));
        
        console.log(`✅ Returning ${itemsWithReporters.length} items with reporter names`);
        res.json(itemsWithReporters);
    } catch (error) {
        console.error('❌ Error in GET /api/lost-found:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add a new lost or found item
router.post('/', auth, validateLostFoundItem, async (req, res) => {
    try {
        console.log('POST /api/lost-found - Adding new item');
        console.log('Request body:', req.body);
        console.log('Current user:', req.user);
        
        const { title, description, type, location, date, contact, imageUrl, reportedBy } = req.body;
        
        // Get user info - ensure we have the current user's name
        const currentUser = await User.findById(req.user.id).select('name email');
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Create new item with reporter name stored directly
        const newItem = new LostFound({
            title,
            description,
            type,
            location,
            date,
            contact,
            imageUrl: imageUrl || '',
            reportedBy: reportedBy || req.user.id,
            reporterName: currentUser.name, // Store reporter name directly
            claimed: false
        });
        
        // Save to database
        await newItem.save();
        
        // Populate reporter information before sending response (for compatibility)
        await newItem.populate('reportedBy', 'name email');
        
        // Ensure reporterName is set in response
        if (!newItem.reporterName && newItem.reportedBy && newItem.reportedBy.name) {
            newItem.reporterName = newItem.reportedBy.name;
        }
        
        console.log('Created new item:', {
            id: newItem._id,
            title: newItem.title,
            reporterName: newItem.reporterName,
            reportedBy: newItem.reportedBy
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error in POST /api/lost-found:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark an item as claimed
router.post('/:id/mark-claimed', auth, async function(req, res) {
    try {
        console.log('POST /api/lost-found/:id/mark-claimed - Marking item as claimed');
        const itemId = req.params.id;
        const userId = req.body.userId || req.user.id;
        const userRole = req.user.role;

        console.log('Item ID:', itemId);
        console.log('User ID:', userId);
        console.log('User Role:', userRole);
        
        // Find the item and populate reportedBy if needed
        const item = await LostFound.findById(itemId).populate('reportedBy', 'name email');
        
        if (!item) {
            console.log('Item not found');
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Allow admin or the reporter to mark as claimed
        // Handle both populated user object and ObjectId
        const reportedById = item.reportedBy._id 
            ? item.reportedBy._id.toString() 
            : (item.reportedBy.toString ? item.reportedBy.toString() : item.reportedBy);
        const canMarkClaimed = userRole === 'admin' || reportedById === userId.toString();
        
        if (!canMarkClaimed) {
            console.log('User not authorized');
            return res.status(403).json({ 
                message: 'Not authorized to mark this item as claimed'
            });
        }
        
        // Update the item
        item.claimed = true;
        item.claimedAt = new Date();
        await item.save();
        
        console.log('Item marked as claimed successfully');
        res.json({ 
            success: true,
            message: 'Item marked as claimed successfully',
            claimed: true,
            claimedAt: item.claimedAt
        });
    } catch (error) {
        console.error('Error marking item as claimed:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Unmark an item as claimed (Admin only)
router.post('/:id/unmark-claimed', auth, async function(req, res) {
    try {
        console.log('POST /api/lost-found/:id/unmark-claimed - Unmarking item as claimed');
        const itemId = req.params.id;
        const userRole = req.user.role;

        // Only admin can unmark as claimed
        if (userRole !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin only.'
            });
        }
        
        // Find the item
        const item = await LostFound.findById(itemId);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Update the item
        item.claimed = false;
        item.claimedAt = null;
        await item.save();
        
        console.log('Item unmarked as claimed successfully');
        res.json({ 
            success: true,
            message: 'Item unmarked as claimed successfully',
            claimed: false,
            claimedAt: null
        });
    } catch (error) {
        console.error('Error unmarking item as claimed:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an item (Admin only)
router.delete('/:id', auth, async function(req, res) {
    try {
        console.log('DELETE /api/lost-found/:id - Deleting item');
        const itemId = req.params.id;
        const userRole = req.user.role;

        // Only admin can delete items
        if (userRole !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin only.'
            });
        }
        
        // Find and delete the item
        const item = await LostFound.findByIdAndDelete(itemId);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        console.log('Item deleted successfully');
        res.json({ 
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 