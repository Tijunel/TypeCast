// Todo: - replace hardcoded data with data from DB
//       - add all the calls to the game ms middleware
//       - fix bug: sometimes the '.typingbox' selector isn't 
//                  found on tab press. Should check first before calling .focus()

// Note:  to start the race, call 'this.startTimer(true)'

import React, { Children } from 'react';
import WithAuth from './withAuth';
import './_styling/game.css';

class Game extends React.Component {
  constructor() {
    super();

    this.state = {
      players: [],                // holds the players' data for the race (COMES FROM SERVER)

      raceCodeHTML: [],           // styled raceCode html, reflecting what the player has typed
      typed: "",                  // what has been typed into the text box for the current 'word' so far
      raceStarted: false,         // race has started?
      raceHasEnded: false,        // true when the time runs out or when all players have finished race
      timeElapsed: -1             // amount of time (seconds) that have passed since start of race
    }
                                      // THESE THREE COME FROM THE SERVER -----------
    this.myPlayerIndex = 0;           // this user's index in players[]
    this.raceCodeStr = "";            // a string of the entire code
    this.timeLimit = null;            // time limit for this race -------------------

    this.raceCode = [];               // array of 'words' parsed from raceCodeStr
    this.whitespaceAtStart = false;   // helps the game with formatting
    this.charLastWord = false;
    this.cwi = 0;                     // current word index 
    this.cw = "";                     // current 'word' the player is working on (can be a chunk of whitespace)
    this.numCompletedChars = 0;       // number of characters user has successfully typed
    this.numTypedChars = 0;           // number of characters users has typed (inc. mistakes) - use for accuracy
    this.myTimeHasBeenCalcd = false;  // how long it took this user to finish the race
    this.mistakesPresent = false;
    this.tabPressed = false;
    this.undetectableBackspacePressed = false;
    this.enterPressed = false;
    this.wordWithEnters = "";
    this.wordChanged = false;
    this.cursorLocation = '.w0.c0';
    this.prevCursorType = 'cursor';
    this.userFinishedRace = false;     // user has finished the race?
    this.raceStartTime = null;
    this.currentTime = 0;
    this.interval = 0;
    this.interval2 = 0;
    this.lastUpdateTime = null;
    this.serverUpdateInterval = 1000;  // how often to share player's data with the server
    
    this.COUNTDOWN_TIME = 3;
    this.TAB = '  ';                 // 
    this.DEBUG = true;                 // debug mode (lots of console output)
  }


  componentDidMount = () => {
    this.loadGameDataFromDB();
    this.initializeVals();
    this.inputSetup();

    // no idea how this should work, but here's an idea:
    this.tellServerImReady();
  }


  loadGameDataFromDB = () => {
    // todo: Instead of using these 4 hardcoded values below, load them from our DB

    // ----- Explanation of attributes stored in players[] --------------------
    //     name:  (duh)
    //   isHost:  true for host, false for everyone else
    // charsFin:  number of characters user has finished so far
    //      lpm:  current speed in lines per minute (lpm) of player
    // position:  position the player is in (a derived quantity, but might be convenient to just store)
    //     time:  time taken to complete race (finish time, calculated at end)
    let players = [ 
      {name: "Sarah W.", isHost: true, charsFin: 0, lpm: '', position: '', time: ''},
      {name: "Navjeet Pravdaal", isHost: false, charsFin: 0, lpm: '', position: '', time: ''}, 
      {name: "Chloe Salzar", isHost: false, charsFin: 0, lpm: '', position: '', time: ''},
      {name: "ThiccBoi McGee", isHost: false, charsFin: 0, lpm: '', position: '', time: ''},
      {name: "Mr. McChungus", isHost: false, charsFin: 0, lpm: '', position: '', time: ''} 
    ];
    this.setState({players: players});

    // the index of this player in the player data array (this.state.players)
    this.myPlayerIndex = 0;

    // the string of code that will be used for the race
    this.raceCodeStr =
`#include <iostream>
using namespace std; // because I'm lazy

int main() {
  cout << "Hello, world!" << endl;
  return 0;
}`;

    // the time limit for the race
    this.timeLimit = 60;
  }


  initializeVals = () => {
    this.raceCode = this.raceCodeStr.split(/(\s+)/);
    this.buildRaceCodeHTML(this.raceCode);
    this.cw = this.raceCode[0];
    this.whitespaceAtStart = this.cw === ' ';
  }


  buildRaceCodeHTML = (raceCode) => {
    let raceCodeHTML = [];
    for (let i = 0; i < raceCode.length; i++) {
      for (let j = 0; j < raceCode[i].length; j++)
        raceCodeHTML.push(<p key={i+'-'+j} className={'w'+i+' c'+j}>{raceCode[i][j]}</p>);
    }
    this.setState({raceCodeHTML: raceCodeHTML});
  }


  applyInitialStyling = () => {
    this.underlineWord(0);
    document.querySelector(this.cursorLocation).classList.add('cursor');
  }


  tellServerImReady = () => {
    // todo
    // lets the server know that this player is ready.
    // Not sure if this is necessary...

    // Also: once the server essentially says "GO!" to everyone to start the race,
    // call 'this.startTimer(true)' to begin the coundown and start the race.
    // For now, a simple 'Start Race' button triggers this call.
  }


  updateHandler = () => {
    // todo
    // Updates the on-screen timer and, if enough time has passed (based on 
    // -the interval we set), sends this player's data with the server

    // update screen timer
    // ...

    // if (timePassed > this.serverUpdateInterval)
    //   this.sendMyDataToServer();  // <-- this method needs to be updated!!
  }


  inputSetup = () => {
    const typingBox = document.querySelector(".typingbox");
    typingBox.addEventListener("keyup", (event) => {

      // if (! this.raceStarted) {
      //   this.startTimer(false);
      // }
      
      if (event.key === "Enter") {
        event.preventDefault();
        this.printDebug("                              < Enter >");
        this.enterPressed = true;    
        if (this.wordWithEnters === '')  // 1st enter used (comes after a word) 
          this.wordWithEnters = this.state.typed + '\n';
        else  // more than one enter in this 'word'
          this.wordWithEnters = this.wordWithEnters += "\n";
        this.typingHandler();
      }

      else if (event.key === "Backspace") {
        // if user made mistake by typing Enter as first letter of new word,
        // this detects the backspace to correct it. This is needed because 
        // Enter presses, while they are detected, they don't insert anything 
        // into the text input box, and so in this particular case, right at 
        // the start of a word when the text box is empty, there is nothing
        // to backspace and cause a change in the content of the text box and
        // trigger the typingHandler() method to record the backspace and
        // update everything.
        if (this.state.typed[0] === '\n' && this.wordWithEnters !== '') { // the first part of this is where a problem might exist
          this.printDebug("              < Backspace >  (otherwise undetectable)");
          this.undetectableBackspacePressed = true;
          //this.wordWithEnters = this.wordWithEnters.substring(0, this.wordWithEnters.length-1);
          this.typingHandler();
        }
      }
    });

    document.querySelector('#game').addEventListener("keyup", (event) => { // todo: fix this. Why does it fire twice??
      if (event.keyCode == 9) { // Tab
        event.preventDefault();
        this.printDebug("                               < Tab >");
        this.tabPressed = true;
        document.querySelector('.typingbox').focus();
        this.typingHandler();
      }
    })
  }


  // --------------------- the main game engine -------------------------------
  typingHandler = (event) => {
    let text = '';
    let lastPressWasBackspace = false;


    // ------ Enter presses (newlines) part of cw -------
    if (this.wordWithEnters !== '') {
      if (this.enterPressed)
        this.enterPressed = false;
      else {
        lastPressWasBackspace = ( !this.wordChanged && (this.undetectableBackspacePressed || event.target.value.length < this.state.typed.length) );
        if (lastPressWasBackspace) {
          this.wordWithEnters = this.wordWithEnters.substring(0, this.wordWithEnters.length-1);
          this.undetectableBackspacePressed = false;
        }
        else if (this.tabPressed) {
          text = this.state.typed + this.TAB;
          if (this.wordWithEnters !== '')
            this.wordWithEnters += this.TAB;
        }
        else {
          let lastChar = event.target.value[event.target.value.length - 1];
          this.wordWithEnters += lastChar;
        }
      }
      text = this.wordWithEnters;
    }
    // ------ backspace pressed in an empty textbox -----
    else if (this.undetectableBackspacePressed) {
      lastPressWasBackspace = true;
      text = this.wordWithEnters;
      this.undetectableBackspacePressed = false;
    }
    // ------ Tab presses (for indentation) -------------
    else if (this.tabPressed) 
      text = this.state.typed + this.TAB;
  
    // ---- regular character pressed, or a normal backspace scenario ---------
    else {
      text = event.target.value;
      lastPressWasBackspace = event.target.value.length < this.state.typed.length;
    }  

    // ---------- Initialize values ---------------------
    const cw = this.cw;  // current 'word'
    const nw = this.raceCode[this.cwi + 1];  // next 'word'
    let cwIsLastWord = !nw;
    // even if !isLastWord, it might still be the last word if it's one character long...
    if ( !cwIsLastWord && (nw.length === 1 && !this.raceCode[this.cwi + 2]) ) {  
      cwIsLastWord = true;
      this.charLastWord = true;
    }

    // ---------- cw = Last word ----------------
    if (cwIsLastWord) {
      // finished the race?
      if ( text === cw || (this.charLastWord && text[text.length-1] === this.raceCode[this.raceCode.length-1]) ) {
        this.userFinishedRace = true;
        this.finalizeGame();
        if (this.charLastWord) {
          this.underlineHelper(this.raceCode.length-1, false); // refactor: shouldn't call this directly
          this.makeLastCharTypedGreen(text[text.length-1], this.raceCode.length-1);
        }
        else {
          this.underlineHelper(this.cwi, false); // refactor: shouldn't call this directly
          this.makeLastCharTypedGreen(text, this.cwi);
        }
        return;
      }
      else  this.styleAnyMistakes(text, cw);
    } 

    // ---------- cw != Last word ----------------
    else { 
      // Did user just finish the current word? 
      // Words are completed by typing the entire word + the first character of following whitespace.
      // Whitespace chunks complete on their final character (don't require the next word's 1st chracter).
      const actualWordFinished = (text === cw + nw[0]);
      const whitespaceFinished = (!this.whitespaceAtStart && this.cwi % 2 === 1 && text === cw) ||
                                 (this.whitespaceAtStart && this.cwi % 2 === 0 && text === cw) ;
      const finishedCW = actualWordFinished || whitespaceFinished;

      // ---------- cw has just been finished ----------------
      if (finishedCW) {
        // advance to next word
        let nwi = this.cwi + 1;
        let nw = this.raceCode[nwi];
        this.wordChanged = true;
        this.printDebug(` finished: '${cw}'\nnext word: '${nw}'\n----------------------------\n\n\n\n\n`);
                      
        if (actualWordFinished) {
          //text = text[text.length-1];
          let endingWS = text[text.length-1]; // delineating whitespace character that ended the word
        
          // check the delineating character
          //if (endingWS === ' ' || endingWS === '\n' ) { // won't this always fire?...    // BLAH can prob delete
          if (endingWS === '\n')
            this.wordWithEnters = '\n';
          else                                    // BLAH DONT THINK THIS IS NEEDED. I COULD BE WRONG.
            this.wordWithEnters = '';
          this.makeLastCharTypedGreen(text.substring(0, text.length-1), this.cwi);
          //}
          text = endingWS;

          // the last character typed was whitespace; see if that character IS
          // the entire next 'word' of whitespace (of length = 1)
          if (endingWS === nw) {
            text = '';
            this.wordWithEnters = '';
            nwi++;
            nw = this.raceCode[nwi];
            //this.makeLastCharTypedGreen(nw[0], nwi);      // MIGHT HAVE TO MOD THE GREEN METHOD NOW   BLAH can probably del
            this.printDebug(` finished: '${endingWS}'\nnext word: '${nw}'\n----------------------------\n\n\n\n\n`);
          }
        }
        // whitespace chunk finished (with length > 1)
        else {  // THIS IS WHERE I THINK IT NEEDS WORK

          text = '';
          this.wordWithEnters = '';
        }

        // in either case (finished an actual word OR a chunk of whitespace)
        this.cwi = nwi;
        this.cw = nw;
        this.printDebug(`cw: '${this.cw}'\ntx: '${text}'`);
        this.underlineWord(nwi);
      }

      // ---------- cw is not finished yet ----------------
      else {
        this.wordChanged = false;
        this.mistakesPresent = this.styleAnyMistakes(text, cw);
        this.printDebug(`cw: '${cw}'\ntx: '${text}'`);
      } 
    }
  
    // ----- in ALL cases -------------------------
    this.setState({typed: text});
    if ( !this.mistakesPresent && !lastPressWasBackspace)  this.numCompletedChars++;
    // tabs account for > 1 character (spaces)
    if (this.tabPressed)  this.numCompletedChars += (this.TAB.length - 1)

    if (this.tabPressed)  this.tabPressed = false;

    // move the cursor 
    // This is just a hack: I made it async to delay execution, as it depends
    // on values that have been setState()-ed, above.
    // TODO: refactor this so it executes synchronously, time permitting
    
    setTimeout(()=> {
      let cursorType = 'cursor';
      let cursorWI = this.cwi;
      let cursorCI; 
          
      if (text.length === 0)
        cursorCI = 0;
      else if (text.length < this.cw.length)
        cursorCI = text.length;
      else if (text.length === this.cw.length) {
        if (! this.mistakesPresent) {
          cursorWI = cwIsLastWord ? cursorWI : cursorWI+1;
          cursorCI = 0;
        }
        else
          cursorCI = this.cw.length-1;
      }
      else { // text.length > this.cw.length
        if (! this.mistakesPresent) {
          cursorWI++;
          cursorCI = 0;
        }
        else {
          cursorCI = this.cw.length-1;
          // and we need to move the cursor to the right side of the character!
          cursorType = 'cursorEnd';
        }
      }
      this.printDebug(`cursor: (${cursorWI},${cursorCI})\n\n`);

      document.querySelector(this.cursorLocation).classList.remove(this.prevCursorType);
      this.prevCursorType = cursorType;
      this.cursorLocation = `.w${cursorWI}.c${cursorCI}`;
      document.querySelector(this.cursorLocation).classList.add(cursorType);
    }, 0);
  }
  // --------------------- / main game engine ---------------------------------


  printDebug = (st) => {
    if (this.DEBUG) console.log(st);
  }


  styleAnyMistakes = (text, cw) => {
  // also returns true if any mistakes are present, false if not
    let mistakesArePresent = text !== cw.substring(0, text.length);
    if (mistakesArePresent) {
      // color the text input box red
      document.querySelector('.typingbox').style.cssText = "background: #e93535; color: white;";
      // make red the background of the erroneosly-typed characters
      let ch;
      for (let i = 0; i < cw.length; i++) {
        ch = document.querySelector(`.w${this.cwi}.c${i}`);
        if (!text[i]) {
          ch.style.background = "transparent"
          ch.style.color = "white";
        }
        else if (text[i] === cw[i]) 
          ch.style.background = "transparent";
        else if (text[i] !== cw[i])
          ch.style.background = "#ac2f2f";
        else 
          alert("This else should never be reached! :(");
      }
      this.printDebug(`v--- MISTAKES DETECTED ---v`);
    } 
    else { // no mistakes present
      document.querySelector('.typingbox').style.cssText = "background: #292d3e; color: #a6accd";
      // used to un-color previously green words when backspacing past them
      for (let i = 0; i < cw.length; i++) {
        let ch = document.querySelector(`.w${this.cwi}.c${i}`);
        if (!text[i])
          ch.style.color = "white";
      }
      // GREEN
      // While we're at it, since we know no mistakes are present at this point,
      // -so turn the last-typed character green:
      this.makeLastCharTypedGreen(text, this.cwi);
      if (cw[text.length])  document.querySelector(`.w${this.cwi}.c${text.length}`).style.background = "transparent";
    }

    return mistakesArePresent;
  }


  makeLastCharTypedGreen = (text, cwi) => {
  // makes the last character of 'text' turn green to indicate correct input
    if (text === '') return;  // handles when user backspaces to start of word
    let char = document.querySelector('.w'+cwi+'.c'+(text.length-1));
    char.style.color = "#c3e88d";
  }


  underlineWord = (wordIndex) => {
    // for the first word
    if (wordIndex === 0) {
      if (this.whitespaceAtStart)
        this.underlineHelper(1, true);     
      else  
        this.underlineHelper(0, true);
      return;
    }
    // for actual words only: underline them
    const thisWordsFirstchar = this.raceCode[wordIndex][0];  // BLAH Refactor this into a method that checks if the word is a whitespace chunk or a word
    if (thisWordsFirstchar !== ' ' && thisWordsFirstchar !== '\n')
      this.underlineHelper(wordIndex, true);
    // for all: remove underline from previous word (need the -2 for edge case)
    this.underlineHelper(wordIndex-1, false);
    this.underlineHelper(wordIndex-2, false);  // BLAH will this -2 one ever be out of bounds (ie: -1) ? What about if we start with whitespace in raceCodeStr?
  }
  underlineHelper = (i, wordShouldBeUnderlined) => {
    let desiredTextDec = wordShouldBeUnderlined ? "underline" : "none";
    let word = document.querySelectorAll('.w'+i);
    for (let char of word)
      char.style.textDecoration = desiredTextDec;
  }


  finishedStyling = () => {
    // stop the cursor
    document.querySelector(this.cursorLocation).classList.remove('cursor');
  }


  calcMyResults = () => {
    let players = this.state.players;
    let me = players[this.myPlayerIndex];

    // calc my race completion time
    if (this.userFinishedRace) {
      if (! this.myTimeHasBeenCalcd) {
        me.time = this.calcMyTime();
        this.myTimeHasBeenCalcd = true;
      }
    }
    else { // user hasn't finished race yet
      if (this.raceHasEnded)
        me.time = this.timeLimit;
      else
        me.time = this.calcMyTime();
    }

    // calc lpm (speed)
    me.lpm = this.userFinishedRace ?
             Math.round((this.raceCodeStr.length / 80.0) * 100 / (me.time / 60.0)) / 100 :
             Math.round((this.numCompletedChars / 80.0) * 100 / (me.time / 60.0)) / 100;

    // report progress (number of characters finished)
    me.charsFin = this.userFinishedRace ? this.raceCodeStr.length : this.numCompletedChars;


    // Todo: DELETE THIS NEXT PART ONCE SERVER CODE IS BEING USED:
    //       player should not update his own .position property in the player data
    //       This is only being used for demo purposes.
    me.position = 1;
    for (let i = 0; i < players.length; i++) {
      if (i !== this.myPlayerIndex) {
        if (players[i].charsFin > me.charsFin)
          me.position++;
      }
    }

    this.setState({players: players});
  }


  sendMyDataToServer = () => {
    // todo: send myData to the server instead of just logging it to console
    const myData = this.state.players[this.myPlayerIndex];
    console.log("\n\n\n\n\n\nYour race data:\n" + myData);
  }


  startRace = () => {
    this.setState({raceStarted: true});
    this.applyInitialStyling(); // style the raceCode for playing the game
    document.querySelector(".typingbox").disabled = false;
    document.querySelector(".typingbox").focus();
  }


  finalizeGame = () => {
    this.calcMyResults();
    this.sendMyDataToServer();
    this.finishedStyling();
    this.setState({raceHasEnded: true});
    
    // todo: remove this once server is starting the game
    document.querySelector('#testStartBtn').style.display = 'none';
  }


  visualizePlayerData = () => {
    // in the second column (td), above player-lpm
    let visualData = [];
    for (let i = 0; i < this.state.players.length; i++) {
      visualData.push( 
        <tr key={"player"+(i+1)} className={"player"+i+"data playerdata"}>
          <td className="vis-playername">
            {this.state.players[i].name} {this.myPlayerIndex === i ? '(you)' : ''} &nbsp;[==])
          </td>

          <td className="vis-playerstats">
            <div className='player-pos'>
              { this.state.players[i].position !== '' ?
                <span>{this.formatPosition(this.state.players[i].position)} place</span>
              : 
                <span> &nbsp;</span>
              }
            </div>
            <div className='player-lpm'>{this.state.players[i].lpm} LPM</div>
          </td>
        </tr>
      ); // pastGamesTable.push
    }
    return visualData;
  }


  // --------- timer ----------------------------------------------------------
  formatTime = (s) => {
    //return ('000' + n).substr(-3);
    let min = '', 
        sec = s;
    if (s >= 60) {
      min = Math.trunc(s/60);   
      sec = s - min * 60;
    }
    sec = ('00' + sec).substr(-2);
    return min + ':' + sec;
  }

  update = (isCountdown, startingTime) => {
    let now = new Date().getTime(),
        delta = now - this.lastUpdateTime;
        this.currentTime += delta;
    let time = new Date(this.currentTime);
    let timerReadout;
    let elapsed = startingTime - (time.getSeconds() + time.getMinutes()*60);
    timerReadout = this.formatTime(elapsed);
    this.setState({timeElapsed: elapsed});
    this.lastUpdateTime = now;

    if (timerReadout === ':00') {
      this.stopTimer();
      // if the countdown timer reached :00, now start the real timer
      if (isCountdown)  this.startTimer(false); 
      // if time runs out on the actual race, stop the game
      if (!isCountdown && !this.userFinishedRace) {
        this.finalizeGame();
        this.setState({raceHasEnded: true});
      }
    }
    else if (this.userFinishedRace) {
      // for refreshing player stats
      clearInterval(this.interval2);
      this.interval2 = 0;
    }
  }

  startTimer = (isCountdown) => {
  // isCountdown: true for countdown timer, false for race timer
    if (!this.interval) {
      if (isCountdown) {
        this.lastUpdateTime = new Date().getTime();
        this.setState({timeElapsed: this.COUNTDOWN_TIME});
        this.interval = setInterval(this.update, 1000, true, this.COUNTDOWN_TIME);
        this.currentTime = 0;
      }
      else {
        this.startRace();
        this.lastUpdateTime = new Date().getTime();
        this.raceStartTime = this.lastUpdateTime;
        this.setState({timeElapsed: this.timeLimit});
        this.interval = setInterval(this.update, 1000, false, this.timeLimit);
        // todo: make next line call method that refreshes ALL player data, not just mine (need server code first)
        this.interval2 = setInterval(this.calcMyResults, 1000); 
        this.currentTime = 0;
      }
    }
  }

  stopTimer = () => {
    clearInterval(this.interval);
    this.interval = 0;

    // for refreshing player stats
    clearInterval(this.interval2);
    this.interval2 = 0;
  }

  calcMyTime = () => {
    let now = new Date().getTime();
    let myTime = now - this.raceStartTime;
    return myTime / 1000.0;
  }

// --------- /timer -----------------------------------------------------------


formatPosition = (pos) => {
  switch (pos) {
    case (1): return "1st"; //break;  ... console says don't need break?
    case (2): return "2nd"; //break;
    case (3): return "3rd"; //break;
    default: return pos + "th";
  }
}


  render = () => {
    return (
      <div id='game'>
        <div id='timer'>
          { this.state.raceStarted ?  
              this.formatTime(this.state.timeElapsed)
            :
              this.state.timeElapsed !== -1 && 
              <span><span id="getReady">Get ready! Race starts in </span>
                    {this.formatTime(this.state.timeElapsed)}</span>
          }
        </div>

        <div id='game-status'>
          { this.state.raceHasEnded ?
              <span>The race has ended.</span>
            : 
              this.userFinishedRace ?
                <span>
                  You finished {this.formatPosition(this.state.players[this.myPlayerIndex].position)}
                </span>
              :
                this.state.raceStarted ?
                  <span>The race is on! Type the code below:</span>
                : 
                  <span>The race is about to start!</span>
          }
        </div>
        
        <div id="race-visualization">
          <table id="race-visualization">
            <tbody>{this.visualizePlayerData()}</tbody>
          </table>
        </div>

        <div id='codebox'>
          <pre>{this.state.raceCodeHTML}</pre>
        </div>

        { this.state.raceHasEnded ?

          <div id="race-results">
            <div id="result-heading">Your Results</div>

            <div className="flex">
              <div className="res-att">Position:</div>
              <div className="res-data"> 
                {this.formatPosition(this.state.players[this.myPlayerIndex].position)}
              </div>
            </div>

            <div className="flex">
              <div className="res-att">Speed:</div>
              <div className="res-data">
                {this.state.players[this.myPlayerIndex].lpm} <span className="units">LPM</span>
              </div>
            </div>

            <div className="flex">
              <div className="res-att">Accuracy:</div>
              <div className="res-data">
                {this.state.players[this.myPlayerIndex].lpm} <span className="units">LPM</span>
              </div>
            </div>

            <div className="flex">
              <div className="res-att">Time:</div>
              <div className="res-data">
                { this.userFinishedRace ? 
                <span>{Math.round(this.state.players[this.myPlayerIndex].time * 10.0) / 10.0}
                <span className="units"> s</span></span>
                :
                  <span>(DNF)</span>
                }
              </div>
            </div>

          </div>
        :
          <input
            type='text'
            name='typed'
            className='typingbox'
            autoComplete='off'
            disabled={true}
            onKeyPress={ (e) => e.key === 'Enter' && e.preventDefault() }
            value={this.state.typed}
            onChange={this.typingHandler}
          />
        }

          <div id="testStartBtn">
            <br/><br/>
            <button onClick={() => this.startTimer(true)} 
                    style={{marginBottom: "20px"}}>Start Race</button>
            <span>&nbsp; {'<--'} Just for testing; server should actually trigger the start of the race...</span>
          </div>

      </div>
    );
  }
}

export default WithAuth(Game);