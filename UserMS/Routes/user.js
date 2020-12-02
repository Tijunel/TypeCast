'use strict';

const bcrypt = require("bcryptjs");
const User = require("../Model/User");
const express = require('express');
const user = express.Router();

// Register
user.post('/register', (req, res) => {
    // Encrypt password using bcrypt!
    // Create user if not existing and serve status, handle JWT in gateway
});

// Log In
user.post('/login', (req, res) => {
    // Check if valid, return status, handle JWT in gateway
});

// Change username and/or password
user.put('/', (req, res) => {
    //req.params.id provides the id
});

// Delete account, delete firebase too
user.delete('/', (req, res) => {

});

module.exports = user;