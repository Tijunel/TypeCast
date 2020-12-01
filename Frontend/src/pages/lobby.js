// page for viewing/configuring (if the host) a specific lobby

import React from 'react';
import './_styling/lobby.css';

export default class Lobby extends React.Component {
	constructor() {
		super();
		this.DEBUG = true;  // for debug info shown via the console
		this.state = {
			roomCode: this.generateRoomCode(),
			lobbyName: "(name me)",
			isPrivateLobby: false,
			timeLimit: 60,
			players: this.loadPlayers(),
			myPlayerIndex: 0, // somehow have to deternime this (hardcoded for now)
			iAmHost: this.determineIfIAmHost() // returns a hardcoded value for now
		};
	}

	generateRoomCode = () => {
		// todo: make it generate a random code instead
		return "JGGS";
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
						<button 
							className={this.state.players[i].isReady ? "ready" : "not-ready"}
							onClick={ () => this.toggleReady(i) } >
							Ready
						</button>
					</td>
					{ this.state.players[i].isHost ?
							<td className="inviz" 
							    style={{flex: "15", border: "1.5px solid transparent"}}></td> 
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
		// todo: fix if done everything else. This code is inefficient:
		const nameBox = document.querySelector(".editable-name");
		if (roomName.length < 12) {
			document.querySelector("#lobby-name").style.fontSize = "50px";
			nameBox.style.width = String(roomName.length * 30 + 15)+"px";
		}	else if (roomName.length < 23) {
			document.querySelector("#lobby-name").style.fontSize = "30px";
			nameBox.style.width = String(roomName.length * 18 + 5)+"px";
		} else {
			document.querySelector("#lobby-name").style.fontSize = "24px";
			nameBox.style.width = String(roomName.length * 14)+"px";
		}
	}

	render = () => {
		return (
			<div id='lobby'>

				<a href="../join"><button className="back-btn">Back</button></a>

				<div id="top-section">
					<div id="lobby-name">
						<form>
							<input 
							  type='text' 
								name='lobbyName'
								className='editable-name'
								value={this.state.lobbyName}
								onChange={this.settingsChangeHandler}
							/>lobby
						</form>
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

				{this.state.iAmHost && <button className="start-btn" onClick={ () => this.startGame() }>
					START GAME
				</button>}
					
			</div>
		);
	}
}