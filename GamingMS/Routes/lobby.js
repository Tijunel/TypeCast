'use strict';

const express = require('express');
const lobby = express.Router();
const redis = require('../Config/redis')[0];
const asyncRedis = require('../Config/redis')[1];

lobby.get('/lobbies', async(req, res) => {
    redis.keys('*', async (err, keys) => {
        let values = [];
        if (err) return res.sendStatus(500).end();
        if (keys) {
            for(let key of keys) {
                var value = await asyncRedis.get(key).then(value => {
                    return JSON.parse(value);
                });
                values.push(value);
            }
        }
        res.status(200).json({ lobbies: values }).end();
    });
});

lobby.post('/create', (req, res) => {
    redis.set(req.body.lobbyCode, JSON.stringify(req.body));
    res.sendStatus(200).end();
});

lobby.delete('/delete', (req, res) => {
    client.del(req.body.lobbyCode);
    res.sendStatus(200).end();
});

lobby.post('/readyup', (req, res) => {

});

lobby.post('/join', (req, res) => {

});

lobby.post('/leave', (req, res) => {

});

module.exports = lobby;