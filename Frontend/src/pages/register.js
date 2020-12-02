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

  submitHandler = (event) => {
    // todo: update this with our server details when ready:
    if  (this.verifyPassword() ) {
      // boilerplate template --------------------------------------
      // fetch('http://localhost:5000/register', {
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
      alert("You are now registered! Redirecting you to xyz page...\n" +
            "(todo: update this method to ACTUALLY register the user)");
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

  verifyPassword = () => {
    if (this.state.password === this.state.password2)
      return true;
    return false;
  }

  handlePasswordMismatch = () => {
    alert('Your passwords do not match.\n' +
          'Fix them and then click \"Register\" button again');
  }

  render = () => {
    return (
      <div id='register'>

        <h1>Register</h1>
        
        <form onSubmit={this.submitHandler}>
          <p>Username</p>
          <input
            type='text'
            name='fName'
            value={this.state.fName}
            onChange={this.myChangeHandler}
          />

          <p>Email</p>
          <input
            type='email'
            name='email'
            value={this.state.email}
            onChange={this.myChangeHandler}
          />

          <p>Password</p>
          <input
            type='password'
            name='password'
            value={this.state.password}
            onChange={this.myChangeHandler}
          />

          <p>Confirm Password</p>
          <input
            type='password'
            name='password2'
            value={this.state.password2}
            onChange={this.myChangeHandler}
          />
          
          <input type='submit' value='Register' className='register-btn'/>
        </form>
      </div>
    );
  }
}