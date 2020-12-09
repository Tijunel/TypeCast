// page where you actually play the game

// NOTE: this is STILL a rough draft
//       It's using hardcoded data,
//       the structure of the 'this.state.players[]' data probably isn't perfect,
//          ...(it contains attributes that perhaps only the server needs),
//       the dynamic styling isn't finished (backspacing doesn't re-style, + other),
//       there is no timer yet,
//       it lacks a lot of the visual read-outs,
//       and the 'game logic' looks like a complex mess, but will be refactored.

//       I'll be fixing the above today and updating as I go (Cody)

import React, { Children } from 'react';
import WithAuth from './withAuth';
import './_styling/game.css';

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      raceCodeID: "",             // unique ID for the race code being used.
      raceCodeStr: "",            // a string of the entire code
      raceCode: [],               // array of 'words' parsed from raceCodeStr
      raceCodeHTML: [],           // individually addressable words in HTML form, from raceCode
      whitespaceAtStart: false,   // helps the game with formatting
      cwi: 0,                     // current word index 
      cw: "",                     // current 'word' the player is working on (can be a chunk of whitespace)
      typed: "",                  // what has been typed into the text box for the current 'word' so far
      players: [],                // holds the players' data for the race
      myPlayerIndex: 0,           // this user's index in players[]
      startedRace: false,         // user has started the race?
      finishedRace: false,        // user has finished the race?
      timer: 0
    }
    this.enterPressed = false;
    this.wordWithEnters = "";
    this.charLastWord = false;

    this.undetectableBackspacePressed = false;
    this.wordChanged = false;
    this.textLenLastPress = 0;

    this.serverUpdateInterval = 2000;  // how often to share player's data with the server


    this.DEBUG = true;                 // for debug mode (lots of console output)
  }


  componentDidMount = () => {
    this.loadGameDataFromDB();

    setTimeout( () => this.underlineWord(0), 0);

    this.inputBoxSetup();

    // no idea how this should work, but here's an idea:
    this.tellServerImReady();
  }


  loadGameDataFromDB = () => {
    // todo: Instead of using the hardcoded values below, use the real data
    //       from our db to setState() for this game.
    this.loadAndInitializeRaceCodeFromDB();

    let raceCodeID = "12356";  // might be better placed in the method called in previous line.

    // ----- Explanation of attributes stored in player data for this game ----
    //                               (these probably aren't all necessary) ----
    //     name:  (duh)
    //   isHost:  true for host, false for everyone else
    // wordsFin:  number of words user has finished so far
    //     time:  time taken to complete race (finish time, calculated at end)
    //      lpm:  current speed in lines per minute (lpm) of player
    // position:  position the player is in (a derived quantity, but might be convenient to just store)
    //   codeID:  ID of the code being used for this particular race
    let players = [ 
      {name: "Sarah W.", isHost: true, wordsFin: 0, lpm: -1, position: -1, time: -1, codeID: raceCodeID},
      {name: "Navjeet Pravdaal", isHost: false, wordsFin: 0, lpm: -1, position: -1, time: -1, codeID: raceCodeID}, 
      {name: "Chloe Salzar", isHost: false, wordsFin: 0, lpm: -1, position: -1, time: -1, codeID: raceCodeID},
      {name: "ThiccBoi McGee", isHost: false, wordsFin: 0, lpm: -1, position: -1, time: -1, codeID: raceCodeID},
      {name: "Mr. McChungus", isHost: false, wordsFin: 0, lpm: -1, position: -1, time: -1, codeID: raceCodeID} 
    ];

    let myPlayerIndex = 0; // get this from the db (can we just use the order the players appear in the db?)

    this.setState({raceCodeID: raceCodeID, players: players, myPlayerIndex: myPlayerIndex});
  }


  loadAndInitializeRaceCodeFromDB = () => {  // BLAH: put the definition of codeString above, in loadGameDataFromDB(), THEN call this to build the other verions of it
    // todo: retrieve the race code from somewhere (the db I guess). It's hardcoded for now:
    let codeString =  //"const nw = this.state.raceCode[this.state.cwi + 1];"
`int  main() {
  cout << "hello!";
  return 0;
}`

// `#include <iostream>

// using namespace std;

// int main() {
//   cout << "hello!";
//   return 0;
// }`

// `int
//   return 0;
// }}`

// `aaa
// bbbbbb
// cc
// d
// e`

    // `toggleReady = (playerIndex) => {
    //   if (playerIndex != this.state.myPlayerIndex)
    //     return;  // can only toggle your own Ready status
    //   let toggled = this.state.players;
    //   toggled[playerIndex].isReady = !toggled[playerIndex].isReady;
    //   this.setState({ players: toggled });
    //   this.DEBUG && console.log("Player " + (playerIndex+1) + " ready?  " +
    //                              this.state.players[playerIndex].isReady);
    // }`;

    // Now parse the code into words and turn it into HTML that can be precisely styled
    let raceCode = codeString.split(/(\s+)/);
    // make every single character individually queryable
    let raceCodeHTML = [];
    for (let i = 0; i < raceCode.length; i++) {
      for (let j = 0; j < raceCode[i].length; j++)
        raceCodeHTML.push(<p key={i+'-'+j} className={'w'+i+' c'+j}>{raceCode[i][j]}</p>);
    }

    this.setState({   raceCodeStr: codeString,
                      raceCode: raceCode,
                      raceCodeHTML: raceCodeHTML,
                      cc: codeString[0],
                      cw: raceCode[0],
                      whitespaceAtStart: raceCode[0] === ' '
                  });
  }


  tellServerImReady = () => {
    // todo
    // lets the server know that this player is ready.
    // Not sure if this is necessary...


    // Also: once server says "GO!" or whatever and the race begins, 
    // this page should call this.startTimer()
    // Not sure about the best place to listen/wait for that...
    
  }


  startTimer = () => {
    // todo
    // Starts the game timer

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


  inputBoxSetup = () => {
    const typingBox = document.querySelector(".typingbox");
    typingBox.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        if (this.DEBUG)  console.log("ENTER");
        this.enterPressed = true;          // 1st enter used (comes after a word)     more than one enter in this 'word'
        this.wordWithEnters = (this.wordWithEnters === '') ? this.state.typed + '\n' : this.wordWithEnters += "\n";
        this.typingHandler();
      }
      if (event.key === "Backspace") {
        // if user made mistake by typing Enter as first letter of new word,
        // this detects the backspace to correct it. This is needed because 
        // Enter presses, while they are detected, they don't insert anything 
        // into the text input box, and so in this particular case, right at 
        // the start of a word when the text box is empty, there is nothing
        // to backspace and cause a change in the content of the text box and
        // trigger the typingHandler() method to record the backspace and
        // update everything.
        if (this.state.typed[0] === '\n' && this.wordWithEnters !== '') { // the first part of this is where a problem might exist
          if (this.DEBUG)  console.log("Undetectable Backspace");
          this.undetectableBackspacePressed = true;
          this.wordWithEnters = this.wordWithEnters.substring(0, this.wordWithEnters.length-1);
          this.typingHandler();
        }
      } 
    });
  }


  typingHandler = (event) => {
    let text = '';
    if (this.wordWithEnters !== '') {  // handle Enter key presses for newlines
      if (this.enterPressed)
        this.enterPressed = false;
      else {
        let lastPressWasBackspace = ( !this.wordChanged && (this.undetectableBackspacePressed || event.target.value < this.state.typed) ) ? true : false;
        if (lastPressWasBackspace)
          this.wordWithEnters = this.wordWithEnters.substring(0, this.wordWithEnters.length-1);
        else {
          let lastChar = event.target.value[event.target.value.length - 1];
          this.wordWithEnters += lastChar; // (lastChar === ' ') ? ' ' : lastChar; <-- redundant wtf
        }
      }
      text = this.wordWithEnters;
    }
    else if (this.undetectableBackspacePressed) {
      text = this.wordWithEnters;
      this.undetectableBackspacePressed = false;
    }
    else  text = event.target.value;
    const cw = this.state.cw;  // current 'word'
    const nw = this.state.raceCode[this.state.cwi + 1];  // next 'word'
    let cwIsLastWord = !nw;
    // even if !isLastWord, it might still be the last word if it's one character long...
    if ( !cwIsLastWord && (nw.length === 1 && !this.state.raceCode[this.state.cwi + 2]) ) {  
      cwIsLastWord = true;
      this.charLastWord = true;
    }
    if (this.DEBUG)  console.log(`\ntext: '${text}'\ntyped = '${this.state.typed}'\ncw: '${cw}'\nnw: '${nw}'`);

    if (cwIsLastWord) {
      // finished the race?
      if ( text === cw || (this.charLastWord && text[text.length-1] === this.state.raceCode[this.state.raceCode.length-1]) ) {
        if (this.charLastWord) {
          this.underlineHelper(this.state.raceCode.length-1, false); // refactor: shouldn't call this directly
          this.makeLastCharTypedGreen(text[text.length-1], this.state.raceCode.length-1);
        }
        else {
          this.underlineHelper(this.state.cwi, false); // refactor: shouldn't call this directly
          this.makeLastCharTypedGreen(text, this.state.cwi);
        }
        this.setState({finished: true});
        this.calcMyResults();
        this.sendMyDataToServer();
      }
      else  this.styleAnyMistakes(text, cw);
    } 
    else { // cw != last word

      // Did user just finish the current word? 
      // Words are completed by typing the entire word + the first character of following whitespace.
      // Whitespace chunks complete on their final character (don't require the next word's 1st chracter).
      const actualWordFinished = (text === cw + nw[0]);
      const whitespaceFinished = (!this.state.whitespaceAtStart && this.state.cwi % 2 === 1 && text === cw) ||
                                 (this.state.whitespaceAtStart && this.state.cwi % 2 === 0 && text === cw) ;
      const finishedCW = actualWordFinished || whitespaceFinished;

      if (finishedCW) {
        // advance to next word
        let nwi = this.state.cwi + 1;
        let nw = this.state.raceCode[nwi];
        this.wordChanged = true;
        if (this.DEBUG)  console.log("---------------------------\nfinished " +
                                     "word: \"" + cw + "\"\nNext word: \"" + nw + "\"\n" +
                                     "---------------------------\n\n\n\n\n");
        if (actualWordFinished) {
          //text = text[text.length-1];
          let endingWS = text[text.length-1]; // delineating whitespace character that ended the word
        
          // check the delineating character
          //if (endingWS === ' ' || endingWS === '\n' ) { // won't this always fire?...    // BLAH can prob delete
          if (endingWS === '\n')
            this.wordWithEnters = '\n';
          else                                    // BLAH DONT THINK THIS IS NEEDED. I COULD BE WRONG.
            this.wordWithEnters = '';
          this.makeLastCharTypedGreen(text.substring(0, text.length-1), this.state.cwi);
          //}
          text = endingWS;

          // the last character typed was whitespace; see if that character IS
          // the entire next 'word' of whitespace (of length = 1)
          if (endingWS === nw) {
            text = '';
            this.wordWithEnters = '';
            nwi++;
            nw = this.state.raceCode[nwi];
            //this.makeLastCharTypedGreen(nw[0], nwi);      // MIGHT HAVE TO MOD THE GREEN METHOD NOW
          }
        }
        // whitespace chunk finished (with length > 1)
        else {
          text = '';
          this.wordWithEnters = '';
        }

        // in either case (finished an actual word OR a chunk of whitespace)
        this.setState({cw: nw, cwi: nwi});
        this.underlineWord(nwi);
      }
      // cw isn't finished...
      else {
        this.wordChanged = false;
        this.styleAnyMistakes(text, cw);
      } 
    }

    // in ALL cases, whenever a key is pressed in the text box
    this.setState({typed: text});
  }


  styleAnyMistakes = (text, cw) => {
    let mistakesArePresent = text !== cw.substring(0, text.length);
    if (mistakesArePresent) {
      // color the text input box red
      document.querySelector('.typingbox').style.cssText = "background: #e93535; color: white;";
      // make red the background of the erroneosly-typed characters
      let ch;
      for (let i = 0; i < cw.length; i++) {
        ch = document.querySelector(`.w${this.state.cwi}.c${i}`);
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
      if(this.DEBUG)  console.log(`MISTAKE\ntext = '${text}'\ntyped = '${this.state.typed}'\ncurrent word = '${cw}'\n[0]: '${cw[0]}'\n[1]: '${cw[1]}'\n[2]: '${cw[2]}'\n[3]: '${cw[3]}'`);
    } 
    else { // no mistakes present
      document.querySelector('.typingbox').style.cssText = "background: #292d3e; color: #a6accd";
      // used to un-color previously green words when backspacing past them
      for (let i = 0; i < cw.length; i++) {
        let ch = document.querySelector(`.w${this.state.cwi}.c${i}`);
        if (!text[i])
          ch.style.color = "white";
      }
      // GREEN
      // While we're at it, since we know no mistakes are present at this point,
      // -so turn the last-typed character green:
      this.makeLastCharTypedGreen(text, this.state.cwi);
      if (cw[text.length])  document.querySelector(`.w${this.state.cwi}.c${text.length}`).style.background = "transparent";
    }
  }


  makeLastCharTypedGreen = (text, cwi) => {
  // makes the last character of 'text' turn green to indicate correct input
    if (text === '') return;  // handles when user backspaces to start of word
    let char = document.querySelector('.w'+cwi+'.c'+(text.length-1));
    char.style.color = "yellowgreen";
  }


  // underlineWord = (wordIndex) => {
  //   // for the first word
  //   if (wordIndex === 0) {
  //     if (this.state.whitespaceAtStart)  this.underlineHelper(1, true);
  //     else  this.underlineHelper(0, true);
  //     return;
  //   }
  //   // for the rest
  //   if (this.state.whitespaceAtStart) { // words on odd indeces; spaces on evens
  //     if (wordIndex % 2 === 0) {
  //       this.underlineHelper(wordIndex + 1, true);
  //       this.underlineHelper(wordIndex - 1, false);
  //     }
  //   } else { // words on even indeces; spaces on odds
  //     if ( (wordIndex % 2) === 1 ) {
  //       this.underlineHelper(wordIndex + 1, true);
  //       this.underlineHelper(wordIndex - 1, false);
  //     }
  //   }
  // }
  underlineWord = (wordIndex) => {
    // for the first word
    if (wordIndex === 0) {
      if (this.state.whitespaceAtStart)
        this.underlineHelper(1, true);
      else  
        this.underlineHelper(0, true);
      return;
    }
    // for actual words only: underline them
    const thisWordsFirstchar = this.state.raceCode[wordIndex][0];  // BLAH Refactor this into a method that checks if the word is a whitespace chunk or a word
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


  calcMyResults = () => {
    // todo: calculate this results instead of using the hardcoded values below

    let players = this.state.players;
    let me = players[this.state.myPlayerIndex];
    // stop the timer and record time
    me.time = 17.8;
    // calc lpm
    //me.lpm = Math.round((this.state.raceCodeHTML.length / 80.0) / (me.time / 60.0));
    me.lpm = Math.round((15 / 80.0) * 100 / (me.time / 60.0)) / 100;
    // Math.round(total * 10.0 / this.state.pastGames.length) / 10;
    // calc position
    me.pos = 1;

    this.setState({players: players});
  }


  sendMyDataToServer = () => {
    // todo: send myData to the server instead of just logging it to console
    const myData = this.state.players[this.state.myPlayerIndex];

    console.log("---- Your Race Results -----\n" + myData);
  }


  visualizePlayerData = () => {
    let visualData = [];
    for (let i = 0; i < this.state.players.length; i++) {
      visualData.push( 
        <tr key={"player"+(i+1)} className={"player"+i+"data playerdata"}>
          <td className="vis-playername">
            {this.state.players[i].name} {this.state.myPlayerIndex === i ? '(you)' : ''} &nbsp;[==])
          </td>

          <td className="vis-playerspeed">
            {this.state.players[i].lpm} LPM
          </td>
        </tr>
      ); // pastGamesTable.push
    }
    return visualData;
  }


  render = () => {
    return (
      <div id='game'>
        <div id='game-status'>
          { this.state.finished ?
            <span>The race has ended.</span>
          : this.state.started ?
            <span>The race is on! Type the code below:</span>
          : <span>The race is about to start!</span>
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

        { this.state.finished ?

          <div id="race-results">
            <div id="result-heading">Your Results</div>
            <div className="flex">
              <div className="res-att">Position:</div>
              <div className="res-data"> 
                {this.state.players[this.state.myPlayerIndex].pos}
              </div>
            </div>
            <div className="flex">
              <div className="res-att">Time:</div>
              <div className="res-data">
                {this.state.players[this.state.myPlayerIndex].time}
              </div>
            </div>
            <div className="flex">
              <div className="res-att">Speed (LPM):</div>
              <div className="res-data">
                {this.state.players[this.state.myPlayerIndex].lpm}
              </div>
            </div>
          </div>
        :
          <input
            type='text'
            name='typed'
            className='typingbox'
            autoComplete='off'
            value={this.state.typed}
            onChange={this.typingHandler}
          />
        }
      </div>
    );
  }
}

export default WithAuth(Game);