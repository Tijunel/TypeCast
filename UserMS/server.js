'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 9000;

// Initiate MongoDB connection
const InitiateMongoServer = require("./Config/mongo");
InitiateMongoServer();

// Setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Import routes
const user = require('./Routes/user');

// Setup routes
app.use("/user", user);

// Start server
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
