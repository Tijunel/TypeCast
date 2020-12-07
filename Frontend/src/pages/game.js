// page where you actually play the game

// NOTE: this is still very rough.
//       It's using hardcoded data,
//       the structure of the 'this.state.players[]' data probably isn't perfect,
//          ...(it contains attributes that perhaps only the server needs),
//       there are still bugs (backspacing to the beginning of a word crashes), 
//       the dynamic styling isn't finished (backspacing doesn't re-style, + other),
//       it's not yet designed to handle multi-line strings,
//       there is no timer yet,
//       and lacks a lot of the visual read-outs.

//       I'll be fixing the above today and updating as I go (Cody)

import React from 'react';
import WithAuth from './withAuth';
import './_styling/game.css';

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      raceCodeID: "",             // unique ID for the race code being used. Store in
      raceCodeStr: "",            // a string of the entire code
      raceCode: [],               // array of 'words' parsed from raceCodeStr
      raceCodeHTML: [],           // individually addressable words in HTML form, from raceCode
      whitespaceAtStart: false,   // helps the game with formatting
      cwi: 0,                     // current word index 
      cw: "",                     // current "word" the player is working on (CAN BE A CHUNK OF SPACES!)
      typed: "",                  // what has been typed into the text box for the current 'word' so far
      players: [],                // holds the players' data for the race
      myPlayerIndex: 0,           // this user's index in players[]
      startedRace: false,         // user has started the race?
      finishedRace: false,         // huser has finished the race?
      timer: 0
    }

    this.serverUpdateInterval = 2000;  // how often to share player's data with the server
    this.DEBUG = true;                 // for debug mode (lots of console output)
  }


  componentDidMount = () => {
    this.loadGameDataFromDB();

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


  loadAndInitializeRaceCodeFromDB = () => {
    // todo: retrieve the race code from somewhere (the db I guess). It's hardcoded for now:
    let codeString = "const nw = this.state.raceCode[this.state.cwi + 1];"
    
    // -----  code example (not yet working)  -----
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



  typingHandler = (event) => {
    // used to handle user input from the text box and run the game
    let text = event.target.value;
    const cw = this.state.cw; // current 'word'
    const nw = this.state.raceCode[this.state.cwi + 1]; // next 'word'
    const isLastWord = !nw;
    if (this.DEBUG)  console.log("\ntext: '" + text + "'\ncw: " + cw + "\nnw: " + nw + "\nisLastWord: " + isLastWord);

    // is this the last word?
    if (isLastWord) {
      // finished the race?
      if (text === cw) {
        this.underlineHelper(this.state.cwi, false); // refactor: shouldn't call this directly
        this.makeLastCharTypedGreen(text, this.state.cwi);
        this.setState({finished: true});
        this.calcMyResults();
        this.sendMyDataToServer();
      }
      else  this.styleMistakes(text, cw);
    } 
    else {  // user isn't working on the last word
      // Did user just finish the current word? (word + 1st char of next one)
      if (text === cw + nw[0]) {
        // advance to next word
        let nw = this.state.raceCode[this.state.cwi + 1];
        let nwi = this.state.cwi + 1;
        this.setState({cw: nw, cwi: nwi});
        text = text[text.length-1];
        // style the code appropriately
        this.underlineWord(nwi);
        if (text[0] === ' ')  this.makeLastCharTypedGreen(text, nwi-1);
        else  this.makeLastCharTypedGreen(nw[0], nwi);

        if (this.DEBUG)  console.log("finished word: \"" + cw + "\"\nNext word: \"" + nw + "\"\n\n\n");
      }
      else  this.styleMistakes(text, cw);
    }

    this.setState({typed: text});
    // Very start of the game (first key press)?
    if (!this.state.started) {
      this.setState({started: true});
      this.underlineWord(0);
    }
  }


  styleMistakes = (text, cw) => {
    let mistakesArePresent = text !== cw.substring(0, text.length);
    if (mistakesArePresent) {
      document.querySelector('.typingbox').style.cssText = "background: #e93535; color: white;";

      if(this.DEBUG)  console.log("MISTAKE! current word = \"" + cw + "\"");
    } 
    else { // no mistakes present
      document.querySelector('.typingbox').style.cssText = "background: #292d3e; color: #a6accd";

      // GREEN
      // While we're at it, since we know if mistakes are present, we also know
      // if they're NOT present. If they're not, turn the last typed character green:
      this.makeLastCharTypedGreen(text, this.state.cwi);
    }
    
  }


  makeLastCharTypedGreen = (text, cwi) => {
    if (text === '') return;
    let char = document.querySelector('.w'+cwi+'.c'+(text.length-1));
    char.style.color = "yellowgreen";
  }


  underlineWord = (wordIndex) => {
    // for the first word
    if (wordIndex === 0) {
      if (this.state.whitespaceAtStart)  this.underlineHelper(1, true);
      else  this.underlineHelper(0, true);
      return;
    }
    // for the rest
    if (this.state.whitespaceAtStart) { // words on odd indeces; spaces on evens
      if (wordIndex % 2 === 0) {
        this.underlineHelper(wordIndex + 1, true);
        this.underlineHelper(wordIndex - 1, false);
      }
    } else { // words on even indeces; spaces on odds
      if ( (wordIndex % 2) === 1 ) {
        this.underlineHelper(wordIndex + 1, true);
        this.underlineHelper(wordIndex - 1, false);
      }
    }
  }
  underlineHelper = (i, addUnderline) => {
    let desiredTD = addUnderline ? "underline" : "none";
    let word = document.querySelectorAll('.w'+i);
    for (let char of word)
      char.style.textDecoration = desiredTD;
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

    console.log(myData);
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
            value={this.state.typed}
            onChange={this.typingHandler}
          />
        }
      </div>
    );
  }
}

export default WithAuth(Game);