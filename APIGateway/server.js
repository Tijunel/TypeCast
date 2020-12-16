'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
    console.log(`Request_Endpoint: ${req.method} ${req.url}`);
    next();
});

// Configure the bodyParser middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Served minified files
// app.use(express.static(path.join(__dirname, '../Frontend/build')));
// app.get('*', function (req, res) {
//     res.sendFile(path.join(__dirname, '../Frontend/build', 'index.html'));
// });

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

const MSCall = require('./Utilities/MSCall');
var api = new MSCall();
api.setPrefixURL('http://localhost:7000');
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    const userData = cookieParser.JSONCookie(cookie.parse(socket.handshake.headers.cookie).userData);
    socket.on('disconnect', async() => {
        const response = await api.call('lobby/leave/', 'POST', {
            json: {
                username: userData['username']
            }
        });
        if(response.status === 200) {
            io.emit('lobby update', {
                lobbyCode: response.body.lobbyCode,
                players: response.body.players
            });
        }
    });
});

module.exports = [io];