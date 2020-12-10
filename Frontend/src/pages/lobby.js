// page for viewing/configuring (if the host) a specific game lobby

// NOTE: this page conditionally renders elements depending on whether
//       the user is the host, which it knows via the this.state.iAmHost flag.
//       Also note: a player (indicated by this.state.myPlayerIndex) can only
//       toggle his own Ready status (this is intentional).

// todo: once things are wired up and working, we probably need to include a 
//       menu of code to choose from, and if we have time: a way of uploading
//       your own blocks of code to use for the game.

// todo: the settings at bottom of page should only be editable by Host.

import React from 'react';
import WithAuth from './withAuth';
import './_styling/lobby.css';

class Lobby extends React.Component {
  constructor() {
    super();
    this.state = {
      lobbyCode: this.getLobbyCode(),
      lobbyName: "",
      isPublicLobby: true,
      timeLimit: 60,
      players: [],
      myPlayerIndex: 0,
      iAmHost: this.determineIfIAmHost(),
    };
    this.DEBUG = true;  // for console debug info
    this.alreadyToggledReady = false;
    this.readyFlashedAlready = false;
  }


  componentDidMount = () => {
    this.loadLobbyDataFromDB();
    // these first two used to be set to 1ms. Auth seems to slow things down...
    setTimeout(()=> this.resizeNameBox(this.state.lobbyName), 200); 
    setTimeout(()=> this.resizeTableForNonAdmins(this.state.lobbyName), 200);
    setTimeout(()=> this.flashVisualIndicatorForReadyButton(), 10000);
  }


  loadLobbyDataFromDB = () => {
    // todo: replace the hardcoded lobby data below with actual data from our DB.
    //       Fetch the lobby data from the db using this.state.lobbyCode as the key,
    //       -and then use it to setState() for this lobby.      

    // Hardcoded data to replace: =============================================
    
    // The player data should really be included as a part of the game data 
    // (each game should have a list of players part of its data). For simplicity
    // with this sample data, I'm just going to keep them separate and use the same
    // player data for all games listed below. Again: this is just for demo purposes.
    let players = [ {name: "Sarah W.", isHost: true, isReady: true},
                    {name: "Navjeet Pravdaal", isHost: false, isReady: false}, 
                    {name: "Chloe Salzar", isHost: false, isReady: true},
                    {name: "ThiccBoi McGee", isHost: false, isReady: true},
                    {name: "Mr. McChungus", isHost: false, isReady: false} ];
    let games = 
      [ {lobbyCode: "ASDF", name: "Herbert's Super Cool Game", numPlayers: 1, timeLimit: 60, public: true},
        {lobbyCode: "XYZC", name: "THICCness", numPlayers: 4, timeLimit: 60, public: true},
        {lobbyCode: "WOOT", name: "SENG 513", numPlayers: 4, timeLimit: 120, public: false},
        {lobbyCode: "IJKL", name: "Nice Polite People Only", numPlayers: 1, timeLimit: 60, public: true}, 
        {lobbyCode: "RUOK", name: "nastY SHIZZZZ", numPlayers: 5, timeLimit: 60, public: true},
        {lobbyCode: "ECMA", name: "idk whatever", numPlayers: 3, timeLimit: 40, public: true}, ];

    // Which lobby did the user click on, if they got here via the Join page?
    // (You don't have to do with the real data from the db)
    let index = -1;
    for (let i = 0; i < games.length; i++) {
      if ( games[i].lobbyCode === this.state.lobbyCode ) {
         index = i;
         break;
      }
    }
    // for simplicity (a hardcoded user to represent me)
    let me = {name: "Me", isHost: true, isReady: false};
    // Now, just set the state with that data. 
    // Below I have to handle two cases because I'm trying to match user behaviour with the sample data
    // (...you don't have to do this with the real data)
    // So: if lobby code isn't in the placeholder data, the user proably got here via homepage
    // and is hosting, so initialilize the lobby data for that:
    if ( index === -1 ) {
      this.setState({   lobbyName: '(edit name)', 
                        isPublicLobby: true, 
                        timeLimit: 60, 
                        players: [me],
                        myPlayerIndex: 0,
                        iAmHost: true
                    });
      return; // we're done in this case (for the host)
    }
    // for players who joined via the Join screen
    let playersPlusMe = players.slice(0, games[index].numPlayers);
    me.isHost = false;
    playersPlusMe.push(me);
    this.setState({   lobbyName: games[index].name, 
                      isPublicLobby: games[index].public,
                      timeLimit: games[index].timeLimit,
                      players: playersPlusMe,
                      myPlayerIndex: games[index].numPlayers,
                      iAmHost: false
                  });
    // ======== / hardcoded ===================================================
  }


  getLobbyCode = () => {
    // pull the code from the last 4 digits of the URL, defined by sending page
    // (There's probably a much more React-y way to do this...)
    let url = window.location.pathname;
    return url.substr(url.length - 4);
  }


  determineIfIAmHost = () => {
    // todo:  come up with a less hacky way of determining if this user
    //        is the admin. For now, it just looks at the referring page
    //        to determine this, which could easily be sidestepped.
    let lastURL = document.referrer;
    if ( lastURL.substr(lastURL.length - 4) === "join" )
        return false; // user reached this page via the join page, so he is
                      // an ordinary player, not a host.

    return true; // user (likely) got to this page by clicking "Host" button
                 // on home page. This is definitely not an infaliable way
                 // of doing this, but it will work for now.
  }


  resizeNameBox = (roomName) => {
    // properly sizes lobby name. Needs a slight delay...
    // this method is inefficient, but oh well. Fix if all else is done.
    const nameBox = this.state.iAmHost ? 
                      document.querySelector(".editable-name") :
                      document.querySelector(".fixed-name");
    const lobbyName = document.querySelector("#lobby-name");
    let extraRoom = 0;
    if (roomName.length < 12) {
      document.querySelector("#lobby-name").style.fontSize = "50px";
      if (this.state.iAmHost) extraRoom = 14;
      nameBox.style.width = String(roomName.length * 30 + extraRoom)+"px";
      lobbyName.style.marginTop = "15px";
    } else if (roomName.length < 23) {
      document.querySelector("#lobby-name").style.fontSize = "30px";
      extraRoom = this.state.iAmHost ? 10 : 0;
      nameBox.style.width = String(roomName.length * 18 + extraRoom)+"px";
      lobbyName.style.marginTop = "25px";
    } else {
      document.querySelector("#lobby-name").style.fontSize = "24px";
      nameBox.style.width = String(roomName.length * 13 + 22)+"px"; // was 14
      lobbyName.style.marginTop = "30px";
    }
  }


  flashVisualIndicatorForReadyButton = () => {
    if (this.alreadyToggledReady) 
       return;
    this.readyFlashedAlready = true;
    document.querySelector('.myReadyBtn').classList.add('flashReady');
  }
  

  resizeTableForNonAdmins = () => {
    // resize and center table when not Admin
    if ( ! this.state.iAmHost ) {
      let elements = document.querySelectorAll("#players td:nth-child(3)");
      for (let x of elements)
        x.style.display = "none";

      elements = document.querySelectorAll(".player-name");
      for (let x of elements)
        x.style.flex = "80";

      elements = document.querySelectorAll(".is-ready");
      for (let x of elements)
        x.style.flex = "20";

      document.querySelector('#lobby table').style.width = '80%';
    }
  }

  
  copyLobbyCode = () => {
    // copies the lobby code to the clipboard
    navigator.clipboard.writeText(this.state.lobbyCode);
    alert("Copied!");
  }


  toggleReady = (i) => {

    if ( ! this.alreadyToggledReady && this.readyFlashedAlready ) {
      const myReadyButton = document.querySelector(".myReadyBtn");
      myReadyButton.classList.remove("flashReady");
      myReadyButton.classList.remove("not-ready");
      myReadyButton.classList.add("ready");
    }
    
    let toggled = this.state.players;
    toggled[i].isReady = !toggled[i].isReady;
    this.setState({ players: toggled });


    this.alreadyToggledReady = true;
    this.DEBUG && console.log("Player " + (i+1) + " ready?  " +
                               this.state.players[i].isReady);
  }


  removePlayer = (playerIndex) => {
    // todo
    alert("todo: implement this removePlayer() method");

  }


  startGame = () => {
    // todo
    alert("todo: implement this startGame() method properly");

    // just for demo purposes:
    window.location.href = "/game/:" + this.state.lobbyCode;
  }


  getPlayerTable = () => {
    let playerTable = [];
    playerTable.push(  // table headings
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
    // rest of the table, from the list of players
    for (let i = 0; i < this.state.players.length; i++) {
      playerTable.push( 
        <tr key={"player"+(i+1)}>
          <td className="player-name">
            {this.state.players[i].name} 
            {this.state.players[i].isHost ? " (Host)" : ""}
          </td>
          <td className="is-ready">
            { i === this.state.myPlayerIndex ?
              <button 
                className={this.state.players[i].isReady ? "ready myReadyBtn" : "not-ready myReadyBtn"}
                onClick={ () => this.toggleReady(i) } >
                Ready
              </button>
            : 
              <div className ={this.state.players[i].isReady ? "ready" : "not-ready"}>
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
      ); // playerTable.push
    }
    return playerTable;
  }


  settingsChangeHandler = (event) => {
    let name = event.target.name;
    let val = (name === 'isPublicLobby') ? event.target.checked : 
                                            event.target.value;
    this.setState({[name]: val});
    this.DEBUG && console.log(name + ": " + val);
    if (name === "lobbyName")
      this.resizeNameBox(val);
  }
  

  render = () => {
    return (
      <div id='lobby'>
        <div id="top-section">
          <div id="lobby-name">
            { this.state.iAmHost ? // if user is Host, show editable name 
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
          <div id="lobby-code-section">
            <div id="code-heading">Lobby Code:</div>
            <button className="copy-btn" onClick={() => this.copyLobbyCode()}>
              Copy
            </button>
            <div id="code">{this.state.lobbyCode}</div>
          </div>
        </div>

        <table id="players">
          <tbody>{this.getPlayerTable()}</tbody>
        </table>

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
                    max={9999}
                    name='timeLimit'
                    className='timefield'
                    value={this.state.timeLimit}
                    onChange={this.settingsChangeHandler}
                  />
                </div>
              </div>

              <div className="setting">
                <div className="labl">Private Lobby?&nbsp;</div> 
                <div className="inpt">
                  <input 
                  type='checkbox' 
                  name='isPublicLobby'
                  className='checkbox'
                  value={!this.state.isPublicLobby}
                  onChange={this.settingsChangeHandler}
                  />
                </div>
              </div>
            </form>
          :
            <div id="lobby-settings-fixed">
              <p>time: <span className="time-digits">
                {this.state.timeLimit}</span> seconds</p>
              <p>{this.state.isPublicLobby ? 
                <span className="public">public</span> : 
                <span className="private">private</span>} lobby</p>
            </div>
          }
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

export default WithAuth(Lobby);