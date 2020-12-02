'use strict';

const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
const api = new MSCall();
api.setURLPrefix('http://localhost:7000');
const gaming = express.Router();

gaming.get("/", withAuth, async(req, res) => {

});

module.exports = gaming;