'use strict';

const redis = require("redis");
const PORT = 6379;
const HOST = "http://localhost";

// Sync Client
const client = redis.createClient({
    port: PORT,
    host: HOST
});

client.on('connect', () => {
    console.log('Sync Redis Client Connected!');
});

client.on('error', () => {
    console.log('Sync Client Connection Failed!');
});

module.exports = client;