// page where you view all the existing lobbies and can click to join one

import React from 'react';
import './_styling/join.css';

export default class Join extends React.Component {
  constructor() {
    super();
    this.state = {
      games: this.getGames(),  // todo (returns hardcoded game array rn)
    }
    this.MAX_PLAYERS_PER_GAME = 5;
  }

  getGames = () => {
    // todo: get the ACTUAL games data from somewhere else/via some process
    return [ {lobbyCode: "ASDF", name: "Herbert's Super Cool Game", numPlayers: 1},
             {lobbyCode: "XYZC", name: "THICCness", numPlayers: 4}, 
             {lobbyCode: "RUOK", name: "nastY SHIZZZ", numPlayers: 5},
             {lobbyCode: "IJKL", name: "Polite People Only", numPlayers: 1},
             {lobbyCode: "ECMA", name: "umm dunno", numPlayers: 2}, ];
  }

  joinGame = (gameIndex) => {
    // send user to the game they clicked on
    window.location.href = "/game/:" + this.state.games[gameIndex].lobbyCode;
  }

  getGameTable = () => {
    let gameTable = [];
    gameTable.push(
      <tr key="headings">
        <td className="player-name">Name</td>
        <td className="is-ready">Players</td>
        <td className="remove-player">&nbsp;</td>
      </tr>
    );
    for (let i = 0; i < this.state.games.length; i++) {
      gameTable.push( 
        <tr key={"player"+(i+1)}>
          <td className="player-name">
            {this.state.games[i].name}
          </td>

          <td className="is-ready">
            {this.state.games[i].numPlayers}/{this.MAX_PLAYERS_PER_GAME}
          </td>

          <td className="remove-player">
            <button onClick={ () => this.joinGame(i) }>Join</button>
          </td>
        
        </tr>
      ); // playerTable.push
    }
    return gameTable;
  }

  render = () => {
    return (
      <div id='join'>
        <a href="../join"><button className="back-btn">Back</button></a>

        <h1>Join A Game</h1>

        <table id="players">
          <tbody>{this.getGameTable()}</tbody>
        </table>

        <div id="join-by-code">
          <form>
            <div className="setting">
              <div className="labl">Join by code:&nbsp;</div>
              <div className="inpt">
                <input 
                  type='text'
                  maxLength='4'
                  name='lobbyCode'
                  className='timefield'
                  value={this.state.timeLimit}
                  onChange={this.settingsChangeHandler}
                />
              </div>
            </div>
          </form>
        </div>

      </div>
    );
  }
}