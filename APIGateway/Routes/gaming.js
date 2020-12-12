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
    socket.on('disconnect', () => {
        io.emit('disconnect', { username: userData.username });
    })
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

// Create lobby
gaming.post('/createLobby', withAuth, async(req, res) => {
    const response = await api.call('lobby/create/', 'POST', {
        json: {
            timeLimit: req.body.timeLimit,
            public: req.body.public
        }
    });
    if (response.status === 200) {
        io.emit('new lobby', {
            lobbyCode: response.body.lobbyCode,
            numPlayers: 1,
            timeLimit: req.body.timeLimit
        });
        res.status(200).json(response.body).end();
    } else res.sendStatus(response.status).end();
    // Response
    // {
    //      lobbyCode: String
    // }
    // Or Error
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
    if (response.status === 200) {
        io.emit('readyup', {
            ready: req.body.ready
        });
        res.sendStatus(200).end();
    } else res.sendStatus(response.status).end();
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
    if(response.status === 200) {
        io.emit('join', {
            username: req.user.username,
            lobbyCode: req.body.lobbyCode,
            numPlayers: response.body.numPlayers
        });
    }
    res.sendStatus(response.status).end();
    // Response: Success or Failure (200 or not 200)
});

gaming.post('/leave', withAuth, async(req, res) => {
    const response = await api.call('leave/', 'POST', {
        json: {
            username: req.user.username,
            lobbyCode: req.body.lobbyCode
        }
    });
    if(response.status === 200) {
        io.emit('leave', {
            username: req.user.username,
            lobbyCode: req.body.lobbyCode,
            numPlayers: response.body.numPlayers
        });
    }
    res.sendStatus(response.status).end();
    // Response: Success or Failure (200 or not 200)
});
// ---------------------

// Game Endpoints ------

// ---------------------

module.exports = gaming;