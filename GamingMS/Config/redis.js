'use strict';

const redis = require("redis");
const asyncRedis = require("async-redis");
const PORT = 6379;
const HOST = "localhost";  // typecast.xypzmb.ng.0001.use2.cache.amazonaws.com

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

client.flushall();

// Async Client
const asyncClient = asyncRedis.createClient({
    port: PORT,
    host: HOST
});

asyncClient.on("connect", () => {
    console.log("Async Redis client connected");
});

asyncClient.on("error", (err) => {
    console.log("Async Redis client could NOT connect: \n" + err);
});

module.exports = [client, asyncClient];