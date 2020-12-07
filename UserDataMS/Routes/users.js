'use strict';

const express = require("express");
const users = express.Router();
const firebase = require('../Config/firebase');

// Create new user entry in firebase on registration
users.post('/', (req, res) => {
    try {
        console.log(req);
        const newUserRef = firebase.database().ref('users').push();
        res.user.userID = newUserRef.key;
        res.status(200);
    } catch (e) {
        res.status(500).send('Error creating user!').end();
    }

});

// Delete user when they delete their account
users.delete('/', (req, res) => {
    try {
        const userID = req.user.userID; //TODO: Verify that this is the correct way to get the UserID
        const userRef = firebase.database().ref('users/' + userID);
        userRef.remove();
    } catch (e) {
        res.status(500).send('Error deleting user!').end();
    }

});

module.exports = users;