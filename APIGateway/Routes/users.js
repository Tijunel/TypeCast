'use strict';

const jwt = require("jsonwebtoken");
const express = require('express');
const withAuth = require('../Middleware/auth');
const MSCall = require('../Utilities/MSCall');
const user = express.Router();
var api = new MSCall();
api.setPrefixURL('http://localhost:9000');

// Register
user.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const response = await api.call(`user/register`, 'POST', { 
        json: {
            username: username,
            password: password
        }
    });
    if (response.status !== 200) return res.sendStatus(response.status).end();
    else {
        jwt.sign(response.body, "Secret", { expiresIn: "30m" }, (err, token) => {
            if (err) throw err;
            res.cookie("token", token, { httpOnly: true });
            res.status(200).end();
        });
    }
});

// Log In
user.post('/login', async (req, res) => {
    const response = await api.call(prefix + '/user/login', 'POST', { json: req.body });
    if (response.status !== 200) return res.sendStatus(response.status).end();
    else {
        jwt.sign(response.body, "Secret", { expiresIn: "30m" }, (err, token) => {
            if (err) throw err;
            res.cookie("token", token, { httpOnly: true });
            res.status(200).end();
        });
    }
});

// Validate Token (Middleware does all the work)
user.get('/validate', withAuth, async (req, res) => {
    res.sendStatus(200).end();
});

// Invalidate Token (Sign Out)
user.get('/invalidate', withAuth, async (req, res) => {
    const payload = {};
    const token = jwt.sign(payload, "", { expiresIn: "1" });
    res.cookie("token", token, { httpOnly: true });
    res.sendStatus(200).end();
});

// Change username and/or password
user.put('/', withAuth, async (req, res) => {
    //req.params.id provides the id
});

// Delete account, delete firebase too
user.delete('/', withAuth, async (req, res) => {

});

module.exports = user;
