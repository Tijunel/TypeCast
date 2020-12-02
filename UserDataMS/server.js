'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 8000;

// Setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Import routes
const games = require('./Routes/games');
const users = require('./Routes/users');

// Setup routes
app.use("/games", games);
app.use("/users", users);

// Start server
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
