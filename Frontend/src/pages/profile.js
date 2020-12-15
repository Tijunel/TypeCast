'use strict';

import React from 'react';
import Cookies from 'js-cookie';
import WithAuth from './withAuth';
import './_styling/profile.css';

class Profile extends React.Component {
	constructor() {
		super();
		this.newUsername = React.createRef();
		this.password = React.createRef();
		this.currentPassword = React.createRef();
		this.currPassword = React.createRef();
		this.newPassword = React.createRef();
		this.newPassword1 = React.createRef();
		this.newPassword2 = React.createRef();
		this.username = React.createRef();
		this.state = {
			username: "",
			pastGamesTable: [],
			typingSpeed: 0.0,
			changeUNVisible: false,
			changePWVisible: false,
			delAcctVisible: false,
			clearHistoryVisible: false
		}
	}

	componentDidMount = () => {
    this.loadUserData();
    if(document.querySelector('#footer'))
      document.querySelector('#footer').style.background = "rgba(0,0,0,0.5)";
	}


	loadUserData = () => {
		const username = JSON.parse(Cookies.get('userData').split('j:')[1]).username;
		fetch('/userData/games', {
			method: 'GET',
			credentials: "include",
			headers: { 'Content-Type': 'application/json' }
		})
			.then(async res => {
				if (res.status === 200) {
					res = await res.json();
					const pastGamesTable = this.generatePastGamesTable(res.games);
					this.setState({pastGamesTable: pastGamesTable, username: username });
				} 
			})
			.catch(err => {
				alert("Unable to load data.")
			});
    }
    

    generatePastGamesTable = (pastGames) => {
		let pastGamesTable = [];
    let totalTS= 0.0
    pastGamesTable.push( // table forehead
      <tr key="forehead" className="table-forehead"><td>Your Race Results</td></tr>
    );
		pastGamesTable.push( // table headers
			<tr key="headings">
				<td className="position">Pos</td>
				<td className="speed">Speed</td>
				<td className="time">Time</td>
				<td className="date">Date</td>
			</tr>
		);
		let len = 0;
		if (pastGames.length >	10)  {
			len = 10;
		}
		else len = pastGames.length;
		for (let i = pastGames.length - len; i < pastGames.length; i++) {
      let time = String(Math.round(pastGames[i].time * 10) / 10);
      let secondLastCh = time.substring(time.length - 2)[0];
      // No decimal will show if the tenths place digit is a zero.
      // This fixes that (the && !== 'a' covers bad data 'NaN' cases)
      if (secondLastCh !== '.' && secondLastCh !== 'a') 
        time += '.0';
			var l = pastGames[i].date.split('T');
			pastGamesTable.push(
				<tr key={"game" + (i + 1)}>
					<td className="position">
						{pastGames[i].placement}
					</td>
					<td className="speed">
						<div className="speed-number">
              {Math.round(pastGames[i].typingSpeed * 10) / 10}
            </div>
	          <div className="speed-suffix">&nbsp;LPM</div>
					</td>
					<td className="time">
            { pastGames[i].time === "(DNF)" ? 
              <div className="dnf">{pastGames[i].time}</div>
            :
              <><div className="time-number">{time}</div>
              <div className="time-suffix">&nbsp;s</div></>
            }
          </td>
					<td className="date">{l[0]}</td>
				</tr>
			); 
      totalTS += pastGames[i].typingSpeed;
    }
		if (pastGames.length > 0) totalTS = totalTS / pastGames.length;
		else totalTS = 0.0;
		totalTS = Math.round(totalTS * 100) / 100;
		this.setState({typingSpeed: totalTS});
		
		return pastGamesTable;
	}


	clearHistory = () => {
		fetch('/userData/games', {
			method: 'DELETE',
			credentials: "include",
			headers: { 'Content-Type': 'application/json' }
		})
			.then(res => {
				if (res.status === 200) {
					this.setState({ pastGamesTable: [], typingSpeed: 0 });
					alert("Game data reset was successfuly.");
				} 
				else alert("Game data reset was successfully.");
			})
			.catch(err => {
				alert("Error. Game data reset was unsucessful.");
			});
	}


	updateUsernameHandler = (event) => {
		event.preventDefault();
		fetch('/user/', {
			method: 'PUT',
			credentials: "include",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				newUsername: this.username.current.value,
				currPassword: this.currentPassword.current.value,
				newPassword: this.currentPassword.current.value
			})
		})
			.then(res => {
				if (res.status === 200) {
					this.setState({username: JSON.parse(Cookies.get('userData').split('j:')[1]).username});
					alert("Username successfully changed.");	
					this.username.current.value = "";
					this.currentPassword.current.value = "";
				} 
				else   {
					alert("Username change was unsucessful.");
					this.username.current.value = "";
					this.currentPassword.current.value = "";
				}
			})
			.catch(err => {
				alert("Username change was unsucessful...");
				this.username.current.value = "";
				this.currentPassword.current.value = "";
			});
	}


	updatePasswordHandler = (event) => {
		event.preventDefault();
		if (!this.newPasswordInfoChecksOut()) return;
		fetch('/user/', {
			method: 'PUT',
			credentials: "include",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				newUsername: JSON.parse(Cookies.get('userData').split('j:')[1]).username,
				currPassword: this.password.current.value,
				newPassword: this.newPassword1.current.value
			})
		})
			.then(res => {
				if (res.status === 200) {
					alert("Password successfully changed.");
					this.password.current.value = "";
					this.newPassword1.current.value = "";
					this.newPassword2.current.value = "";
				} 
				else {
					alert("Password change was unsucessful...");
					this.password.current.value = "";
					this.newPassword1.current.value = "";
					this.newPassword2.current.value = "";
				}
			})
			.catch(err => {
				alert("Password change was unsucessful.");
				this.password.current.value = "";
				this.newPassword1.current.value = "";
				this.newPassword2.current.value = "";
			});
	}


	deleteAccountHandler = () => {
		this.clearHistory();
		fetch('/user/', {
			method: 'DELETE',
			credentials: "include",
			headers: { 'Content-Type': 'application/json' }
		})
			.then(res => {
				if (res.status === 200) window.location.href = '/login'; //Send to login page
				else  {
					alert("Could not delete account.");
					return;
				} 	
			})
			.catch(err => {
				//Goes into here again after pressing the button. It works but still throws an error.
				alert("Could not delete account...")
				return;
			});
			window.location.href = '/login';
	}


	// sizeTheExtendedFooter = (situation) => {
	// 	// This is janky af. Clean this up if there's time:
	// 	const extFooter = document.querySelector('#extended-footer');
	// 	let offset = extFooter.getBoundingClientRect();
	// 	let topOfFooter = offset.top;
	// 	let diff = window.innerHeight - topOfFooter;
	// 	if (diff > 420) {  // need at least this much px height for the bottom ctrl pannel
	// 		if (situation === "initial load") {
	// 			extFooter.style.cssText = "min-height: calc(100vh - (148px + 398px + 5.5rem));" +
	// 				"position: relative; height: 420px";
	// 		} else if (situation === "after deletion") {
	// 			extFooter.style.cssText = "min-height: calc(100vh - (255px + 70px + 5.5rem))";
	// 		}
	// 	}
	// }


	showChangeUsername = () => {
		this.setState({ changeUNVisible: true, changePWVisible: false, delAcctVisible: false , clearHistoryVisible: false});
	}

	showChangePassword = () => {
		this.setState({ changeUNVisible: false, changePWVisible: true, delAcctVisible: false , clearHistoryVisible: false});
	}

	showDeleteAccount = () => {
		this.setState({ changeUNVisible: false, changePWVisible: false, delAcctVisible: true, clearHistoryVisible: false});
	}

	showClearHistory = () => {
		this.setState({ changeUNVisible: false, changePWVisible: false, delAcctVisible: false, clearHistoryVisible: true });
    }
    
    closePanel = () => {
		this.setState({ changeUNVisible: false, changePWVisible: false, delAcctVisible: false, clearHistoryVisible: false});
	}


	newPasswordInfoChecksOut = () => {
		if (this.newPassword1.current.value !== this.newPassword2.current.value) {
			alert("Woops: your new passwords don't match! Please re-enter them.");
			this.setState({ newPassword1: '', newPassword2: '' });
		}
		else if (this.newPassword1.current.value === '') {
			alert("Sorry, but you need to have a password (you can't set an empty password.)");
		}
		else return true;
		return false;
	}

    
	render = () => {
		return (
			<div id='profile'>

				<div id="tophalf-profile">
					<div id="profile-heading"><h1>{this.state.username}</h1></div>
          <table id="past-games"><tbody>{this.state.pastGamesTable}</tbody></table>
          <div id="table-chin">
              Average coding speed: {this.state.typingSpeed}
          </div>
				</div>

				<div id="extended-footer">
					<div id="user-menu">
						<button onClick={() => this.showChangeUsername()}>Change UserName</button>
						<button onClick={() => this.showChangePassword()}>Change Password</button>
						<button onClick={() => this.showClearHistory()}
								className="text-btn">Reset Score</button>
						<button onClick={() => this.showDeleteAccount()}
							className="del-acct-btn">Delete Account</button>
					</div>



					{this.state.changeUNVisible &&
						<div id="change-username-box">
							<form onSubmit={this.updateUsernameHandler}>

								<div className="flex-container">
                  <label>New Username &nbsp;</label>
                  <input
                    type="text"
                    ref={this.username}
                  />
                </div>

								<div className="flex-container">
                  <label>Password &nbsp;</label>
                  <input
                    type="password"
                    ref={this.currentPassword}
                  />
								</div>

								<input type='submit' value='Change' />
							</form>
						</div>
					}



					{this.state.changePWVisible &&
						<div id="change-password-box">
							<form onSubmit={this.updatePasswordHandler}>
								<div className="flex-container">
									<label>Current password &nbsp;</label>
									<input
										type="password"
										ref={this.password}
									/>
								</div>
								<div className="flex-container">
									<label>New password &nbsp;</label>
									<input
										type="password"
										ref={this.newPassword1}
									/>
								</div>
								<div className="flex-container">
									<label>Confirm &nbsp;</label>
									<input
										type="password"
										ref={this.newPassword2}
									/>
								</div>
								<input type='submit' value='Change' />
							</form>
						</div>
					}
					{this.state.delAcctVisible &&
						<div id="delete-account-box">
							Are you SURE you want to delete your account?<br />
              				It will be gone forever.<br />
							<button onClick={() => this.deleteAccountHandler()}
								className="delete-acct-button">
								YES, PERMANENTLY DELETE MY ACCOUNT
              				</button>
							<br />
							<button onClick={() => this.closePanel()} className="changed-my-mind">
								No! Get me out of here!
              				</button>
						</div>
					}
					{this.state.clearHistoryVisible &&
						<div id="delete-account-box">
							Are you SURE you want to reset your account history?<br />
              				It will be gone forever.<br />
							<button onClick={() => this.clearHistory()}
								className="delete-acct-button">
								YES, PERMANENTLY DELETE MY HISTORY
              				</button>
							<br />
							<button onClick={() => this.closePanel()} className="changed-my-mind">
								No! Get me out of here!
              				</button>
						</div>
					}
					{(this.state.changeUNVisible || this.state.changePWVisible) &&
						<div id="close-pannel-container">
							<button onClick={() => this.closePanel()} className="text-btn">close pannel</button>
						</div>
					}
				</div>
			</div>
		);
	}
}

export default WithAuth(Profile);