'use strict';

const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
const api = new MSCall();
api.setURLPrefix('http://localhost:9000');
const users = express.Router();

// Register
users.post('/register', async(req, res) => {
    // Create user if not existing and serve JWT if successful
});

// Log In
users.post('/login', async(req, res) => {
    // Check if valid with microservice, if valid, serve JWT
});

// Validate Token (Middleware does all the work)
users.get('/validate', withAuth, async(req, res) => {
    res.sendStatus(200).end();
});

// Invalidate Token (Sign Out)
users.get('/invalidate', withAuth, async(req, res) => {
    const payload = {};
    const token = jwt.sign(payload, "", { expiresIn: "1" });
    res.cookie("token", token, { httpOnly: true });
    res.sendStatus(200).end();
});

users.put('/:id', withAuth, async(req, res) => {

});

module.exports = users;