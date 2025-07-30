const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user'); // Import the user model 
const Candidate = require('../models/candidate'); // Import the user model 
const { jwtMiddleware, generateToken } = require('../routes/jwt'); // Import JWT authentication middleware


const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId); // Find user by ID
         if (!user) {
            console.warn('User not found for ID:', userId); // Optional: debug info
            return false;
        }
        return user.role === 'admin'; // Check if user has admin role
    } catch (error) {
        console.error('Error checking admin role:', error);
        return false; // Default to false if there's an error  
    }
}

// Route to add a new candidate
router.post('/',jwtMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ error: 'Forbidden: Only admins can add candidates' });
        }
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save(); // Save the new user to the database
        res.status(200).json({ message: 'candidate created successfully', response: response}); // Return the created person and token});
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


// Route to update candidate details
router.put('/:candidateID',jwtMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ error: 'Forbidden: Only admins can add candidates' });
        }
        const candidateID = req.params.candidateID; // Get candidate ID from request parameters
        console.log('Received candidate ID:', candidateID);
        // ✅ Check if the id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(candidateID)) {
            return res.status(404).json({ error: 'Invalid person ID' });
        }
        const updatedCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true
        });
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.status(200).json(response);
    } catch (error) {
        console.error('Error in PUT /person/:id:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to delete a candidate
router.delete('/:candidateID',jwtMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ error: 'Forbidden: Only admins can delete candidates' });
        }
        const candidateID = req.params.candidateID; // Get candidate ID from request parameters
        // ✅ Check if the id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(candidateID)) {
            return res.status(404).json({ error: 'Invalid person ID' });
        }
        const response = await Candidate.findByIdAndDelete(candidateID); 
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /person/:id:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;