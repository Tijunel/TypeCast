'use strict';

const express = require('express');
const game = express.Router();
const redis = require('../Config/redis')[0];
const asyncRedis = require('../Config/redis')[1];

game.get('/:id', async (req, res) => {
    var value = await asyncRedis.get(req.params.id+'-game').then(value => {
        return JSON.parse(value);
    });
    if (value !== null) res.status(200).json(value).end();
    else res.status(500).end();
});

game.post('/start', async (req, res) => {
    var game = await asyncRedis.get(req.body.lobbyCode).then(value => {
        return JSON.parse(value);
    });
    for (let player of game.players) {
        player.isReady = false;
        player.charsFin = 0;
        player.time = 0;
    }
    redis.set(game.lobbyCode+'-game', JSON.stringify(game));
    res.status(200).end();
});

// Make sure everyone is in the game
game.post('/ready', async (req, res) => {
    var game = await asyncRedis.get(req.body.lobbyCode+'-game').then(value => {
        return JSON.parse(value);
    });
    for (let player of game.players)
        if (player.username === req.body.username)
            player.isReady = true;
    redis.set(game.lobbyCode+'-game', JSON.stringify(game));
    let readyLeft = game.players.length;
    for (let player of game.players)
        if (player.isReady) 
            readyLeft -= 1;
    res.status(200).json({ readyLeft: readyLeft }).end();
});

game.post('/update', async (req, res) => {
    var game = await asyncRedis.get(req.body.lobbyCode+'-game').then(value => {
        return JSON.parse(value);
    });
    for (let player of game.players) {
        if(player.username === req.body.username) {
            player.charsFin = req.body.charsFin;
            player.time = req.body.time;
        }
    }
    let updates = [];
    for (let player of game.players) {
        updates.push({
            name: player.username,
            charsFin: player.charsFin,
            time: player.time
        });
    }   
    redis.set(req.body.lobbyCode+'-game', JSON.stringify(game));
    res.status(200).json(updates).end();
});

// End point for each player 
game.post('/delete', (req, res) => {
    // If this is called, 
});

module.exports = game;