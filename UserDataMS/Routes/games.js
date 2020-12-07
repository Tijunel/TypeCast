'use strict';

const express = require("express");
const games = express.Router();
const firebase = require('../Config/firebase');

// Post a new game upon completion
games.post('/', (req, res) => {
    try {
        const userID = req.user.ID;
        const newGameRef = firebase.database().ref('users/' + userID + "/games").push();
        newGameRef.set({
            placement: req.data.placement,
            typingSpeed: req.data.typingSpeed,
            time: req.data.time,
            date: req.data.date
        });
        res.status(200);
    } catch (e) {
        res.status(500).send('Error saving game details').end();
    }
});

// Get all games
games.get('/', (req, res) => {
    try {
        const userID = req.user.ID;
        const gamesRef = firebase.database().ref('users/' + userID + "/games");
        gamesRef.on("value", function(snapshot) {
            res.data.games = snapshot.val();
        }, function () {
            console.log("Failed to retrieve games");
        });
        res.status(200);
    } catch (e) {
        res.status(500).send('Error getting games!').end();
    }
});

// Delete all games (If user wants to reset stats)
games.delete('/', (req, res) => {
    try {
        const userID = req.user.ID;
        const userRef = firebase.database().ref('users/' + userID);
        userRef.set({games: null}); //TODO: Not sure if this is the right way to remove all games or not
        res.status(200);
    } catch (e) {
        res.status(500).send('Error deleting games!').end();
    }
});

module.exports = games;

