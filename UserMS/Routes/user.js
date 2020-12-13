'use strict';

const bcrypt = require('bcryptjs');
const User = require('../Model/User');
const express = require('express');
const user = express.Router();

// Register
user.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).end();
        user = new User({ username, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user: { ID: user.id, username: username }
        }
        res.status(200).json(payload).end();
    } catch (error) {
        res.status(500).end();
    }
});

// Log In
user.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) return res.status(400).end();
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).end();
        const payload = {
            user: { ID: user.id, username: username }
        }
        res.status(200).json(payload).end();
    } catch (error) {
        res.sendStatus(500).end();
    }
});

// Change username and/or password
user.put('/', async(req, res) => {
    const { ID, newUsername, currentPassword, newPass } = req.body;
    try {
        let user = await User.findOne({_id: ID});
        if (!user) return res.status(400).end();
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).end();
        user.username = newUsername;
        user.password = newPass;
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPass, salt);
        const payload = {
            user: { ID: user.id, username: user.username }
        }
        await user.save();
        res.status(200).json(payload).end();
    } catch (error) {
        res.sendStatus(500).end();
    }
});

// Delete account, delete firebase too
user.delete('/', async (req, res) => {
    const username = req.body.username;
    try {
        let deleted = await User.findOneAndDelete({ username: username });
        if (deleted === null) return res.status(400).end();
        else return res.status(200).json({}).end();
    } catch (error) {
        res.status(500).end();
    }
});

module.exports = user;