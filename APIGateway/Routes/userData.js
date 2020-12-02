'use strict';

const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
const api = new MSCall();
api.setURLPrefix('http://localhost:8000');
const userData = express.Router();

// Firebase structure:
// root
//      users
//          userID:
//              games:
//                  gameID:
//                      placement: string ('x/y') where x > 0, x <= y and ymax = 6
//                      typingSpeed: float
//                      time: float (seconds)
//                      date: UTC

// Get all game information for specified user
userData.get('/games', withAuth, async(req, res) => {
    const games = await api.call('/games/', 'GET', {});
    if (games.status === 200) res.status(200).json(games.body).end();
    else res.sendStatus(games.status).end();
});

// Add a new game (Trigger after finishing a game)
userData.post('/game', withAuth, async(req, res) => {

});

// Delete all game history to get a fresh start
userData.delete('/', withAuth, async(req, res) => {

});

module.exports = userData;