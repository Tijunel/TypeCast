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
});

// Get Lobby Info 
gaming.get('/lobby/:id', withAuth, async(req, res) => {
    const response = await api.call('lobby/' + req.params.id, 'GET', {});
    if (response.status === 200) res.status(200).json(response.body).end();
    else res.sendStatus(response.status).end();
});

// Create lobby
gaming.post('/createLobby', withAuth, async(req, res) => {
    const response = await api.call('lobby/create/', 'POST', {
        json: {
            lobbyCode: req.body.lobbyCode,
            lobbyName: req.body.lobbyName,
            timeLimit: req.body.timeLimit,
            public: req.body.public, 
            players: [req.body.player]
        }
    });
    if (response.status === 200 && req.body.public) { // Emit event for people in join page
        const io = require('../server')[0];
        io.emit('new lobby', {
            lobbyCode: req.body.lobbyCode,
            lobbyName: req.body.lobbyName,
            timeLimit: req.body.timeLimit,
            public: req.body.public,
            players: [req.body.player]
        });
    } 
    res.sendStatus(response.status).end();
});

// Delete lobby
gaming.delete('/deleteLobby', withAuth, async(req, res) => {
    const response = await api.call('lobby/delete/', 'POST', {
        json: {
            lobbyCode: req.body.lobbyCode
        }
    });
    if (response.status === 200) {
        if (response.body.public) {
            const io = require('../server')[0];
            io.emit('delete lobby', {
                lobbyCode: req.body.lobbyCode
            });
        }
        res.sendStatus(200).end();
    } else res.sendStatus(response.status).end();
});

// Ready or un-ready up
gaming.post('/readyup', withAuth, async(req, res) => {
    const response = await api.call('lobby/readyup/', 'POST', {
        json: {
            ready: req.body.ready
        }
    });
    if (response.status === 200) {
        const io = require('../server')[0];
        io.emit('lobby update', {
            lobbyCode: req.body.lobbyCode,
            players: response.body.players
        });
        res.sendStatus(200).end();
    } else res.sendStatus(response.status).end();
});
// ---------------------

// Join Endpoints ------
gaming.post('/join', withAuth, async(req, res) => {
    const response = await api.call('lobby/join/', 'POST', {
        json: {
            player: req.body.player,
            lobbyCode: req.body.lobbyCode
        }
    });
    if(response.status === 200) {
        const io = require('../server')[0];
        io.emit('lobby update', {
            lobbyCode: req.body.lobbyCode,
            players: response.body.players
        });
    }
    res.sendStatus(response.status).end();
});

gaming.post('/leave', withAuth, async(req, res) => {
    const response = await api.call('lobby/leave/', 'POST', {
        json: {
            username: req.user.username
        }
    });
    if(response.status === 200) {
        const io = require('../server')[0];
        io.emit('lobby update', {
            lobbyCode: req.body.lobbyCode,
            players: response.body.players
        });
    }
    res.sendStatus(response.status).end();
});
// ---------------------

// Game Endpoints ------

// ---------------------

module.exports = gaming;