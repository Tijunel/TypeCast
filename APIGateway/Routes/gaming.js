'use strict';

const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
var api = new MSCall();
api.setPrefixURL('http://localhost:7000');
const gaming = express.Router();

// Lobby Endpoints -----
// Get all lobbies
gaming.get('/lobbies', withAuth, async(req, res) => {
    const response = await api.call('lobby/lobbies/', 'GET', {});
    if (response.status === 200) res.status(200).json(response.body).end();
    else res.sendStatus(response.status).end();
    // Response:
    // {
    //    lobbies: [{
    //      lobbyCode: String,
    //      name: String,
    //      numPlayers: Integer
    //    },...]
    // }
    // Or Error
});

// Create lobby
gaming.post('/create', withAuth, async(req, res) => {
    const response = await api.call('lobby/create/', 'POST', {});
    if (response.status === 200) res.status(200).json(response.body).end();
    else res.sendStatus(response.status).end();
    // Response
    // {
    //      lobbyCode: String
    // }
    // Or Error
});

// Ready or un-ready up
gaming.post('/readyup', withAuth, async(req, res) => {
    const response = await api.call('lobby/readyup/', 'POST', {
        json: {
            ready: req.body.ready
        }
    });
    if (response.status === 200) res.sendStatus(200).end();
    else res.sendStatus(response.status).end();
    // Response: Success or error
});
// ---------------------

// Join Endpoints ------
gaming.post('/join', withAuth, async(req, res) => {
    const response = await api.call('join/', 'POST', {
        json: {
            username: req.user.username,
            lobbyCode: req.body.lobbyCode
        }
    });
    res.sendStatus(response.status).end();
    // Response: Success or Failure (200 or not 200)
});
// ---------------------

// Game Endpoints ------

// ---------------------

module.exports = gaming;