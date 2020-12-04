// page for viewing/configuring (if the host) a specific lobby

// NOTE: this page conditionally renders elements depending on whether
//       the user is the host, which it knows via the this.state.iAmHost flag.
//       Also note: a player (indicated by this.state.myPlayerIndex) can only
//       toggle his own Ready status (this is intentional).

// todo: the settings at bottom of page should only be editable by Host.
// todo: the mobile styling needs work (spacing, sizing)
// todo: (there are more embedded in the code below)

// ^ I'll do/fix these soon (Cody)



import React from 'react';
import './_styling/lobby.css';

//import Editable_lobby_name from '../components/lobby/editable-lobby-name';

export default class Lobby extends React.Component {
  constructor() {
    super();
    this.state = {
      roomCode: this.getRoomCode(),
      lobbyName: "(edit me)",
      isPrivateLobby: false,
      timeLimit: 60,
      players: this.loadPlayers(),  // todo (returns hardcoded player array rn)
      myPlayerIndex: 0,  // todo: (hardcoded rn)  Host should be index 0
      iAmHost: this.determineIfIAmHost()  // todo (returns hardcoded value rn)
    };
    this.DEBUG = true;  // for console debug info
  }

  getRoomCode = () => {
    // pull the code from the last 4 digits of the URL, defined by sending page
    // (There's probably a much more React-y way to do this...)
    let url = window.location.pathname;
    return url.substr(url.length - 4);
  }

  loadPlayers = () => {
    // todo: get the ACTUAL player data from somewhere else/via some process
    return [ {name: "Player 1", isHost: true, isReady: true},
             {name: "Player 2", isHost: false, isReady: false}, 
             {name: "Player 3", isHost: false, isReady: true} ];
  }

  determineIfIAmHost = () => {
    // todo:
    // should use the current user's player index to access the information...
    // in the this.state.players array and see if user's 'isHost' flag is set.
    // Where do we get the current user's player index from?
    // ...perhaps from props that are passed into this component... 
    // for now, I'm just hardcoding the value
    return true;
  }
  
  copyRoomCode = () => {
    navigator.clipboard.writeText(this.state.roomCode);
    alert("Copied!");
  }

  toggleReady = (playerIndex) => {
    if (playerIndex != this.state.myPlayerIndex)
      return;  // can only toggle your own Ready status
    let toggled = this.state.players;
    toggled[playerIndex].isReady = !toggled[playerIndex].isReady;
    this.setState({ players: toggled });
    this.DEBUG && console.log("Player " + (playerIndex+1) + " ready?  " +
                               this.state.players[playerIndex].isReady);
  }

  removePlayer = (playerIndex) => {
    alert("Alert fired from inside the 'removePlayer()' method.\n" + 
          "Request to remove: " + this.state.players[playerIndex].name + "\n" +
          "Replace this with code that removes this player from the lobby.");
  }

  buildPlayerTable = () => {
    let playerTable = [];
    playerTable.push(
      <tr key="headings">
        <td className="player-name">Players</td>
        {/* <td className="is-ready">Status<br/>
            <div className="click-when-ready">click when ready</div></td> */}
        <td className="is-ready">Status</td>
        <td className="remove-player">Remove?</td>
      </tr>
    );
    const numPlayers = this.state.players.length;
    for (let i = 0; i < numPlayers; i++) {
      playerTable.push( 
        <tr key={"player"+(i+1)}>
          <td className="player-name">
            {this.state.players[i].name} 
            {this.state.players[i].isHost ? " (Host)" : ""}
          </td>
          <td className="is-ready">
            { i === this.state.myPlayerIndex ?
              <button 
                className={this.state.players[i].isReady ? "ready" : "not-ready"}
                onClick={ () => this.toggleReady(i) } >
                Ready
              </button>
            : <div className ={this.state.players[i].isReady ? "ready" : "not-ready"}>
                Ready
              </div>  
            }
          </td>
          { this.state.players[i].isHost  ? // Host can't remove himself
              <td className="inviz">&nbsp;</td> 
              : 
              <td className="remove-player">
                <button onClick={ () => this.removePlayer(i) }>X</button>
              </td>
          }
        </tr>
      ); // playerTable.push
    }
    return playerTable;
  }

  startGame = () => {
    alert("Alert fired from inside the 'startGame()' method.\n" +
          "Replace this with code that starts the game.");
  }

  settingsChangeHandler = (event) => {
    let name = event.target.name;
    let val = (name === 'isPrivateLobby') ? event.target.checked : 
                                            event.target.value;
    this.setState({[name]: val});
    this.DEBUG && console.log(name + ": " + val);
    if (name === "lobbyName")
      this.resizeNameBox(val);
  }
  
  resizeNameBox = (roomName) => {
    // this method is inefficient, but oh well. Fix if all else is done.
    const nameBox = this.state.iAmHost ? 
                      document.querySelector(".editable-name") :
                      document.querySelector(".fixed-name");
    let extraRoom = 0;
    if (roomName.length < 12) {
      document.querySelector("#lobby-name").style.fontSize = "50px";
      if (this.state.iAmHost) extraRoom = 14;
      nameBox.style.width = String(roomName.length * 30 + extraRoom)+"px";
    } else if (roomName.length < 23) {
      document.querySelector("#lobby-name").style.fontSize = "30px";
      extraRoom = this.state.iAmHost ? 10 : 0;
      nameBox.style.width = String(roomName.length * 17 + extraRoom)+"px";
    } else {
      document.querySelector("#lobby-name").style.fontSize = "24px";
      nameBox.style.width = String(roomName.length * 13 + 22)+"px"; // was 14
    }
  }

  componentDidMount = () => {
      this.resizeNameBox(this.state.lobbyName);  // properly sizes lobby name
      if (! this.state.iAmHost) {  // only Host can remove players via a button
        const ejectBtns = document.querySelectorAll("#players td:nth-child(3)")
        for (let btn of ejectBtns)
             btn.style.display = "none";
      }
  }

  render = () => {
    return (
      <div id='lobby'>

        <a href="../join"><button className="back-btn">Back</button></a>

        <div id="top-section">
          <div id="lobby-name">
            { this.state.iAmHost ? // if user is Host, show an editable lobby name  
              <form>
                <input
                  type='text' 
                  name='lobbyName'
                  className='editable-name'
                  value={this.state.lobbyName}
                  onChange={this.settingsChangeHandler}
                />
              </form>
            :  // else (user isn't Host) just display the lobby name
              <div className="fixed-name">{this.state.lobbyName}</div>
            }lobby
          </div>
          <div id="room-code-section">
            <div id="code-heading">Room Code:</div>
            <button className="copy-btn" onClick={ () => this.copyRoomCode() }>
              Copy
            </button>
            <div id="code">{this.state.roomCode}</div>
          </div>
        </div>

        <table id="players">
          <tbody>{this.buildPlayerTable()}</tbody>
        </table>

        <div id="settings">
          <form>
            <div className="setting">
              <div className="labl">Private Lobby:&nbsp;</div> 
              <div className="inpt">
                <input 
                type='checkbox' 
                name='isPrivateLobby'
                className='checkbox'
                value={this.state.isPrivateLobby}
                onChange={this.settingsChangeHandler}
                />
              </div>
            </div>

            <div className="setting">
              <div className="labl">Time Limit (s):&nbsp;</div>
              <div className="inpt">
                <input 
                  type='number' 
                  name='timeLimit'
                  className='timefield'
                  value={this.state.timeLimit}
                  onChange={this.settingsChangeHandler}
                />
              </div>
            </div>
          </form>
        </div>

        { this.state.iAmHost && // only show start button to Host
          <button className="start-btn" onClick={()=>this.startGame()}>
          START GAME
          </button>
        }
          
      </div>
    );
  }
}