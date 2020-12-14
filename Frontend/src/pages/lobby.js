'use strict';

import React from 'react';
import Cookies from 'js-cookie';
import WithAuth from './withAuth';
import SocketManager from '../socket';
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
      lobbyPosted: false,
      private: false,
      timeLimit: 60,
      loading: true,
      ready: false,
      gameReady: false,
      redirected: false,
      started: false
    };
  }

  componentDidMount = () => {
    this.listenOnSockets();
    this.getLobby();
  }

  // Lobby Control
  getLobby = async () => {
    let res = await fetch('/gaming/lobby/' + this.state.lobbyCode, {
      method: 'GET',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.status === 200) {
      res = await res.json();
      let playerUI = this.generatePlayerUI(res.players);
      this.setState({ lobbyName: res.lobbyName, iAmHost: false, lobbyPosted: true, timeLimit: res.timeLimit, private: !res.public, playerUI: playerUI, loading: false });
      this.listenOnSockets();
      let player = {
        username: JSON.parse(Cookies.get('userData').split('j:')[1]).username,
        isHost: false,
        isReady: false
      };
      await fetch('/gaming/join', {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyCode: this.state.lobbyCode, player: player })
      });
    } else {
      this.setState({
        lobbyName: JSON.parse(Cookies.get('userData').split('j:')[1]).username + "'s Lobby",
        iAmHost: true,
        lobbyPosted: false,
        loading: false
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
    if (res.status === 200) {
      let playerUI = this.generatePlayerUI([player]);
      this.setState({ lobbyPosted: true, playerUI: playerUI, private: this.isPrivate.current.checked});
      this.resizeTableForAdmins();
    } else alert("Something went wrong, try again.");
    await this.getLobby();
  }

  listenOnSockets = () => {
    const socket = SocketManager.getInstance().getSocket();
    socket.on('lobby update', (data) => {
      if (data.lobbyCode === this.state.lobbyCode && !this.state.started) {
        if (data.players.length === 0 && !this.state.redirected) {
          alert('Lobby no longer exists...');
          this.setState({ redirected: true });
          window.location.href = "/home";
        } else {
          this.kickSelf(data.players);
          let playerUI = this.generatePlayerUI(data.players);
          let ready = this.isGameReady(data.players);
          this.setState({ playerUI: playerUI, gameReady: ready });
          this.resizeTableForAdmins();
        }
      }
    });
    socket.on('go to game', (data) => {
      if(data.lobbyCode === this.state.lobbyCode) {
        window.location.href = "/game/:" + this.state.lobbyCode;
        this.setState({ started: true });
      }
    });
  }

  kickSelf = (players) => {
    let stillPlaying = false;
    for (let player of players)
      if (player.username === JSON.parse(Cookies.get('userData').split('j:')[1]).username)
        stillPlaying = true;
    if (!stillPlaying && !this.state.redirected) {
      alert('You have been kicked from the lobby...');
      this.setState({ redirected: true });
      window.location.href = "/home";
    }
  }

  isGameReady = (players) => {
    let ready = true;
    for (let player of players)
      if (!player.isReady) ready = false;
    return ready;
  }

  toggleReady = async (username) => {
    if (username !== JSON.parse(Cookies.get('userData').split('j:')[1]).username)
      return;
    const res = await fetch('/gaming/readyup/', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isReady: !this.state.isReady,
        lobbyCode: this.state.lobbyCode
      })
    });
    if (res.status === 200) this.setState({ isReady: !this.state.isReady });
  }

  startGame = () => {
    fetch('/gaming/start/', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lobbyCode: this.state.lobbyCode
      })
    })
      .then(res => {
        if (res.status === 200) {
          window.location.href = "/game/:" + this.state.lobbyCode;
        } else alert("Couldn't start game, please try again.");
      })
      .catch(err => {
        alert("Couldn't start game, please try again.");
      });
  }

  removePlayer = (username) => {
    fetch('/gaming/remove/', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lobbyCode: this.state.lobbyCode,
        username: username
      })
    });
  }

  getLobbyCode = () => {
    let url = window.location.pathname;
    return url.substr(url.length - 4);
  }

  copyLobbyCode = () => {
    navigator.clipboard.writeText(this.state.lobbyCode);
    alert("Copied to clipboard.");
  }

  // UI Helpers
  generatePlayerUI = (players) => {
    let playerTable = [];
    playerTable.push(
      <tr key="headings">
        <td className="player-name">Players</td>
        <td className="is-ready">Status</td>
        {this.state.iAmHost ?
          <td className="remove-player">Remove?</td>
          :
          <td className="inviz"> &nbsp;</td>
        }
      </tr>
    );
    for (let i = 0; i < players.length; i++) {
      playerTable.push(
        <tr key={"player" + (i + 1)}>
          <td className="player-name">
            {players[i].username}
            {players[i].isHost ? " (Host)" : ""}
          </td>
          <td className="is-ready">
            {players[i].username === JSON.parse(Cookies.get('userData').split('j:')[1]).username ?
              <button
                className={players[i].isReady ? "ready myReadyBtn" : "not-ready myReadyBtn"}
                onClick={() => this.toggleReady(players[i].username)} >
                Ready
              </button>
              :
              <div className={players[i].isReady ? "ready" : "not-ready"}>
                Ready
              </div>
            }
          </td>
          {this.state.iAmHost ? (players[i].username !== JSON.parse(Cookies.get('userData').split('j:')[1]).username) &&
            <td className="remove-player">
              <button onClick={() => this.removePlayer(players[i].username)}>X</button>
            </td>
            :
            <td className="inviz">&nbsp;</td>
          }
        </tr>
      );
    }
    return playerTable;
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
      //document.querySelector('#players').style.width = '100%';
    }
  }

  render = () => {
    return (
      <div>
        {!this.state.loading ?
          <div id='lobby'>
            <div id="lobby-name">
              {this.state.lobbyName}
            </div>
            <div id="lobby-code-section">
              <div id="code-heading">Lobby Code:</div>
            </div>
            <div style={{ height: '80px' }}>
              <div class='row'>
                <div class='col' style={{ padding: '0' }}>
                  <div id="code" style={{ width: '110px', marginRight: '0', float: 'right' }}>{this.state.lobbyCode}</div>
                </div>
                <div class='col' style={{ padding: '0' }}>
                  <button className="copy-btn" onClick={() => this.copyLobbyCode()} style={{ width: '110px' }}>
                    Copy
                </button>
                </div>
              </div>
            </div>
            {this.state.lobbyPosted &&
              <table id="players">
                <tbody>{this.state.playerUI}</tbody>
              </table>
            }
            {this.state.iAmHost && !this.state.lobbyPosted ?
              <div id="settings">
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
              </div>
              :
              <div id="settings">
                <div id="lobby-settings-fixed">
                  <p>Time Limit: <span className="time-digits">
                    {this.state.timeLimit}</span> seconds</p>
                  <p>{!this.state.private ?
                    <span className="public">Public</span> :
                    <span className="private">Private</span>} lobby</p>
                </div>
              </div>
            }
            {this.state.iAmHost && !this.state.lobbyPosted &&
              <button className="start-btn" onClick={() => this.createLobby()}>
                CREATE LOBBY
            </button>
            }
            {this.state.iAmHost && this.state.lobbyPosted && this.state.gameReady ?
              <button className="start-btn" onClick={() => this.startGame()}>
                START GAME
              </button>
              :
              this.state.lobbyPosted && this.state.gameReady && <div style={{ textAlign: 'center' }}>Waiting for host to start the game...</div>
            }
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

export default WithAuth(Lobby);