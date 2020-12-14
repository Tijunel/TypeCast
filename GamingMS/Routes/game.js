'use strict';

const express = require('express');
const game = express.Router();
const redis = require('../Config/redis')[0];

game.get('/:id', async (req, res) => {
    var value = await asyncRedis.get(req.params.id+'-game').then(value => {
        return JSON.parse(value);
    });
    if (value !== null) res.status(200).json(value).end();
    else res.status(500).end();
});

game.post('/start', async (req, res) => {
    var game = await asyncRedis.get(req.body.lobbyCode+'-game').then(value => {
        return JSON.parse(value);
    });
    for (let player of game.players) {
        player.isReady = false;
        player.charsFin = 0;
        player.time = 0;
    }
    redis.set(lobby.lobbyCode+'-game', JSON.stringify(lobby));
    res.status(200).end();
});

// Make sure everyone is in the game
game.post('/ready', async (req, res) => {
    var lobby = await asyncRedis.get(req.body.lobbyCode+'-game').then(value => {
        return JSON.parse(value);
    });
    for (let player of lobby.player)
        if (player.username === req.body.username)
            player.isReady = true;
    redis.set(lobby.lobbyCode+'-game', JSON.stringify(lobby));
    let readyLeft = lobby.players.length;
    for (let player of lobby.player)
        if (player.isReady) 
            readyLeft -= 1;
    res.status(200).json({ readyLeft: readyLeft }).end();
});

// End point for each player 
game.post('/finish', (req, res) => {

});

module.exports = game;