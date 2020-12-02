// page where you actually play the game

// todo: basically everything. This is just a template so far...

import React from 'react';
import './_styling/game.css';

export default class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      racecode: this.getRaceCode(),
      typed: ""
    }
  }

  getRaceCode = () => {
    // todo: retrieve the race code from somewhere. For now, it's hardcoded:
    let raceCode = 
      `
      toggleReady = (playerIndex) => {\n
        if (playerIndex != this.state.myPlayerIndex)\n
          return;  // can only toggle your own Ready status\n
        let toggled = this.state.players;\n
        toggled[playerIndex].isReady = !toggled[playerIndex].isReady;\n
        this.setState({ players: toggled });\n
        this.DEBUG && console.log("Player " + (playerIndex+1) + " ready?  " +\n
                                   this.state.players[playerIndex].isReady);\n
      }
      `;
      raceCode = raceCode.split('\n').map(str => <p>{str}</p>);;
      return raceCode;
  }

  changeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;
    this.setState({[name]: val});

    // now do stuff to compare the user input to the racecode
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
          {this.state.racecode}<br/>
          ^ need to make indentation display correctly
        </div>

        <div id='typingbox'>
            <textarea
              name='typed'
              className='typed'
              rows='1'
              value={this.state.typed}
              onChange={this.changeHandler}
            />
        </div>
  
      </div>
    );
  }
}