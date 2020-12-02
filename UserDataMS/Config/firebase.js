'use strict';

const firebase = require('firebase/app');
require('firebase/database');
const config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
};
firebase.initializeApp(config);

module.exports = firebase;

// Firebase structure:
// root
//      users
//          userID:
//              games:
//                  gameID:
//                      placement: string ("x/y") where x > 0, x <= y and ymax = 6
//                      typingSpeed: float
//                      time: float (seconds)
//                      date: UTC