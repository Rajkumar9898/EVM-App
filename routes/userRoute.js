const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user'); // Import the user model 
const { jwtMiddleware, generateToken } = require('../routes/jwt'); // Import JWT authentication middleware

// Route to create a new user
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const newUser = new User(data); //
        const response = await newUser.save(); // Save the new user to the database

        const payload = { id: response._id }
        const token = generateToken(payload); // Generate JWT token
        res.status(200).json({ message: 'User created successfully', response: response, token: token }); // Return the created person and token});
    } catch (error) {
        if (error.code === 11000) {
            // This is a MongoDB duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ error: `${field} already exists` });
        }
        console.error('Error in POST /person:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to login a person
router.post('/login', async (req, res) => {
    try {
        const { addharCardNumber, password } = req.body; // Get email and password from request body
        const user = await User.findOne({ addharCardNumber: addharCardNumber });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' }); // If user not found or password doesn't match
        }
        const payload = { id: user._id }; // Create payload for JWT
        const token = generateToken(payload); // Generate JWT token
        res.json({ token }); // Return the token 
    }
    catch (error) {
        console.error('Error in POST /person/login:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/profile', jwtMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from JWT payload
        const user = await Person.findById(userId); // Find user by ID
        if (!user) {
            return res.status(404).json({ error: 'User not found' }); // If user not found
        }
        res.status(200).json(user); // Return user data
    } catch (error) {
        console.error('Error in GET /person/me:', error);
        res.status(500).json({ error: 'Internal Server Error' }); // Handle server error
    }
});


// Route to update user password
router.put('/profile/password', jwtMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body; // Get old and new passwords from request body
        const user = await User.findById(userId); // Find user by ID
        if (!(await user.comparePassword(oldPassword))) {
            return res.status(401).json({ error: 'Invalid old password' }); // If user not found or old password doesn't match
        }
        user.password = newPassword; // Update password
        await user.save(); // Save updated user
        res.status(200).json({ message: 'Password updated successfully' }); // Return success message 
    } catch (error) {
        console.error('Error in PUT /person/:id:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;