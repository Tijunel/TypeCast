// page where you view all existing lobbies and can click to join one

// todo: implement getGames() so it pulls in the ACTUAL active games instead
//       -of using these hardcoded placeholders.

import React from 'react';
import WithAuth from './withAuth';
import './_styling/join.css';
import SocketManager from "../socket";

class Join extends React.Component {
  constructor() {
    super();
    this.state = {
      games: [],  // todo (returns hardcoded game array rn)
      typedJoinCode: "",
      loading: true
    }
    this.MAX_PLAYERS_PER_GAME = 5;
  }


  componentDidMount = () => {
    // align the page title with the left edge of the games list
    // TODO not sure where to put this so comment out for now
    // const tableWidth = document.querySelector("#games").offsetWidth;
    // let title = document.querySelector("#join-heading");
    // title.style.marginLeft = ((900 - tableWidth - 60) / 2) + "px";
    this.listenOnSockets();
    this.getGames();
  }

  // Get existing lobbies from redis database
  getGames = async () => {
    let res = await fetch('/gaming/lobbies', {
      method: 'GET',
      credentials: "include",
      headers: {'Content-Type': 'application/json'}
    });
    let lobbies = [];
    if (res.status === 200) {
      res = await res.json();
      for (let i = 0; i < res.lobbies.length; i++) {
        lobbies[i] = {lobbyCode: res.lobbies[i].lobbyCode, name: res.lobbies[i].lobbyName, numPlayers: res.lobbies[i].players.length, public: true};
      }
      this.setState( { games: lobbies, loading: false});
      this.listenOnSockets();
    }
  }

  privateGameExists = async (id) => {
    let res = await fetch('/gaming/lobby/:'+id, {
      method: 'GET',
      credentials: "include",
      headers: {'Content-Type': 'application/json'}
    });
    console.log(res.status);
    if (res.status === 200) {
      return true;
    } else if (res.status === 500) {
      return false;
    } else {
      console.log("error with response in privateGameExists");
      return false;
    }
  }

  listenOnSockets = () => {
    const socket = SocketManager.getInstance().getSocket();
    socket.on('lobby update', (data) => {
      if(this.gameSpecifiedExists(data.lobbyCode)) {
        let gameIndex = this.getGameIndexFromLobbyCode(data.lobbyCode);
        let lobbies = this.state.games;
        if(data.players.length !== 0) {
          lobbies[gameIndex].numPlayers = data.players.length;
        } else {
          lobbies.splice(gameIndex, 1);
        }
        this.setState({games: lobbies});
      }
    });
    socket.on('new lobby', (data) => {
      if (!this.gameSpecifiedExists(data.lobbyCode)) {
        let newLobby = {lobbyCode: data.lobbyCode, name: data.lobbyName, numPlayers: data.players.length, public: data.public};
        // TODO check for private games
        //      note: are private game updates being emitted?
        let lobbies = this.state.games;
        lobbies.push(newLobby);
        this.setState( { games: lobbies});
      }
    });
  }

  hostNewGame = () => {
    // same code as in home.js
    // generate a random 4 digit room code / lobby code
    let roomCode = "";
    let menu = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var menuLength = 26;
    for (let i = 0; i < 4; i++)
      roomCode += menu.charAt(Math.floor(Math.random() * menuLength));

    // load lobby page. Not sure how else to do it. This is not very React-y
    window.location.href = "/lobby/:" + roomCode;
  }

  // ----- These are all closely related --------------------------------------
  joinGame = (i) => {
    // send user to the game they clicked on, indicated by game index 'i'
    // todo: there's probably a much, MUCH better way of doing this...
    //       I'm just passing the lobbyCode in via the URL, GET-style
    window.location.href = "/lobby/:" + this.state.games[i].lobbyCode;
  }


  joinGameViaCode = (event) => {
    console.log(this.state.typedJoinCode);
    if (this.state.typedJoinCode.length !== 4) 
      alert("Lobby codes are 4 letters long: try re-entering");
    else if ( ! this.privateGameExists(this.state.typedJoinCode) )
      alert("Uh oh! A game with the lobby code \"" + this.state.typedJoinCode + 
            "\" does not exist right now.");
    // else if ( this.gameIsFull(this.state.typedJoinCode) ) // TODO add check to see if game full
    //   alert("You can't join game \"" + this.state.typedJoinCode +
    //         "\": maximum players reached!");
    else  // valid game specified, so send the user to it
      window.location.href = "/lobby/:" + this.state.typedJoinCode;
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
  // ----- / closely related --------------------------------------------------


  joinCodeUpdater = (event) => {
    let name = event.target.name;
    let val = event.target.value;
    const accepted = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if ( accepted.includes(val[val.length - 1]) || val === "")
      this.setState({[name]: val.toUpperCase()});
    else 
      alert("Oops! Lobby codes can only include letters.");
  }


  getGameTable = () => {
    let gameTable = [];
    if (this.state.games.length === 0) {
      // If there are no games available
      gameTable.push(
          <td className="no-games-available">
            <h1 onClick={ () => this.hostNewGame() }>No games available... Click to host one!</h1>
            {/*<button onClick={() => window.location.href = "/join"}>Host Game</button>*/}
            <button onClick={ () => this.hostNewGame() }>Host Game</button>
          </td>
      )
    } else {
      // If there are games available
      gameTable.push( // table headings
          <tr key="headings">
            <td className="game-name">Name</td>
            <td className="player-count">Players</td>
            <td className="join-game">&nbsp;</td>
          </tr>
      );
      // rest of the table, from the list of games
      for (let i = 0; i < this.state.games.length; i++) {
        if (this.state.games[i].public) {  // render only public games
          gameTable.push(
              <tr key={"game" + (i + 1)}>
                <td className="game-name">
                  {this.state.games[i].name}
                </td>

                <td className="player-count">
                  {this.state.games[i].numPlayers}/{this.MAX_PLAYERS_PER_GAME}
                </td>

                <td className="join-game">
                  {this.gameIsFull(this.state.games[i].lobbyCode) ?
                      <div className="not-joinable">
                        Full
                      </div>
                      :
                      <button onClick={() => this.joinGame(i)}>Join</button>
                  }

                </td>

              </tr>
          ); // playerTable.push
        } // if
      } // for
    }
    return gameTable;
  }


  render = () => {
    return (
        <div>
          {!this.state.loading ?
            <div id='join'>
              <div id="join-heading"><h1>Join Game</h1></div>

              <table id="games">
                <tbody>{this.getGameTable()}</tbody>
              </table>

              <div id="join-by-code">
                <form onSubmit={this.joinGameViaCode}>
                  <div className="setting">
                    <div className="labl">Join by code:&nbsp;</div>
                    <div className="inpt">
                      <input
                          type='text'
                          maxLength='4'
                          name='typedJoinCode'
                          className='joinWithCodeField'
                          value={this.state.typedJoinCode}
                          onChange={this.joinCodeUpdater}
                      />
                      <input type='submit' value='Join'/>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            :
            <div id='lobby' style={{ textAlign: 'center' }}>
              Loading...
            </div>
          }
        </div>
    );
  }
}

export default WithAuth(Join);