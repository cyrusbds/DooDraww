const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const User = require('./models/user');
const Drawing = require('./models/drawing');
const { auth, authRedirect } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'Assets')));
// Fallback for uppercase Assets for backward compatibility
app.use('/Assets', express.static(path.join(__dirname, 'Assets')));

// MongoDB connection
mongoose.connect(MONGODB_URI, {})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));



// User logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Check auth status
app.get('/api/auth/check', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            authenticated: true, 
            userId: req.session.userId, 
            name: req.session.userName 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Create new drawing
app.post('/api/drawings', async (req, res) => {
    const { userId, title, imageData, isPublic } = req.body;

    try {
        const newDrawing = new Drawing({
            userId,
            title: title || 'Untitled Drawing',
            imageData,
            isPublic: isPublic !== false
        });

        await newDrawing.save();
        res.status(201).json(newDrawing);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all public drawings
app.get('/api/drawings/public', async (req, res) => {
    try {
        const drawings = await Drawing.find({ isPublic: true })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        
        res.json(drawings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's drawings
app.get('/api/drawings/user/:userId', async (req, res) => {
    try {
        const drawings = await Drawing.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });
        
        res.json(drawings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single drawing
app.get('/api/drawings/:id', async (req, res) => {
    try {
        const drawing = await Drawing.findById(req.params.id)
            .populate('userId', 'name');
        
        if (!drawing) {
            return res.status(404).json({ error: 'Drawing not found' });
        }
        
        res.json(drawing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete drawing
app.delete('/api/drawings/:id', async (req, res) => {
    try {
        const drawing = await Drawing.findByIdAndDelete(req.params.id);
        
        if (!drawing) {
            return res.status(404).json({ error: 'Drawing not found' });
        }
        
        res.json({ message: 'Drawing deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== FAVORITES ENDPOINTS =====

// Add to favorites
app.post('/api/favorites', async (req, res) => {
    const { userId, drawingId } = req.body;
    
    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.favorites.includes(drawingId)) {
            return res.status(400).json({ error: 'Already in favorites' });
        }
        
        user.favorites.push(drawingId);
        await user.save();
        
        res.json({ message: 'Added to favorites' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove from favorites
app.delete('/api/favorites/:userId/:drawingId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.favorites = user.favorites.filter(id => id.toString() !== req.params.drawingId);
        await user.save();
        
        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user favorites
app.get('/api/favorites/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('favorites');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Routes
const users = require('./routes/users');
app.use('/api/users', users);

// Landing page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Account page route
app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/account.html'));
});

// Profile page route
app.get('/profile', authRedirect, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/profile.html'));
});

// For local development: listen on port
if (process.env.VERCEL !== '1') {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

// Export for Vercel serverless
module.exports = app;
