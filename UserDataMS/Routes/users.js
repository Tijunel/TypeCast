'use strict';

const express = require("express");
const users = express.Router();

// Create new user entry in firebase on registration
users.post('/', (req, res) => {
    
});

// Delete user when they delete their account
users.delete('/', (req, res) => {

});

module.exports = users;