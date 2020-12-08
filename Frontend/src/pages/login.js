// page where existing members log in to the game

import React from 'react';
import './_styling/login.css';

export default class Login extends React.Component {
	constructor() {
		super();
		this.username = React.createRef();
		this.password = React.createRef();
	}

	forgotPassword = () => {
		alert("Too bad!");
	}

	loginHandler = (event) => {
		event.preventDefault();
		fetch('/user/login', {
			method: 'POST',
			credentials: "include",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: this.username.current.value, password: this.password1.current.value })
		})
			.then(res => {
				if (res.status === 200) window.location.href = '/home';
				else alert("Username or password is wrong. Try again.");
			})
			.catch(err => { alert("Username or password is wrong. Try again."); });
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
						ref={this.username}
					/>
					<label>Password</label>
					<input
						type="password"
						name="password"
						ref={this.password}
					/>
					<input type='submit' value='Log in' />
				</form>
				<div id="regbox">
					<button onClick={() => window.location.href = "/register"}>Register</button>
				</div>
				<div id="forgotpw">
					<button onClick={() => this.forgotPassword()}
						className="text-btn">Forgot your password?</button>
				</div>
			</div>
		);
	}
}