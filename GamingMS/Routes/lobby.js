'use strict';

const express = require('express');
const lobby = express.Router();
const redis = require('../Config/redis')[0];
const asyncRedis = require('../Config/redis')[1];

lobby.get('/lobbies', async (req, res) => {
    redis.keys('*', async (err, keys) => {
        let values = [];
        if (err) return res.sendStatus(500).end();
        if (keys) {
            for (let key of keys) {
                if(key.length === 4) {
                    var value = await asyncRedis.get(key).then(value => {
                        return JSON.parse(value);
                    });
                    values.push(value);
                }
            }
        }
        res.status(200).json({ lobbies: values }).end();
    });
});

lobby.get('/:id', async (req, res) => {
    var value = await asyncRedis.get(req.params.id).then(value => {
        return JSON.parse(value);
    });
    if (value !== null) res.status(200).json(value).end();
    else res.status(500).end();
});

lobby.post('/create', (req, res) => {
    redis.set(req.body.lobbyCode, JSON.stringify(req.body));
    res.status(200).end();
});

lobby.delete('/delete', (req, res) => {
    redis.del(req.body.lobbyCode);
    res.status(200).end();
});

lobby.post('/readyup', async (req, res) => {
    var value = await asyncRedis.get(req.body.lobbyCode).then(value => {
        return JSON.parse(value);
    });
    if (value !== null) {
        for (let player of value.players)
            if (player.username === req.body.username)
                player.isReady = req.body.isReady;
        redis.set(value.lobbyCode, JSON.stringify(value));
        res.status(200).json({ players: value.players }).end();
    } else res.status(500).end();
});

lobby.post('/join', async (req, res) => {
    var value = await asyncRedis.get(req.body.lobbyCode).then(value => {
        return JSON.parse(value);
    });
    if (value !== null) {
        for (let player of value.players)
            if (player.username === req.body.player.username)
                return res.sendStatus(500).end();
        value.players.push(req.body.player);
        redis.set(req.body.lobbyCode, JSON.stringify(value));
        res.status(200).json({ players: value.players }).end();
    } else res.status(500).end();
});

lobby.post('/leave', (req, res) => {
    redis.keys('*', async (err, keys) => {
        let values = [];
        if (err) return res.sendStatus(500).end();
        if (keys) {
            for (let key of keys) {
                if (key.length === 4) {
                    var value = await asyncRedis.get(key).then(value => {
                        return JSON.parse(value);
                    });
                    values.push(value);
                }
            }
        }
        let target = null;
        for (let value of values) {
            for (let player of value.players) {
                if (player.username === req.body.username) {
                    target = value;
                    if (player.isHost) target.players = [];
                    else {
                        const index = value.players.indexOf(player);
                        target.players.splice(index, 1);
                    }
                    if (target.players.length === 0) {
                        redis.del(target.lobbyCode);
                        redis.del(target.lobbyCode+'-inprogress');
                    } 
                    else redis.set(target.lobbyCode, JSON.stringify(target));
                    break;
                }
            }
        }
        if (target === null) return res.status(500).end();
        res.status(200).json({ lobbyCode: target.lobbyCode, players: target.players }).end();
    });
});

module.exports = lobby;