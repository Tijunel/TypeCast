'use strict';

import React from 'react';
import Cookies from 'js-cookie';
import WithAuth from './withAuth';
import './_styling/lobby.css';

class Lobby extends React.Component {
  constructor() {
    super();
    this.timeLimit = React.createRef();
    this.isPrivate = React.createRef();
    this.state = {
      lobbyCode: this.getLobbyCode(),
      lobbyName: "",
      playerUI: [],
      myPlayerIndex: 0,
      iAmHost: false,
      lobbyPosted: false
    };
    this.alreadyToggledReady = false;
    this.readyFlashedAlready = false;
  }

  componentDidMount = () => {
    this.getLobby();
  }

  getLobby = async () => {
    let res = await fetch('/gaming/lobby/' + this.state.lobbyCode, {
      method: 'GET',
			credentials: "include",
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.status === 200) {
      res = await res.json();
      this.setState({ lobbyName: res.body.name, iAmHost: false, lobbyPosted: true });
      // Join lobby
    } else {
      this.setState({ 
        lobbyName: JSON.parse(Cookies.get('userData').split('j:')[1]).username + "'s Lobby", 
        iAmHost: true
      });
    }
  }

  createLobby = async () => {
    let player = {
      username: JSON.parse(Cookies.get('userData').split('j:')[1]).username,
      isHost: true,
      isReady: false
    };
    let res = await fetch('/gaming/createLobby', {
      method: 'POST',
			credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lobbyCode: this.getLobbyCode(),
        lobbyName: this.state.lobbyName,
        timeLimit: this.timeLimit.current.value,
        public: !this.isPrivate.current.checked, 
        player: player
      })
    });
    if(res.status === 200) {
      let playerUI = this.generatePlayerUI([player]);
      this.setState({lobbyPosted: true, playerUI: playerUI});
    } else {
      let playerUI = this.generatePlayerUI([player]);
      this.setState({lobbyPosted: true, playerUI: playerUI});
    }
  }

  getLobbyCode = () => {
    let url = window.location.pathname;
    return url.substr(url.length - 4);
  }

  copyLobbyCode = () => {
    navigator.clipboard.writeText(this.state.lobbyCode);
    alert("Copied to clipboard.");
  }

  flashVisualIndicatorForReadyButton = () => {
    if (this.alreadyToggledReady) return;
    this.readyFlashedAlready = true;
    document.querySelector('.myReadyBtn').classList.add('flashReady');
  }
  
  resizeTableForAdmins = () => {
    if (this.state.iAmHost) {
      let elements = document.querySelectorAll("#players td:nth-child(3)");
      for (let x of elements) x.style.display = "block";
      elements = document.querySelectorAll(".player-name");
      for (let x of elements) x.style.flex = "60";
      elements = document.querySelectorAll(".is-ready");
      for (let x of elements) x.style.flex = "25";
      document.querySelector('#lobby table').style.width = '100%';
    }
  }

  toggleReady = (i) => {
    if (!this.alreadyToggledReady && this.readyFlashedAlready) {
      const myReadyButton = document.querySelector(".myReadyBtn");
      myReadyButton.classList.remove("flashReady");
      myReadyButton.classList.remove("not-ready");
      myReadyButton.classList.add("ready");
    }
    let toggled = this.state.players;
    toggled[i].isReady = !toggled[i].isReady;
    this.setState({ players: toggled });
    this.alreadyToggledReady = true;
  }

  removePlayer = (playerIndex) => {
    alert("todo: implement this removePlayer() method");
  }

  startGame = () => {
    alert("todo: implement this startGame() method properly");
    // just for demo purposes:
    window.location.href = "/game/:" + this.state.lobbyCode;
  }

  generatePlayerUI = (players) => {
    let playerTable = [];
    playerTable.push(  
      <tr key="headings">
        <td className="player-name">Players</td>
        <td className="is-ready">Status</td>
        { this.state.iAmHost ? 
          <td className="remove-player">Remove?</td>
        :  
          <td className="inviz"> &nbsp;</td>
        }
      </tr>
    );
    for (let i = 0; i < players.length; i++) {
      playerTable.push( 
        <tr key={"player"+(i+1)}>
          <td className="player-name">
            {players[i].username} 
            {players[i].isHost ? " (Host)" : ""}
          </td>
          <td className="is-ready">
            { i === this.state.myPlayerIndex ?
              <button 
                className={players[i].isReady ? "ready myReadyBtn" : "not-ready myReadyBtn"}
                onClick={ () => this.toggleReady(i) } >
                Ready
              </button>
            : 
              <div className ={players[i].isReady ? "ready" : "not-ready"}>
                Ready
              </div>  
            }
          </td>
          { this.state.iAmHost && i !== this.state.myPlayerIndex  ?
            <td className="remove-player">
              <button onClick={ () => this.removePlayer(i) }>X</button>
            </td>
          :
            <td className="inviz">&nbsp;</td> 
          }
        </tr>
      ); 
    }
    return playerTable;
  }
  
  render = () => {
    return (
      <div id='lobby'>
          <div id="lobby-name">
            {this.state.lobbyName}
          </div>
          <div id="lobby-code-section">
            <div id="code-heading">Lobby Code:</div>
          </div>
          <div style={{height: '80px'}}>
            <div class='row'>
              <div class='col' style={{padding: '0'}}>
              <div id="code" style={{width: '110px', marginRight: '0',float: 'right'}}>{this.state.lobbyCode}</div>
              </div>
              <div class='col' style={{padding: '0'}}>
              <button className="copy-btn" onClick={() => this.copyLobbyCode()} style={{width: '110px'}}>
                Copy
              </button>
              </div>
            </div>
          </div>
        {
          this.state.lobbyPosted ?
            <table id="players">
              <tbody>{this.state.playerUI}</tbody>
            </table>
            : 
            ""
        }
        <div id="settings">
          { this.state.iAmHost ?
            <form>
              <div className="setting">
                <div className="labl">
                  Time Limit <span className="seconds">(seconds)</span>&nbsp;
                </div>
                <div className="inpt">
                  <input 
                    type='number'
                    max={120}
                    className='timefield'
                    defaultValue={60}
                    ref={this.timeLimit}
                  />
                </div>
              </div>
              <div className="setting">
                <div className="labl">Private Lobby?&nbsp;</div> 
                <div className="inpt">
                  <input 
                  type='checkbox' 
                  className='checkbox'
                  ref={this.isPrivate}
                  />
                </div>
              </div>
            </form>
          :
            <div id="lobby-settings-fixed">
              <p>time: <span className="time-digits">
                {this.state.timeLimit}</span> seconds</p>
              <p>{this.isPrivate.current !== null && !this.isPrivate.current.checked ? 
                <span className="public">public</span> : 
                <span className="private">private</span>} lobby</p>
            </div>
          }
        </div>
        { this.state.iAmHost && !this.state.lobbyPosted && // only show start button to Host
          <button className="start-btn" onClick={()=>this.createLobby()}>
          CREATE LOBBY
          </button>
        }
        { this.state.iAmHost && this.state.lobbyPosted && // only show start button to Host
          <button className="start-btn" onClick={()=>this.startGame()}>
          START GAME
          </button>
        }
      </div>
    );
  }
}

export default WithAuth(Lobby);