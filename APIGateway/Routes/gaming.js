'use strict';

const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
var api = new MSCall();
api.setPrefixURL('http://localhost:7000');
const gaming = express.Router();

// Lobby Endpoints -----
// Get all lobbies
gaming.get('/lobbies', withAuth, async (req, res) => {
    const response = await api.call('lobby/lobbies/', 'GET', {});
    if (response.status === 200) res.status(200).json(response.body).end();
    else res.status(response.status).end();
});

// Get Lobby Info 
gaming.get('/lobby/:id', withAuth, async (req, res) => {
    const response = await api.call('lobby/' + req.params.id, 'GET', {});
    if (response.status === 200) res.status(200).json(response.body).end();
    else res.status(response.status).end();
});

// Create lobby
gaming.post('/createLobby', withAuth, async (req, res) => {
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
    res.status(response.status).end();
});

// Ready or un-ready up
gaming.post('/readyup', withAuth, async (req, res) => {
    const response = await api.call('lobby/readyup/', 'POST', {
        json: {
            isReady: req.body.isReady,
            username: req.user.username,
            lobbyCode: req.body.lobbyCode
        }
    });
    if (response.status === 200) {
        const io = require('../server')[0];
        io.emit('lobby update', {
            lobbyCode: req.body.lobbyCode,
            players: response.body.players
        });
        res.status(200).end();
    } else res.status(response.status).end();
});
// ---------------------

// Join Endpoints ------
gaming.post('/join', withAuth, async (req, res) => {
    const response = await api.call('lobby/join/', 'POST', {
        json: {
            player: req.body.player,
            lobbyCode: req.body.lobbyCode
        }
    });
    if (response.status === 200) {
        const io = require('../server')[0];
        io.emit('lobby update', {
            lobbyCode: req.body.lobbyCode,
            players: response.body.players
        });
    }
    res.status(response.status).end();
});

gaming.post('/remove', withAuth, async (req, res) => {
    const response = await api.call('lobby/leave/', 'POST', {
        json: {
            username: req.body.username
        }
    });
    if (response.status === 200) {
        const io = require('../server')[0];
        io.emit('lobby update', {
            lobbyCode: req.body.lobbyCode,
            players: response.body.players
        });
    }
    res.status(response.status).end();
});
// ---------------------

// Game Endpoints ------
// Get Game Info 
gaming.get('/game/:id', withAuth, async (req, res) => {
    const response = await api.call('game/' + req.params.id, 'GET', {});
    if (response.status === 200) res.status(200).json(response.body).end();
    else res.status(response.status).end();
});

gaming.post('/start', withAuth, async (req, res) => {
    const response = await api.call('game/start/', 'POST', {
        json: {
            lobbyCode: req.body.lobbyCode
        }
    });
    if (response.status === 200) {
        const io = require('../server')[0];
        io.emit('go to game', {
            lobbyCode: req.body.lobbyCode
        });
        io.emit('lobby update', {
            lobbyCode: req.body.lobbyCode,
            players: []
        });
    }
    res.status(response.status).end();
});

gaming.post('/ready', withAuth, async (req, res) => {
    const response = await api.call('game/ready/', 'POST', {
        json: {
            lobbyCode: req.body.lobbyCode,
            username: req.user.username
        }
    });
    if(response.status === 200) {
        if(response.body.readyLeft === 0) {
            const io = require('../server')[0];
            io.emit('start game', {
                lobbyCode: req.body.lobbyCode
            });
        }
    }
    res.status(response.status).end();
}); 

gaming.post('/update', withAuth, async (req, res) => {
    const response = await api.call('game/update/', 'POST', {
        json: {
            charsFin: req.body.charsFin,
            time: req.body.time,
            username: req.user.username,
            lobbyCode: req.body.lobbyCode
        }
    });
    if(response.status === 200) {
        res.status(200).send(response.body).end();
    } else res.status(response.status).end();
});

gaming.post('/finish', withAuth, (req, res) => {
    var firebaseAPI = new MSCall();
    firebaseAPI.setPrefixURL('http://localhost:8000');
    
});
// ---------------------

module.exports = gaming;