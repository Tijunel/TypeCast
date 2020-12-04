// page where existing members log in to the game

import React from 'react';
import './_styling/login.css';

export default class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: ""
    }
  }

  forgotPassword = () => {
    // todo
    alert("todo: implement this forgotPassword() method");

  }

  loginHandler = (event) => {
    // todo: connect to the users db and do the login stuff
    alert("todo: implement this loginHandler() method")

    event.preventDefault();  // prevent page reload on form submission, if you want
  }

  myChangeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;
    this.setState({[name]: val});
  }

  render = () => {
    return (
      <div id='login'>

        <h1>Log In</h1>

        <form onSubmit={this.loginHandler}>
          <label>Username</label>
          <input 
            type="text" 
            name="username" 
            value={this.state.username}
            onChange={this.myChangeHandler}
          />

          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            value={this.state.password}
            onChange={this.myChangeHandler}
          />

          <input type='submit' value='Log in'/>
        </form>

        <div id="regbox">
         <button onClick={()=>window.location.href="/register"}>Register</button>
        </div>

        <div id="forgotpw">
          <a href=''onClick={()=>this.forgotPassword()}>Forgot your password?</a>
        </div>

      </div>
    );
  }
}