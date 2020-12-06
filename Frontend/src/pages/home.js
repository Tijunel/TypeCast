// home page for the app

// NOTE: just using a simple redirect for the buttons rn to go to the other
//       'pages'. If you have a better way of doing this, change it.

import React from 'react';
import './_styling/home.css';

export default class Home extends React.Component {
  constructor() {
    super();
  }

  hostGame = () => {
    // generate a random 4 digit room code / lobby code
    let roomCode = "";
    let menu = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var menuLength = 26;
    for (let i = 0; i < 4; i++)
      roomCode += menu.charAt(Math.floor(Math.random() * menuLength));

    // load lobby page. Not sure how else to do it. This is not very React-y
    window.location.href = "/lobby/:" + roomCode;
  }

  logOut = () => {
    // todo: do whatever needs to be done to log out
    alert("todo: implement this logOut() method")
  }

  render = () => {
    return (
      <div id='home'>
        <h1>Welcome to TypeCast!</h1>
        <p>TypeCast was created to put programmer's typing speed to the test. This site enables you
        to create a profile with which you can track your stats, race your friends or randoms, or just practice!
        Typical type racing websites track your speed using wpm (words per minute). Obviously, this just
        won't do for programming, so we use lpm (lines per minute) where each "line" is counted as 80 characters.
        We hope you enjoy this unique type racing experience!
        <br/><br/>
        -The TypeCasters
        </p><br/>
        <button onClick={() => this.hostGame()}>Host Game</button>
        <button onClick={() => window.location.href = "/join"}>Join Game</button>
        <button onClick={() => window.location.href = "/profile/"}>Profile</button>
        <button onClick={() => this.logOut()} className="log-out-btn">Log out</button>
      </div>
    );
  }
}