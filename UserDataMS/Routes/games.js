'use strict';

const express = require("express");
const games = express.Router();
const firebase = require('../Config/firebase');

// Post a new game upon completion
games.post('/', (req, res) => {

});

// Get all games
games.get('/', (req, res) => {

});

// Delete all games (If user wants to reset stats)
games.delete('/', (req, res) => {

});

module.exports = games;

