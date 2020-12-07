'use strict';

const firebase = require('firebase/app');
require('firebase/database');
const config = {
    apiKey: "AIzaSyBsu-_o2P0cF4reZUX_tdflCJM87fv85U8",
    authDomain: "typecast-a8ce2.firebaseapp.com",
    databaseURL: "https://typecast-a8ce2.firebaseio.com",
    projectId: "typecast-a8ce2",
    storageBucket: "typecast-a8ce2.appspot.com",
    messagingSenderId: "750347327065",
    appId: "1:750347327065:web:a53b7c7bc4622743b84348"
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