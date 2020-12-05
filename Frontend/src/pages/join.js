// page where you view all the existing lobbies and can click to join one

// todo: implement joinGame() so it pulls in the actual active games
//       ...as of now, it's just using hardcoded values for the games

import React from 'react';
import './_styling/join.css';

export default class Join extends React.Component {
  constructor() {
    super();
    this.state = {
      games: this.getGames(),  // todo (returns hardcoded game array rn)
      joinCode: ""
    }
    this.MAX_PLAYERS_PER_GAME = 5;
  }

  getGames = () => {
    // todo: get the ACTUAL games data from somewhere else/via some process
    // just returning a hardcoded list for now:
    return [ {lobbyCode: "ASDF", name: "Herbert's Super Cool Game", numPlayers: 1},
             {lobbyCode: "XYZC", name: "THICCness", numPlayers: 4}, 
             {lobbyCode: "RUOK", name: "nastY SHIZZZ", numPlayers: 5},
             {lobbyCode: "IJKL", name: "Polite People Only", numPlayers: 1},
             {lobbyCode: "ECMA", name: "umm dunno", numPlayers: 2}, ];
  }

  componentDidMount = () => {
    // align the page title with the left edge of the table of games
    const tableWidth = document.querySelector("#games").offsetWidth;
    let title = document.querySelector("#join-heading");
    title.style.marginLeft = ((900 - tableWidth - 60) / 2) + "px";
  } 


  // ----- These are all related ----------------------------------------------
  joinGame = (gameIndex) => {
    // send user to the game they clicked on
    window.location.href = "/lobby/:" + this.state.games[gameIndex].lobbyCode;
  }
  joinGameByCode = (event) => {
    if (this.state.joinCode.length !== 4) 
      alert("Lobby codes are 4 letters long: try re-entering");
    else if ( ! this.gameSpecifiedExists(this.state.joinCode) ) 
      alert("Uh oh: a game with the lobby ID \"" + this.state.joinCode + "\" does not exist.");
    else if ( this.gameIsFull(this.state.joinCode) )
      alert("You can't join game \"" + this.state.joinCode + "\": maximum players reached!");
    else  // valid game specified, so send the user to it
      window.location.href = "/lobby/:" + this.state.joinCode;
  
    event.preventDefault();  // prevent page reload on form submission
  }
  gameSpecifiedExists = (code) => {
    // determines if a game specified by the input lobby code exists
    for (let i = 0; i < this.state.games.length; i++) {
      if (code === this.state.games[i].lobbyCode)
        return true;
    }
    return false;
  }
  gameIsFull = (code) => {
    // determines if a game specified by the input lobby code is full
    let n = this.state.games[this.getGameIndexFromLobbyCode(code)].numPlayers;
    return  n >= this.MAX_PLAYERS_PER_GAME;
  }
  getGameIndexFromLobbyCode = (code) => {
    // assumes a game with this lobby code definitely exists in this.state.game
    for (let i = 0; i < this.state.games.length; i++) {
      if (code === this.state.games[i].lobbyCode)
        return i;
    }
  }
  // ----- / related ----------------------------------------------------------


  joinCodeUpdater = (event) => {
    let name = event.target.name;
    let val = event.target.value;
    const accepted = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if ( accepted.includes(val[val.length - 1]) || val === "")
      this.setState({[name]: val.toUpperCase()});
    else 
      alert("Oops! Lobby codes include only letters...");
  }


  getGameTable = () => {
    let gameTable = [];
    gameTable.push( // table headings
      <tr key="headings">
        <td className="game-name">Name</td>
        <td className="player-count">Players</td>
        <td className="join-game">&nbsp;</td>
      </tr>
    );
    // rest of the table, from the list of games
    for (let i = 0; i < this.state.games.length; i++) {
      gameTable.push( 
        <tr key={"game"+(i+1)}>
          <td className="game-name">
            {this.state.games[i].name}
          </td>

          <td className="player-count">
            {this.state.games[i].numPlayers}/{this.MAX_PLAYERS_PER_GAME}
          </td>

          <td className="join-game">
            { this.gameIsFull( this.state.games[i].lobbyCode ) ?
              <div className="not-joinable">
                Full
              </div>  
            :
              <button onClick={ () => this.joinGame(i) }>Join</button>
            }
            
          </td>
        
        </tr>
      ); // playerTable.push
    }
    return gameTable;
  }


  render = () => {
    return (
      <div id='join'>
        <button  onClick={() => window.location.href = document.referrer} 
                 className="back-btn">Back</button>

        <div id="join-heading"><h1>Join Game</h1></div>

        <table id="games"><tbody>{this.getGameTable()}</tbody></table>

        <div id="join-by-code">
          <form onSubmit={this.joinGameByCode}>
            <div className="setting">
              <div className="labl">Join by code:&nbsp;</div>
              <div className="inpt">
                <input 
                  type='text'
                  maxLength='4'
                  name='joinCode'
                  className='joinWithCodeField'
                  value={this.state.joinCode}
                  onChange={this.joinCodeUpdater}
                />
                <input type='submit' value='Join'/>
              </div>
            </div>
          </form>
        </div>

      </div>
    );
  }
}