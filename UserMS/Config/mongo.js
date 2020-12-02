"use strict";
const mongoose = require("mongoose");
const mongoURI = ""; // Atlas database

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true });
        console.log("Connected to MongoDB!");
    } catch (e) {
        console.log("Error connecting to MongoDB!");
    }
}

module.exports = InitiateMongoServer;