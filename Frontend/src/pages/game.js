// page where you actually play the game

// todo: basically everything. This is just a template so far...

import React from 'react';
import WithAuth from './withAuth';
import './_styling/game.css';

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      raceCodeStr: this.getRaceCode(), // a string of the entire code
      raceCode: [],  // array of just the words (no spaces)
      raceCodeHTML: [],
      typed: "",  // what has been typed so far for the current word
      cwi: 0,  // current word index 
      cw: "",  // current "word" the player is working on (CAN BE A CHUNK OF SPACES!)
      cc: "", // current character the player has to type (can be a whitespace)
      //cwIsAWord: true // current word is a word? true if cw is a word, false if it's a 'word' of whitespace
    }
    this.DEBUG = true;
  } // this.setState({ key: value });

  componentDidMount = () => {
    // initialize stuff
    let raceCode = this.state.raceCodeStr.split(/(\s+)/); // >> need to find a way to include ALL whitespace
    this.setState({raceCode: raceCode});
    //this.setState({raceCodeHTML: raceCode.map(word => <span>{word}</span>)});
    let raceCodeHTML = [];
    for (let i = 0; i < raceCode.length; i++) {
      //if (i % 2 == 0) // if this is a word
        // idea: set classnames for words and spaces differently? Don't think it's needed...
        raceCodeHTML.push(<span key={i} className={"word"+i}>{raceCode[i]}</span>);
    }
    this.setState({cc: raceCode[0][0]});
    this.setState({cw: raceCode[0]});
    this.setState({raceCodeHTML: raceCodeHTML})

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
    let val = event.target.value; // val = what has been typed so far for the current word
    this.setState({typed: val});
    if (this.DEBUG) console.log("typed:  " + val);

    // now do stuff to compare the user input to the racecode
    const len = val.length; // length of what has been typed so far for current word
    
    // correct character typed
    if (val[len - 1] === this.state.cc) {
      // word not finished yet
      if (len !== this.state.cw.length) {
        this.setState({cc: this.state.cw[len]});
      
      } else { // word IS finished
        if (this.DEBUG) console.log('"' + this.state.cw + '" word finished');
        this.setState({typed: ""});
        // update cc, wi, cc; but first: did player finish an actual word or a 'word' of whitespace?
        // ...word, so next thing to be typed is space(s)

          let nwi = this.state.cwi + 1; // next word index
          this.setState({cwi: nwi});
          this.setState({cw: this.state.raceCode[nwi]});
          this.setState({cc: this.state.raceCode[nwi][0]});
        
      }
    } else { // incorrect character typed
      console.log("DOH! Current letter = '" + this.state.cc + "'");
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

export default WithAuth(Game);