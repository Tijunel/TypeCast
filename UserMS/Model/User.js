'use strict';
const mongoose = require("mongoose");

// Every entry will have a unique objectID identifier (Well, there is a really high chance it will be unique).

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("user", UserSchema);