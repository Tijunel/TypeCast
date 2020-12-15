import React, { Children } from 'react';
import WithAuth from './withAuth';
import SocketManager from '../socket';
import Cookies from 'js-cookie';
import './_styling/game.css';

class Game extends React.Component {
  constructor() {
    super();

    this.state = {
      raceCodeHTML: [],                   // styled raceCode html, reflecting what the player has typed
      typed: "",                          // what has been typed into the text box for the current 'word' so far
      raceStarted: false,                 // race has started?
      raceHasEnded: false,                // true when the time runs out or when all players have finished race
      timeElapsed: -1,                    // seconds passed since start of race, used for page's visual timer
      visualizedPlayerStatus: [],         // html table displaying player status in a visual readout
      redraw: true,                       // toggle this to force redraw (b/c many variables displayed are not in state)
      // THESE ARE RECEIVED FROM SERVER BEFORE RACE STARTS ------------------------------------
      playerNames: [],                    // list of player names
      raceCodeStr: "",                    // a string of the entire code
      timeLimit: null,                    // time limit for this race
      lobbyCode: this.getLobbyCode(),     // I guess we need this? It uniquely identifies this lobby.
      lobbyName: null                     // not really needed, I think
    }

    // CONSTANTS we may want to adjust  -----------------------------------------------------------
    this.SERVER_UPDATE_INTERVAL = 2000;   // how often (ms) user updates server with his race data (todo: make it 2000)
    this.COUNTDOWN_TIME = 3;              // seconds of countdown before the actual race starts
    this.TAB = '    ';                    // what gets typed when player hits the Tab key in game
    this.AUTO_INDENT = true;              // (self explanitory)
    this.DEBUG = false;                   // debug mode (lots of console output)

    // used for calculations. Try to not touch these ----------------------------------------------
    this.players = [];                // holds the players' race data. Not in state b/c needs to update fast.
    this.raceCode = [];               // array of 'words' parsed from raceCodeStr
    this.userFinishedRace = false;    // user has finished the race?
    this.whitespaceAtStart = false;   // helps the game with formatting
    this.charLastWord = false;        // lets game algorithm know when last word of raceCode is a single letter
    this.cwi = 0;                     // current word index 
    this.cw = "";                     // current 'word' the player is working on (can be a chunk of whitespace)
    this.myAccuracy = 0.0;            // user's typing accuracy
    this.numCompletedChars = 0;       // number of characters user has successfully typed
    this.numTypedChars = 0;           // number of characters users has typed (inc. mistakes) - use for accuracy
    this.mistakesPresent = false;                // true when user types wrong key, false otherwise
    this.mistakePresentOnLastType = false;       // true when a mistake was present on user's previous key press
    this.undetectableBackspacePressed = false;   // allows keyup event listener to communicate backspace presses
    this.tabPressed = false;                     // allows keydown event listener to communicate tab presses 
    this.enterPressed = false;        // allows keyup event listener to communicate Enter presses
    this.wordWithEnters = "";         // used for handling Enter key presses (newlines)
    this.wordChanged = false;         // used to assist in detecting backspaces under different conditions
    this.cursorLocation = '.w0.c0';   // used for moving the blinking cursor around
    this.prevCursorType = 'cursor';   // used for moving the blinking cursor around
    this.raceStartTime = null;        // used for the game timer
    this.currentTime = 0;             // used for the game timer
    this.lastUpdateTime = null;       // used for the game timer
    this.interval = 0;                // used for updating game timer
    this.interval2 = 0;               // used for updating user's own data
    this.prevLineIndent = 0;          // used for auto-indent feature
  }

  componentDidMount = () => {
    this.listenOnSockets();
    this.get_initial_data_from_server();
  }


  // ------------------- server request/response methods ----------------------
  get_initial_data_from_server = async () => {
    let res = await fetch('/gaming/game/' + this.state.lobbyCode, {
      method: 'GET',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.status === 200) {
      res = await res.json();
      let playerNames = [];
      for (let player of res.players) playerNames.push(player.username);
      let raceCodeStr = res.code;
      this.setState({
        lobbyName: res.lobbyName,
        playerNames: playerNames,
        timeLimit: res.timeLimit,
        raceCodeStr: raceCodeStr
      });
      this.initializeVars();
      this.inputSetup();
      this.tell_server_im_ready();
    } else {
      // Error
    }
  }

  tell_server_im_ready = async () => {
    let res = await fetch('/gaming/ready', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lobbyCode: this.state.lobbyCode
      })
    });
    if (res.status === 200) {

    } else {
      // Error
    }
  }

  listenOnSockets = () => {
    const socket = SocketManager.getInstance().getSocket();
    socket.on('start game', (data) => {
      if (this.state.lobbyCode === data.lobbyCode) {
        this.startTimer(true);
      }
    });
  }

  send_receive_updated_player_data = async () => {
    let res = await fetch('/gaming/update', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lobbyCode: this.state.lobbyCode,
        charsFin: this.players[0].charsFin,
        time: this.players[0].time
      })
    });
    if (res.status === 200) {
      res = await res.json();
      for (let pServer of res) {
        if (pServer.name !== this.myName) { // don't update my data with stale server data
          for (let pLocal of this.players) {
            if (pServer.name === pLocal.name) {
              pLocal.charsFin = pServer.charsFin;
              pLocal.time = pServer.time;
              break;
            }
          }
        }
      }
    } else {
      // Error
    }
  }

  sendFinish = () => {
    let time = this.userFinishedRace ? toString(Math.round(this.players[0].time * 10.0) / 10.0) : "(DNF)";
    fetch('/gaming/finish', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lobbyCode: this.state.lobbyCode,
        placement: this.players[0].position.toString() + '/' + this.players.length.toString(),
        typingSpeed: this.players[0].lpm,
        time: time
      })
    });
  }
  // ------------------ /server request/response methods ------------------------


  initializeVars = () => {
    this.myName = JSON.parse(Cookies.get('userData').split('j:')[1]).username;
    this.buildPlayerArray();
    this.raceCode = this.state.raceCodeStr.split(/(\s+)/);
    this.buildRaceCodeHTML(this.raceCode);
    this.buildVisualPlayerTable();
    this.cw = this.raceCode[0];
    this.whitespaceAtStart = (this.cw === ' ' || this.cw === '\n' || !this.cw);
    if (this.whitespaceAtStart) this.cursorLocation = '.w1.c0'; // todo: test if this works
    if (this.AUTO_INDENT) this.prevLineIndent = this.getIndentationOf(this.raceCode[0]);
  }


  buildPlayerArray = () => {
    // builds a player array that out of the names provided by the server.
    // NOTE: the user places himself at position '0' in this array.

    // NOTE:        name:   comes from the server.
    //          charsFin:   is shared back and forth with the server.
    //              time:   is shared back and forth with the server.
    //  position and lpm:   are calculated locally for visual display of the race stats
    this.players.push({ name: this.myName, charsFin: 0, time: null, position: 0, lpm: 0 });

    for (let name of this.state.playerNames) {
      if (name === this.myName) continue;
      this.players.push({ name: name, charsFin: 0, time: null, position: 0, lpm: 0 });
    }
  }


  getLobbyCode = () => {
    let url = window.location.pathname;
    return url.substr(url.length - 4);
  }


  buildRaceCodeHTML = (raceCode) => {
    let raceCodeHTML = [];
    for (let i = 0; i < raceCode.length; i++) {
      for (let j = 0; j < raceCode[i].length; j++)
        raceCodeHTML.push(<p key={i + '-' + j} className={'w' + i + ' c' + j}>{raceCode[i][j]}</p>);
    }
    this.setState({ raceCodeHTML: raceCodeHTML });
  }


  buildVisualPlayerTable = () => {
    let visualData = [];
    for (let i = 0; i < this.players.length; i++) {
      visualData.push(
        <tr key={"player" + (i + 1)} className={"player" + i + "data playerdata"}>
          <td className="vis-player-lane">
            <div className={'vis-player-box p' + i}>
              <div className={i === 0 ?
                "vis-player-name vis-my-name" : "vis-player-name"}>
                {this.players[i].name} {i === 0 ? '(you)' : ''}
              </div>
              <div className={i === 0 ?
                "vis-player-car vis-my-car" : "vis-player-car"}>[==])</div>
            </div>
          </td>

          <td className="vis-playerstats">
            <div className='player-pos'>
              &nbsp;{this.players[i].position ? this.formatPosition(this.players[i].position) + " place" : ""}
            </div>
            <div className='player-lpm'>{this.players[i].lpm} LPM</div>
          </td>
        </tr>
      ); // pastGamesTable.push
    }

    this.setState({ visualizedPlayerStatus: visualData });
  }


  calcStatsAndSendMyData = () => {

    // If I'm not done the race, calc my progress send that data to the server
    if (!this.players[0].time) {
      this.players[0].charsFin = this.userFinishedRace ? this.state.raceCodeStr.length : this.numCompletedChars;
      this.calcMyFinalTime();
      this.send_receive_updated_player_data();
    }

    // Now calculate the stats for all players
    let userTime;
    for (let i = 0; i < this.players.length; i++) {
      // calc elapsed time
      userTime = this.players[i].time ? this.players[i].time : this.calcElapsedTime();
      // calc speed
      this.players[i].lpm = this.calcLPM(userTime, i);
      // calc position
      this.players[i].position = this.calcPositionOfPlayer(i);
    }

    this.updateCarPositions();
    this.buildVisualPlayerTable();
  }


  calcMyFinalTime = () => {
    if (this.userFinishedRace || this.raceHasEnded) {
      if (!this.players[0].time)
        this.players[0].time = this.calcElapsedTime();
    }
  }


  calcLPM = (time, userIndex) => {
    // calc lpm (speed)
    let lpm = this.players[userIndex].time ?  // has this user finished the race yet?
      Math.round((this.state.raceCodeStr.length / 80.0) * 100 / (time / 60.0)) / 100 :
      Math.round((this.players[userIndex].charsFin / 80.0) * 100 / (time / 60.0)) / 100;
    return lpm;
  }


  calcPositionOfPlayer = (i) => {
    let pos = 1;  // position of player[i]
    for (let j = 0; j < this.players.length; j++) {
      if (j !== i) {
        if (!this.players[i].time && this.players[j].time)
          pos++;
        else if (this.players[i].time && this.players[j].time)
          pos += (this.players[i].time > this.players[j].time) ? 1 : 0;
        else
          pos += (this.players[i].charsFin < this.players[j].charsFin) ? 1 : 0;
      }
    }
    return pos;
  }


  updateCarPositions = () => {
    // move the cars to show players' progress, woohoo
    let progress;
    for (let i = 0; i < this.players.length; i++) {
      progress = (this.players[i].charsFin * 10.0) / (this.state.raceCodeStr.length * 10.0);
      document.querySelector('.vis-player-box.p' + i).style.left = `calc(${progress} * (100% - 160px))`;
    }
  }


  calcAccuracy = () => {
    // calc typing accuracy
    this.myAccuracy = this.numCompletedChars / this.numTypedChars * 100.0;
  }


  inputSetup = () => {
    // sets up listeners for Enter, Tab, and Backspace key presses (they require special care)
    const typingBox = document.querySelector(".typingbox");
    typingBox.addEventListener("keyup", (event) => {

      if (event.key === "Enter") {
        event.preventDefault();
        this.printDebug("                              < Enter >");
        this.enterPressed = true;
        if (this.wordWithEnters === '') {  // 1st enter used (comes after a word) 
          this.wordWithEnters = this.state.typed + '\n';
        }
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
        if (this.state.typed[0] === '\n' && this.wordWithEnters !== '') {
          this.printDebug("              < Backspace >  (otherwise undetectable)");
          this.undetectableBackspacePressed = true;
          this.typingHandler();
        }
      }
    });

    document.querySelector('#game').addEventListener("keydown", (event) => {
      if (event.key === "Tab") { // Tab

        event.preventDefault();
        this.printDebug("                               < Tab >");
        this.tabPressed = true;
        document.querySelector('.typingbox').focus();
        this.typingHandler();
      }
    })
  }

  // ===================== the main game engine ===============================
  typingHandler = (event) => {
    let text = '',
      lastPressWasBackspace = false,
      autoIndentThisLine = false,  // if gets flipped, auto indent by this.prevLineIndent amount
      prevLineIndentBackup = this.prevLineIndent,
      indent = -1;

    // ------ Enter presses (newlines) part of cw -------
    if (this.wordWithEnters !== '') {
      if (this.enterPressed) {
        this.enterPressed = false;
        if (this.AUTO_INDENT) {
          let wordIndex = (this.wordWithEnters === this.cw + '\n') ? this.cwi + 1 : this.cwi;
          indent = this.getIndentationOf(this.raceCode[wordIndex]);
          if (indent >= this.prevLineIndent && this.prevLineIndent > 0)
            autoIndentThisLine = true;
          else {
            if (!this.prevLineIndent == 0) {
              this.prevLineIndent = indent; //(this.prevLineIndent - this.TAB.length >= 0) ? this.prevLineIndent - this.TAB.length : 0;
              autoIndentThisLine = true;
              // will screw up if user presses Enter mid-word somewhere (a mistake)
              // ... so we check for this at the end of this method and correct if nec.
            }
          }
        }
      }
      else { // not Enter for last press, but one already pressed for current word:
        lastPressWasBackspace =
          (!this.wordChanged && !this.tabPressed &&
            (this.undetectableBackspacePressed || event.target.value.length < this.state.typed.length));

        if (lastPressWasBackspace) {
          this.wordWithEnters = this.wordWithEnters.substring(0, this.wordWithEnters.length - 1);
          this.undetectableBackspacePressed = false;
        }
        else if (this.tabPressed) {
          text = this.state.typed + this.TAB;
          if (this.wordWithEnters !== '')
            this.wordWithEnters += this.TAB;
        }
        else { // space pressed? Not sure. landing here on 'need to indent more' cases...
          let lastChar = event.target.value[event.target.value.length - 1];
          if (lastChar) {
            this.wordWithEnters += lastChar;
          }
          // if (this.prevLineIndent > 0 && this.getIndentationOf(this.raceCode[this.cwi]) > 0) {
          //   haveToIndentFurther = true;
          else {
            // In an edge case involving Tabs actually being captured by the typingbox, sometimes lastChar = undefined.
            // Check to ensure lastChar is defined. If it isn't, completely ignore it.
            this.printDebug("\n\n    U N D E F I N E D  'lastChar' discarded\n\n");
          }
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
    // ------ Tab presses -------------------------------
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
    if (!cwIsLastWord && (nw.length === 1 && !this.raceCode[this.cwi + 2])) {
      cwIsLastWord = true;
      this.charLastWord = true;
    }

    // ---------- cw = Last word ----------------
    if (cwIsLastWord) {
      // finished the race?
      if (text === cw || (this.charLastWord && text[text.length - 1] === this.raceCode[this.raceCode.length - 1])) {
        this.userFinishedRace = true;
        this.finalizeRace();
        if (this.charLastWord) {
          this.underlineHelper(this.raceCode.length - 1, false); // refactor: shouldn't call this directly
          this.makeLastCharTypedGreen(text[text.length - 1], this.raceCode.length - 1);
        }
        else {
          this.underlineHelper(this.cwi, false); // refactor: shouldn't call this directly
          this.makeLastCharTypedGreen(text, this.cwi);
        }
        this.numTypedChars++;
        this.numCompletedChars++;
        return;
      }
      else this.styleAnyMistakes(text, cw);
    }

    // ---------- cw != Last word ----------------
    else {
      // Did user just finish the current word? 
      // Words are completed by typing the entire word + the first character of following whitespace.
      // Whitespace chunks complete on their final character (don't require the next word's 1st chracter).
      const actualWordFinished = (text === cw + nw[0]);
      const whitespaceFinished = (!this.whitespaceAtStart && this.cwi % 2 === 1 && text === cw) ||
        (this.whitespaceAtStart && this.cwi % 2 === 0 && text === cw) ||
        (this.tabPressed && text === this.cw + ' ');
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
          let endingWS = text[text.length - 1]; // delineating whitespace character that ended the word

          // check the delineating character
          if (endingWS === '\n')
            this.wordWithEnters = '\n';
          else                                    // BLAH DONT THINK THIS IS NEEDED. I COULD BE WRONG.
            this.wordWithEnters = ''
          this.makeLastCharTypedGreen(text.substring(0, text.length - 1), this.cwi);
          text = endingWS;

          // add the auto-indent, if applicable
          if (autoIndentThisLine)
            text += " ".repeat(this.prevLineIndent);

          // the last character typed was whitespace; see if that character IS
          // the entire next 'word' of whitespace (including cases where auto-indent is involved)
          if (endingWS === nw || (autoIndentThisLine && text === nw)) { // BLAH: don't think I need that autoIndentThisLine && first part
            text = '';                                                   // just having || text === nw  should do it
            this.wordWithEnters = '';
            nwi++;
            nw = this.raceCode[nwi];
            //this.makeLastCharTypedGreen(nw[0], nwi);      // MIGHT HAVE TO MOD THE GREEN METHOD NOW   BLAH can probably del
            this.printDebug(` finished: '${endingWS}'\nnext word: '${nw}'\n----------------------------\n\n\n\n\n`);
          }
          else if (autoIndentThisLine && text !== '') {  // auto-indented but didn't finish the whitespace 'word'
            this.wordWithEnters = text;
          }
        }
        // !actualWordFinished (ie: whitespace chunk finished (with length > 1)
        else {
          // to correct the Tab glitch
          if (this.tabPressed && text === this.cw + ' ') {
            this.numTypedChars--;
            this.numCompletedChars--;
          }
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
    this.setState({ typed: text }); // BLAH: I guess in this particular case, THIS is where it hits the fan...

    // was the indentation data recorded over by a mistake?
    if (this.mistakesPresent)
      this.prevLineIndent = prevLineIndentBackup; // correct it

    // update character counts
    if (lastPressWasBackspace) {
      if (!this.mistakesPresent && !this.mistakePresentOnLastType)
        this.numCompletedChars--;
    }
    else {
      this.numTypedChars++
      if (!this.mistakesPresent) this.numCompletedChars++;
    }

    // update mistake history (used for keeping correct count 
    // of this.numCompletedChars when backspacing involved)
    this.mistakePresentOnLastType = this.mistakesPresent;

    // account for tab characters (spaces)
    if (this.tabPressed) {
      this.numTypedChars += (this.TAB.length - 1); // -1 because we already added one
      this.tabPressed = false;
      if (!this.mistakesPresent)
        this.numCompletedChars += (this.TAB.length - 1);
    }

    // account for auto-indent characters (spaces)
    if (autoIndentThisLine) {
      this.numTypedChars += (this.prevLineIndent);
      this.numCompletedChars += (this.prevLineIndent);
      // this.numTypedChars += (this.prevLineIndent - 1);    //was this, before
      // this.numCompletedChars += (this.prevLineIndent - 1)
    }

    // record the indentation level
    if (indent > -1 && !this.mistakesPresent)
      this.prevLineIndent = indent;

    // move the cursor --------------------------------------------------------
    // BLAH: this is just a hack: I made it async to delay execution, as it depends
    // on values that have been setState()-ed, above.
    // TODO: refactor this so it executes synchronously, time permitting
    setTimeout(() => {
      let cursorType = 'cursor';
      let cursorWI = this.cwi;
      let cursorCI;

      if (text.length === 0)
        cursorCI = 0;
      else if (text.length < this.cw.length)
        cursorCI = text.length;
      else if (text.length === this.cw.length) {
        if (!this.mistakesPresent) {
          cursorWI = cwIsLastWord ? cursorWI : cursorWI + 1;
          cursorCI = 0;
        }
        else
          cursorCI = this.cw.length - 1;
      }
      else { // text.length > this.cw.length
        if (!this.mistakesPresent) {
          cursorWI++;
          cursorCI = 0;
        }
        else {
          cursorCI = this.cw.length - 1;
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
  // ===================== / main game engine =================================


  printDebug = (st) => {
    if (this.DEBUG) console.log(st);
  }


  getIndentationOf = (word) => {
    // checks a word for the amount of indentation present.
    // This is intended for use on 'words' that are the chunk of
    // whitespace between the end of a line and the beginning of a new one
    let indent = 0;
    for (let ch of word) {
      if (ch === '\n')
        indent = 0;
      else if (ch === ' ')
        indent++;
      else
        break;
    }
    return indent;
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
      if (cw[text.length]) document.querySelector(`.w${this.cwi}.c${text.length}`).style.background = "transparent";
    }

    return mistakesArePresent;
  }


  makeLastCharTypedGreen = (text, cwi) => {
    // makes the last character of 'text' turn green to indicate correct input
    if (text === '') return;  // handles when user backspaces to start of word
    let char = document.querySelector('.w' + cwi + '.c' + (text.length - 1));
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
    this.underlineHelper(wordIndex - 1, false);
    this.underlineHelper(wordIndex - 2, false);  // BLAH will this -2 one ever be out of bounds (ie: -1) ? What about if we start with whitespace in raceCodeStr?
  }
  underlineHelper = (i, wordShouldBeUnderlined) => {
    let desiredTextDec = wordShouldBeUnderlined ? "underline" : "none";
    let word = document.querySelectorAll('.w' + i);
    for (let char of word)
      char.style.textDecoration = desiredTextDec;
  }


  applyInitialStyling = () => {
    this.underlineWord(0);
    document.querySelector(this.cursorLocation).classList.add('cursor');
    // and make it possible to type
    document.querySelector(".typingbox").disabled = false;
    document.querySelector(".typingbox").focus();
  }


  applyFinishedStyling = () => {
    // stop the cursor
    document.querySelector(this.cursorLocation).classList.remove('cursor');
    // todo: remove the below two lines once server is starting the game
    if (document.querySelector('#testStartBtn'))
      document.querySelector('#testStartBtn').style.display = 'none';
  }


  startRace = () => {
    this.setState({ raceStarted: true });
    this.applyInitialStyling(); // style the raceCode for playing the game
  }


  finalizeRace = () => {
    this.calcStatsAndSendMyData();
    this.calcAccuracy();
    this.setState({ redraw: !this.state.redraw });
    this.applyFinishedStyling();
    this.sendFinish();
  }

  // --------- timer ----------------------------------------------------------
  formatTime = (s) => {
    //return ('000' + n).substr(-3);
    let min = '',
      sec = s;
    if (s >= 60) {
      min = Math.trunc(s / 60);
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
    let elapsed = startingTime - (time.getSeconds() + time.getMinutes() * 60);
    timerReadout = this.formatTime(elapsed);
    this.setState({ timeElapsed: elapsed });
    this.lastUpdateTime = now;

    if (timerReadout === ':00') {
      this.stopTimer();
      // if the countdown timer reached :00, now start the real timer
      if (isCountdown) this.startTimer(false);
      // if time runs out on the actual race, stop the game
      if (!isCountdown) {
        this.setState({ raceHasEnded: true });
        if (!this.userFinishedRace)
          this.finalizeRace();
      }
    }
    // else if (this.userFinishedRace) {  // BLAH: don't think this is needed now
    //   // for refreshing player stats
    //   clearInterval(this.interval2);
    //   this.interval2 = 0;
    // }
  }

  startTimer = (isCountdown) => {
    // isCountdown: true for countdown timer, false for race timer
    if (!this.interval) {
      if (isCountdown) {
        this.lastUpdateTime = new Date().getTime();
        this.setState({ timeElapsed: this.COUNTDOWN_TIME });
        this.interval = setInterval(this.update, 1000, true, this.COUNTDOWN_TIME);
        this.currentTime = 0;
      }
      else {
        this.startRace();
        this.lastUpdateTime = new Date().getTime();
        this.raceStartTime = this.lastUpdateTime;
        this.setState({ timeElapsed: this.state.timeLimit });
        this.interval = setInterval(this.update, 1000, false, this.state.timeLimit);
        // todo: make next line call method that refreshes ALL player data, not just mine (need server code first)
        this.interval2 = setInterval(this.calcStatsAndSendMyData, this.SERVER_UPDATE_INTERVAL);
        this.currentTime = 0;
      }
    }
  }

  stopTimer = () => {
    clearInterval(this.interval);
    this.interval = 0;
    clearInterval(this.interval2);
    this.interval2 = 0;
  }

  calcElapsedTime = () => {
    let now = new Date().getTime();
    let elapsed = now - this.raceStartTime;
    return elapsed / 1000.0;
  }
  // --------- /timer -----------------------------------------------------------


  formatPosition = (pos, withSauce) => {
    switch (pos) {
      case (1): return withSauce ? "1st. Woohoo!" : "1st"; //break;  ... console says don't need break?
      case (2): return withSauce ? "2nd. Close!" : "2nd";
      case (3): return withSauce ? "3rd. Not bad :)" : "3rd";
      case (4): return withSauce ? "4th. Meh." : "4th";
      case (5): return withSauce ? "5th. Oof." : "5th";
      default: return pos + "th";
    }
  }


  render = () => {
    return (
      <div id='game'>

        <div id='timer'>
          {this.state.raceStarted ?
            this.formatTime(this.state.timeElapsed)
            :
            this.state.timeElapsed !== -1 &&
            <span><span id="getReady">Get ready! Race starts in </span>
              {this.formatTime(this.state.timeElapsed)}</span>
          }
        </div>

        <div id='game-status'>
          {this.state.raceHasEnded ?
            <span>The race has ended.</span>
            :
            this.userFinishedRace ?
              <span>
                You finished {this.formatPosition(this.players[0].position, true)}
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
            <tbody>{this.state.visualizedPlayerStatus}</tbody>
          </table>
        </div>

        <div id='codebox'>
          <pre>{this.state.raceCodeHTML}</pre>
        </div>

        { this.state.raceHasEnded || this.userFinishedRace ?

          <div id="race-results">
            <div id="result-heading">Your Results</div>

            <div className="flex">
              <div className="res-att">Position:</div>
              <div className="res-data">
                {this.formatPosition(this.players[0].position)}
              </div>
            </div>

            <div className="flex">
              <div className="res-att">Speed:</div>
              <div className="res-data">
                {this.players[0].lpm} <span className="units">LPM</span>
              </div>
            </div>

            <div className="flex">
              <div className="res-att">Accuracy:</div>
              <div className="res-data">
                {this.myAccuracy.toFixed(2)}<span className="units">%</span>
              </div>
            </div>

            <div className="flex">
              <div className="res-att">Time:</div>
              <div className="res-data">
                {this.userFinishedRace ?
                  <span>{Math.round(this.players[0].time * 10.0) / 10.0}
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
            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
            value={this.state.typed}
            onChange={this.typingHandler}
          />
        }
      </div>
    );
  }
}

export default WithAuth(Game);