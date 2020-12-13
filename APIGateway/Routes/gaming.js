'use strict';

const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
var api = new MSCall();
api.setPrefixURL('http://localhost:7000');
const gaming = express.Router();

// Set up socket.io
const server = require('../server');
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    const userData = cookieParser.JSONCookie(cookie.parse(socket.handshake.headers.cookie).userData);
    socket.on('disconnect', async() => {
        const response = await api.call('leave/', 'POST', {
            json: {
                username: userData.username
            }
        });
        if(response.status === 200) {
            io.emit('lobby update', {
                lobbyCode: req.body.lobbyCode,
                players: response.body.players
            });
        }
    });
});

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
            player: req.body.player
        }
    });
    if (response.status === 200 && req.body.public) { // Emit event for people in join page
        io.emit('new lobby', {
            lobbyCode: req.body.lobbyCode,
            lobbyName: req.body.lobbyName
        });
    } 
    res.sendStatus(response.status).end();
});

// Delete lobby
gaming.post('/deleteLobby', withAuth, async(req, res) => {
    const response = await api.call('lobby/delete/', 'POST', {
        json: {
            lobbyCode: req.body.lobbyCode
        }
    });
    if (response.status === 200) {
        if (response.body.public) {
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
        io.emit('readyup', {
            ready: req.body.ready
        });
        res.sendStatus(200).end();
    } else res.sendStatus(response.status).end();
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
    if(response.status === 200) {
        io.emit('lobby update', {
            lobbyCode: req.body.lobbyCode,
            players: response.body.players
        });
    }
    res.sendStatus(response.status).end();
});

gaming.post('/leave', withAuth, async(req, res) => {
    const response = await api.call('leave/', 'POST', {
        json: {
            username: req.user.username
        }
    });
    if(response.status === 200) {
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