'use strict';

const express = require('express');
const game = express.Router();
const redis = require('../Config/redis')[0];
const asyncRedis = require('../Config/redis')[1];
const snippets = require('./snippets')[0];

game.get('/:id', async (req, res) => {
    var value = await asyncRedis.get(req.params.id + '-game').then(value => {
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
        player.finished = false;
    }
    game.code = snippets[Math.floor(Math.random() * snippets.length)];
    redis.set(game.lobbyCode + '-game', JSON.stringify(game));
    res.status(200).end();
});

// Make sure everyone is in the game
game.post('/ready', async (req, res) => {
    var game = await asyncRedis.get(req.body.lobbyCode + '-game').then(value => {
        return JSON.parse(value);
    });
    for (let player of game.players)
        if (player.username === req.body.username)
            player.isReady = true;
    redis.set(game.lobbyCode + '-game', JSON.stringify(game));
    let readyLeft = game.players.length;
    for (let player of game.players)
        if (player.isReady)
            readyLeft -= 1;
    res.status(200).json({ readyLeft: readyLeft }).end();
});

game.post('/update', async (req, res) => {
    var game = await asyncRedis.get(req.body.lobbyCode + '-game').then(value => {
        return JSON.parse(value);
    });
    for (let player of game.players) {
        if (player.username === req.body.username) {
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
    redis.set(req.body.lobbyCode + '-game', JSON.stringify(game));
    res.status(200).json(updates).end();
});

// End point for each player 
game.post('/delete', async (req, res) => {
    var game = await asyncRedis.get(req.body.lobbyCode + '-game').then(value => {
        return JSON.parse(value);
    });
    for (let player of game.players)
        if (player.username === req.body.username)
            player.finished = true;
    let deleteDB = true;
    for (let player of game.players)
        if (!player.finished) deleteDB = false;
    if (deleteDB) redis.del(req.body.lobbyCode + '-game');
    else redis.set(req.body.lobbyCode + '-game', JSON.stringify(game));
    res.status(200).end();
});

module.exports = game;