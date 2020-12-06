// page for registering as a new user

// todo: submitHandler() method needs to be finished once our server is set up.

import React from 'react';
import './_styling/register.css';

export default class Register extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      email: "",
      password: "",
      password2: ""
    }
  }

  registrationHandler = (event) => {
    // todo: update this with our server details when ready:
    if  (this.passwordsMatch() ) {
      // boilerplate template --------------------------------------
      // fetch('http://localhost:8000/register', {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify(this.state) 
      // }).then(response => {
      //     response.text().then(msg => {
      //       this.setState({serverResponse: JSON.stringify(msg)});
      //       console.log(msg);
      //     });
      //   });
      // -----------------------------------------------------------
      alert("todo: implement this registrationHandler() method");
    } else {
      this.handlePasswordMismatch();
    }
    event.preventDefault();  // prevent page reload
  }

  myChangeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;
    this.setState({[name]: val});
  }

  passwordsMatch = () => {
    if (this.state.password === this.state.password2)
      return true;
    return false;
  }

  handlePasswordMismatch = () => {
    alert('Your passwords do not match.\n' +
          'Fix them and then click "Register" button again');
  }

  render = () => {
    return (
      <div id='register'>

        <button  onClick={() => window.location.href = document.referrer} 
                 className="back-btn">Back</button>

        <h1>Register</h1>
        
        <form onSubmit={this.registrationHandler}>
          <label>Username</label>
          <input
            type='text'
            name='fName'
            minLength='2'
            value={this.state.fName}
            onChange={this.myChangeHandler}
          />

          <label>Email</label>
          <input
            type='email'
            name='email'
            value={this.state.email}
            onChange={this.myChangeHandler}
          />

          <label>Password</label>
          <input
            type='password'
            name='password'
            value={this.state.password}
            onChange={this.myChangeHandler}
          />

          <label>Confirm Password</label>
          <input
            type='password'
            name='password2'
            value={this.state.password2}
            onChange={this.myChangeHandler}
          />
          
          <input type='submit' value='Register'/>
        </form>
      </div>
    );
  }
}