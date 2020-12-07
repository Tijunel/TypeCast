'use strict';

const express = require('express');
const users = express.Router();
const firebase = require('../Config/firebase');

// Delete user when they delete their account
users.delete('/:id', (req, res) => {
    try {
        const userID = req.params.id; 
        const userRef = firebase.database().ref('users/' + userID);
        userRef.remove()
            .then(() => { res.sendStatus(200).end(); })
            .catch(error => { res.sendStatus(500).end(); });
    } catch (error) {
        res.sendStatus(500).end();
    }
});

module.exports = users;