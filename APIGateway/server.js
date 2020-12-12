'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
    console.log(`Request_Endpoint: ${req.method} ${req.url}`);
    next();
});

// Configure the bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// This middleware informs the express application to serve our compiled React files
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(express.static(path.join(__dirname, '../Frontend/build')));

    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, '../Frontend/build', 'index.html'));
    });
};

// Import routes
const gaming = require('./Routes/gaming');
const userdata = require('./Routes/userData');
const users = require('./Routes/users');

// Setup routes
app.use('/gaming', gaming);
app.use('/userdata', userdata);
app.use('/user', users);

// Catch bad requests
app.get('*', (req, res) => {
    res.sendStatus(404).end();
});

// Configure our server to listen on the port defiend by our port variable
const server = require('http').createServer(app);
server.listen(port, () => console.log(`Server running on port ${port}...`));

module.exports = server;