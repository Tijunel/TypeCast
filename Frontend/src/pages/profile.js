// page for viewing user's profile

// todo: fill in the 'todo' methods with the appropriate calls to the middleware
//       ... to get and send the user data.

import React from 'react';
import './_styling/profile.css';

export default class Profile extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      pastGames: [],
      changeUNVisible: false,
      changePWVisible: false,
      delAcctVisible: false,
      newUsername: "",      // used when user changes their username
      currentPassword: "",  // used when user changes their password
      newPassword: "",      // ^
      newPassword2: "",     // ^
    }
  }


  componentDidMount = () => {
    this.loadUserData();
    // document.querySelector(".link-5").style.background = "black";  << improve this
    const tableWidth = document.querySelector("#past-games").offsetWidth;
    let tableContainer = document.querySelector("#table-container");
    tableContainer.style.width = tableWidth + "px";
    // set the height of the extended footer so it fills all available window space
    this.sizeTheExtendedFooter("initial load");
  }
  

  loadUserData = () => {
    // todo: load the username, password, and data from their past games from the db
    //       instead of using the hardcoded values below:
    const username = "Thiccboi McGee";
    const password = "123123";
    const pastGames = [ {position: 1, lpm: 12, time: "0:25.16", date: "2020/10/28"},
                        {position: 3, lpm: 9,  time: "0:36.72", date: "2020/10/28"},
                        {position: 1, lpm: 14, time: "0:23.11", date: "2020/10/28"},
                        {position: 2, lpm: 10,  time: "0:33.16", date: "2020/10/28"} ];

    this.setState({username: username, password: password, pastGames: pastGames,
                   newUsername: username});
  }

  
  sizeTheExtendedFooter = (situation) => {
    // This is janky af. Clean this up if there's time:
    const extFooter = document.querySelector('#extended-footer');
    let offset = extFooter.getBoundingClientRect();
    let topOfFooter = offset.top;
    let diff = window.innerHeight - topOfFooter;
    if (diff > 420) {  // need at least this much px height for the bottom ctrl pannel
      if (situation == "initial load") {
        extFooter.style.cssText = "min-height: calc(100vh - (148px + 398px + 5.5rem)); position: relative; height: 420px";

      } else if (situation == "after deletion") {
        extFooter.style.cssText = "min-height: calc(100vh - (255px + 70px + 5.5rem))";
      }
    }
  }


  resetScore = () => {
    // todo: not sure what exactly this is supposed to do...
    alert("todo: implement this resetScore() method");
  }


  showChangeUsername = () => {
    this.setState({changeUNVisible: true, changePWVisible: false, delAcctVisible: false});
  }


  showChangePassword = () => {
    this.setState({changeUNVisible: false, changePWVisible: true, delAcctVisible: false});
  }


  showDeleteAccount = () => {
    this.setState({changeUNVisible: false, changePWVisible: false, delAcctVisible: true});
  }


  updateUsernameHandler = (event) => {
    this.setState({username: this.state.newUsername});
    setTimeout( () => {
      alert("Username changed!");
      //this.setState({changeUNVisible: false});
    }, 500);

    // todo: connect to db and update this user's username
    setTimeout(() => {alert("todo: implement the rest of this " +
                            "updateUsernameHandler() method")}, 700);

    event.preventDefault();  // prevent page reload
  }


  updatePasswordHandler = (event) => {
    if ( ! this.newPasswordInfoChecksOut() ) {
      event.preventDefault(); // prevent page reload
      return;                 // user made mistake(s), so stop here
    }
    this.setState({  
      password: this.state.newPassword,
      currentPassword: '',
      newPassword: '', 
      newPassword2: '',
      //changePWVisible: false
    });
    alert("Password changed!");

    // todo: connect to db and update user's password
    setTimeout(() => {alert("todo: implement the rest of this " +
                            "updatePasswordHandler() method")}, 1000);

    event.preventDefault();  // prevent page reload
  }

  
  newPasswordInfoChecksOut = () => {
    if ( this.state.currentPassword !== this.state.password ) {
      alert("Oops! You entered your current password incorrectly. Try again.");
      this.setState({currentPassword: ''});
    }
    else if ( this.state.newPassword !== this.state.newPassword2 ) {
      alert("Woops: your new passwords don't match! Please re-enter them.");
      this.setState({newPassword: '', newPassword2: ''});
    }
    else if ( this.state.newPassword === '' ) {
      alert("Sorry, but you need to have a password (you can't set an empty password.)");
    }
    else  return true;

    return false;
  }


  deleteAccountHandler = () => {
    this.setState({  username: '', 
                     password: '', 
                     pastGames: [],
                     delAcctVisible: false,
                     newUsername: ''
                  });
    this.sizeTheExtendedFooter("after deletion"); // resize the footer

    // todo: remove the user from the db and logout the user
    setTimeout( () => alert("todo: implement the rest of this deleteAccount() method"), 500);
  }
  

  getAverageSpeed = () => {
    // returns a float with one decimal digit
    let total = 0.0;
    for (let game of this.state.pastGames)
      total += game.lpm;
    if (total == 0) return "";
    const avg = Math.round(total * 10.0 / this.state.pastGames.length) / 10;
    return avg;
  }


  closePannel = () => {
      this.setState({changeUNVisible: false, changePWVisible: false, delAcctVisible: false});
  }
  
  
  myChangeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;
    this.setState({[name]: val});
  }


  getFormattedPos = (pos) => {
    switch (pos) {
      case (1): return "1st"; break;
      case (2): return "2nd"; break;
      case (3): return "3rd"; break;
      default:  return pos + "th";
    }
  }


  getPastGamesTable = () => {
    let pastGamesTable = [];
    // table headings
    pastGamesTable.push( 
      <tr key="headings">
        <td className="position">Result</td>
        <td className="speed">Speed</td>
        <td className="time">Time</td>
        <td className="date">Date</td>
      </tr>
    );
    // rest of the table, from user's data
    for (let i = 0; i < this.state.pastGames.length; i++) {
      pastGamesTable.push( 
        <tr key={"game"+(i+1)}>
          <td className="position">
            {this.getFormattedPos(this.state.pastGames[i].position)}
          </td>

          <td className="speed">
            <pre>
              {this.state.pastGames[i].lpm > 9 ? 
                  this.state.pastGames[i].lpm 
                : " " + this.state.pastGames[i].lpm}
            </pre> <span className="lpm">LPM</span>
          </td>

          <td className="time">{this.state.pastGames[i].time}</td>
          <td className="date">{this.state.pastGames[i].date}</td>
        </tr>
      ); // pastGamesTable.push
    }
    return pastGamesTable;
  }


  render = () => {
    return (
      <div id='profile'>
        <div id="tophalf-profile">
          <button  onClick={() => window.location.href = document.referrer} 
                  className="back-btn">Back</button>

          <div id="profile-heading"><h1>{this.state.username}</h1></div>

          <div id="table-container">
            <div id="table-forehead">Your Race Results</div>
            <table id="past-games"><tbody>{this.getPastGamesTable()}</tbody></table>
            <div id="table-chin">
              <div id="avg-speed">
                Average LPM: <div id="avg-speed-nbr">{this.getAverageSpeed()}</div>
              </div>
              <button onClick={() => this.resetScore()}
                      className="text-btn">Reset Score?</button>
            </div>
          </div>
        </div>

        <div id="extended-footer">
          <div id="user-menu">
            <button onClick={()=>this.showChangeUsername()}>Change UserName</button> 
            <button onClick={()=>this.showChangePassword()}>Change Password</button>
            <button onClick={()=>this.showDeleteAccount()} 
                    className="del-acct-btn">Delete Account</button>
          </div>

          { this.state.changeUNVisible ? 

            <div id="change-username-box">
              <form onSubmit={this.updateUsernameHandler}>
                <label>Username &nbsp;</label>
                <input 
                  type="text" 
                  name="newUsername" 
                  value={this.state.newUsername}
                  onChange={this.myChangeHandler}
                />
                <input type='submit' value='Change'/>
              </form>
            </div>
            :
              <p></p>
          }

          { this.state.changePWVisible ? 

            <div id="change-password-box">
              <form onSubmit={this.updatePasswordHandler}>
                <div className="flex-container">
                  <label>Current password &nbsp;</label>
                  <input 
                    type="password" 
                    name="currentPassword" 
                    value={this.state.currentPassword}
                    onChange={this.myChangeHandler}
                  />
                </div>

                <div className="flex-container">
                  <label>New password &nbsp;</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    value={this.state.newPassword}
                    onChange={this.myChangeHandler}
                  />
                </div>

                <div className="flex-container">
                  <label>Confirm &nbsp;</label>
                  <input 
                    type="password" 
                    name="newPassword2" 
                    value={this.state.newPassword2}
                    onChange={this.myChangeHandler}
                  />
                </div>
    
                <input type='submit' value='Change'/>

              </form>
            </div>
          :
            <p></p>
          }

          { this.state.delAcctVisible ? 

            <div id="delete-account-box">
              Are you SURE you want to delete your account?<br/>
              It will be gone forever.<br/>
              <button onClick={() => this.deleteAccountHandler()}
                      className="delete-acct-button">
                YES, PERMANENTLY DELETE MY ACCOUNT
              </button>
              <br/>
              <button onClick={() => this.closePannel()} className="changed-my-mind">
                No! Get me out of here!
              </button>
            </div>
          :
            <p></p>
          }

          { this.state.changeUNVisible || this.state.changePWVisible ?

            <div id="close-pannel-container">
              <button onClick={()=>this.closePannel()} className="text-btn">close pannel</button>
            </div>
          :
            <p></p>
          }

        </div>

      </div>
    );
  }
}