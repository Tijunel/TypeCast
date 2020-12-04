// page where you actually play the game

// todo: basically everything. This is just a template so far...

import React from 'react';
import './_styling/game.css';

export default class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      raceCodeStr: this.getRaceCode(), // a string of the entire code
      raceCode: [],  // array of just the words (no spaces)
      raceCodeHTML: null,
      spaces: [],  // array of the spaces that exist between the words
      typed: "",  // what has been typed so far for the current word
      cwi: 0,  // current word index 
      cw: "",  // current "word" the player is working on (CAN BE A CHUNK OF SPACES!)
      cl: "", // current letter the player has to type (can be a whitespace)
    }
    this.DEBUG = true;
  } // this.setState({ key: value });

  componentDidMount = () => {
    // initialize stuff
    let raceCode = this.state.raceCodeStr.split(' '); // need to find a way to include ALL whitespace
    this.setState({raceCode: raceCode});
    this.setState({raceCodeHTML: raceCode.map(word => <span>{word} </span>)});
    this.setState({cl: raceCode[0][0]});
    this.setState({cw: raceCode[0]});

    // create the spaces map
    const code = this.state.raceCodeStr;
    const len = code.length;
    let s = "";
    let spaces = [];
    for (let i = 0; i < len; i++) {
      if (s.length > 0 && code[i] != " ") {
        spaces.push(s);
        s = "";
      }
      if (code[i] == " ")  s += " ";
    }
    this.setState({spaces: spaces});

    // anything else?
    
  }

  getRaceCode = () => {
    // todo: retrieve the race code from somewhere. For now, it's hardcoded:
    let raceCode = `The sun,  that brief December day, rose cheerless over hills of grey.`;
    

    // `
    // toggleReady = (playerIndex) => {\n
    //   if (playerIndex != this.state.myPlayerIndex)\n
    //     return;  // can only toggle your own Ready status\n
    //   let toggled = this.state.players;\n
    //   toggled[playerIndex].isReady = !toggled[playerIndex].isReady;\n
    //   this.setState({ players: toggled });\n
    //   this.DEBUG && console.log("Player " + (playerIndex+1) + " ready?  " +\n
    //                              this.state.players[playerIndex].isReady);\n
    // }
    // `;
    // raceCode = raceCode.split('\n').map(str => <p>{str}</p>);

    return raceCode;
  }

  changeHandler = (event) => {
    let val = event.target.value; // val = what has been typed so for for this.state.cw (current word)
    this.setState({typed: val});
    if (this.DEBUG) console.log("typed:  " + val);

    // now do stuff to compare the user input to the racecode
    const len = val.length; // length of what has been typed so far for current word
    
    // correct character typed
    if (val[len - 1] === this.state.cl) {
      if (this.DEBUG) console.log("nice!");

      // word not finished yet
      if (len !== this.state.cw.length) {
        if (this.DEBUG) console.log("word not finished yet. Current word: '" + this.state.cw + "'");
        this.setState({cl: this.state.cw[len]});
      
      } else { // word IS finished
        if (this.DEBUG) console.log("current word finished!");
        this.setState({typed: ""});
        // update cl, wi, cl; but first: did player finish an actual word or a 'word' of whitespace?
        // ...word, so next thing to be typed is space(s)
        if (this.state.cl !== ' ') { 
          this.setState({cw: this.state.spaces[this.state.cwi]});
          this.setState({cl: this.state.spaces[this.state.cwi][0]});

        } else { // ...spaces, so next thing to be typed is an actual word
          if (this.DEBUG) console.log("time to type an actual word!");
          let nwi = this.state.cwi + 1; // next word index
          this.setState({cwi: nwi});
          this.setState({cw: this.state.raceCode[nwi]});
          this.setState({cl: this.state.raceCode[nwi][0]});
        }
      }
    } else { // incorrect character typed
      console.log("DOH! Current letter: '" + this.state.cl + "'");
    }
  }

  render = () => {
    return (
      <div id='game'>
        <div id='game-status'>The race is on! Type the code below:</div>
        
        <div id='race-visualization'>
          <div id='speed-indicators'>(wpm/lpm goes here)</div>
          (show the cars here)<br/>These colors are just for showing the divs
        </div>

        <div id='codebox'>
          <pre>{this.state.raceCodeHTML}</pre>
        </div>

        <input
          type='text'
          name='typed'
          className='typingbox'
          value={this.state.typed}
          onChange={this.changeHandler}
        />
  
      </div>
    );
  }
}