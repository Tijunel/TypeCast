'use strict';

const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
var api = new MSCall();
api.setPrefixURL('http://localhost:8000');
const userData = express.Router();

// Get all game information for specified user
userData.get('/games', withAuth, async (req, res) => {
    const response = await api.call('games/' + req.user.ID, 'GET', {});
    if (response.status === 200) 
        res.status(200).json({ lpm: response.body.lpm, body: response.body.games }).end();
    else res.sendStatus(response.status).end();
});

// Add a new game (Trigger after finishing a game)
userData.post('/game', withAuth, async (req, res) => {
    const response = await api.call('games/' + req.user.ID, 'POST', {
        json: {
            placement: req.body.placement,
            typingSpeed: req.body.typingSpeed,
            time: req.body.time,
            date: new Date()
        }
    });
    res.sendStatus(response.status).end();
});

// Delete all game history to get a fresh start
userData.delete('/games', withAuth, async (req, res) => {
    const response = await api.call('games/' + req.user.ID, 'DELETE', {});
    res.sendStatus(response.status).end();
});

module.exports = userData;