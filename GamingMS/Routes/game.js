'use strict';

const express = require('express');
const game = express.Router();
const redis = require('../Config/redis')[0];
const asyncRedis = require('../Config/redis')[1];

game.post('/start', (req, res) => {
    if (redis.set(req.body.lobbyCode +'-inprogress', true)) res.status(200).end();
    else res.status(500).end();
});

game.post('/ingame', (req, res) => {

});

module.exports = game;