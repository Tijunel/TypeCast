'use strict';

const express = require('express');
const games = express.Router();
const firebase = require('../Config/firebase');

// Post a new game upon completion
games.post('/:id', (req, res) => {
    try {
        const userID = req.params.id;
        const newGameRef = firebase.database().ref('users/' + userID + '/games').push();
        newGameRef.set({
            placement: req.body.placement,
            typingSpeed: req.body.typingSpeed,
            time: req.body.time,
            date: req.body.date
        });
        res.sendStatus(200).end();
    } catch (error) {
        res.sendStatus(500).end();
    }
});

// Get all games
games.get('/:id', async (req, res) => {
    try {
        var games = [];
        const userID = req.params.id;
        const gamesRef = firebase.database().ref('users/' + userID + '/games');
        await gamesRef.once('value').then(snapshot => {
            snapshot.forEach(child => {
                games.push({
                    placement: child.val().placement,
                    typingSpeed: child.val().typingSpeed,
                    time: child.val().time,
                    date: child.val().date
                });
            });
        });
        games.sort((b, a) => {
            if (a.date > b.date) return -1;
            else if (b.date > a.date) return 1;
            else return 0;
        });
        res.sendStatus(200).json({ lpm: 0, games: games }).end(); // TODO: Compute lpm in utilites
    } catch (error) {
        res.sendStatus(500).end();
    }
});

// Delete all games (If user wants to reset stats)
games.delete('/:id', (req, res) => {
    try {
        const userID = req.params.id;
        const gamesRef = firebase.database().ref('users/' + userID + '/games');
        gamesRef.remove()
            .then(() => { res.sendStatus(200).end(); })
            .catch(error => { res.sendStatus(500).end(); });
    } catch (error) {
        res.sendStatus(500).end();
    }
});

module.exports = games;

