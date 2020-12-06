'use strict';

const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
const api = new MSCall();
const prefix = 'http://localhost:7000';
const gaming = express.Router();

// Get all lobbies
gaming.get("/lobbies", withAuth, async(req, res) => {

});

// Create lobby
gaming.post('/create', withAuth, async(req, res) => {

});

// Join a specific by code
gaming.post("/join", withAuth, async(req, res) => {

});

// Join a random lobby in the join screen
gaming.post("/matchmake", withAuth, async(req, res) => {

});

// Join by specific code or a random lobby
// When entering a lobby, get a list of current users
// When a new user joins, then send a socket message updating people in the same lobby
// Update users on each users progress

module.exports = gaming;