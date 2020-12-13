'use strict';

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const PORT = 7000;

// Setup 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

// Setup routes
const lobby = require('./Routes/lobby');
const join = require('./Routes/join');
const game = require('./Routes/game');
app.use("/lobby", lobby);
app.use("/join", join);
app.use("/game", game);

// Start server
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));