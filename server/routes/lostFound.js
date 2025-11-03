const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const { validateLostFoundItem } = require('../middleware/validators');

// Define the schema
const lostFoundSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['lost', 'found'], required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    contact: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    reportedBy: { type: String, required: true },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date, default: null }
}, {
    timestamps: true
});

// Create the model if it doesn't exist
const LostFound = mongoose.models.LostFound || mongoose.model('LostFound', lostFoundSchema);

// Get all lost and found items
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/lost-found - Fetching all items');
        const items = await LostFound.find().sort({ createdAt: -1 });
        console.log(`Found ${items.length} items`);
        res.json(items);
    } catch (error) {
        console.error('Error in GET /api/lost-found:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new lost or found item
router.post('/', auth, validateLostFoundItem, async (req, res) => {
    try {
        console.log('POST /api/lost-found - Adding new item');
        console.log('Request body:', req.body);
        
        const { title, description, type, location, date, contact, imageUrl, reportedBy } = req.body;
        
        // Create new item
        const newItem = new LostFound({
            title,
            description,
            type,
            location,
            date,
            contact,
            imageUrl: imageUrl || '',
            reportedBy: reportedBy || req.user.id,
            claimed: false
        });
        
        // Save to database
        await newItem.save();
        console.log('Created new item:', newItem);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error in POST /api/lost-found:', error);
        res.status(500).json({ message: 'Server error' });
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
        
        // Find the item
        const item = await LostFound.findById(itemId);
        
        if (!item) {
            console.log('Item not found');
            return res.status(404).json({ message: 'Item not found' });
        }
        
        // Allow admin or the reporter to mark as claimed
        const canMarkClaimed = userRole === 'admin' || item.reportedBy.toString() === userId.toString();
        
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