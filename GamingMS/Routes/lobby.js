'use strict';

const express = require('express');
const lobby = express.Router();
const redis = require('../Config/redis');

lobby.post('/create', (req, res) => {

});

lobby.post('/join', (req, res) => {

});

module.exports = lobby;