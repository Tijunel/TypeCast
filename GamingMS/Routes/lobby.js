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

lobby.get('/:id', async(req, res) => {
    var value = await asyncRedis.get(req.params.id).then(value => {
        return JSON.parse(value);
    });
    if(value !== null) res.status(200).json(value).end();
    else res.sendStatus(500).end();
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