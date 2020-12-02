'use strict';

const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
const api = new MSCall();
api.setURLPrefix('http://localhost:8000');
const userData = express.Router();

// Firebase structure:
// root
//      users
//          userID:
//              games:
//                  gameID:
//                      placement: fraction (0-1 with 6 max players, take inverse to get place)
//                      typingSpeed: float
//                      time: float (seconds)
//                      date: UTC
//                      

userData.get("/", withAuth, async(req, res) => {

});

module.exports = userData;