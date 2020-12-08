// page for registering as a new user

// todo: submitHandler() method needs to be finished once our server is set up.

import React from 'react';
import './_styling/register.css';

export default class Register extends React.Component {
	constructor() {
		super();
		this.username = React.createRef();
		this.password1 = React.createRef();
		this.password2 = React.createRef();
	}

	registrationHandler = (event) => {
		event.preventDefault();  
		if (this.password1.current.value === this.password2.current.value) {
			fetch('/user/register', {
				method: 'POST',
				credentials: "include",
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: this.username.current.value, password: this.password1.current.value })
			})
				.then(res => {
					if (res.status === 200) window.location.href = '/home';
					else alert("Something went wrong, try again.");
				})
				.catch(err => { alert("Something went wrong, try again."); });
		} else alert('Your passwords do not match.\n');
	}

	render = () => {
		return (
			<div id='register'>
				<button onClick={() => window.location.href = document.referrer}
					className="back-btn">Back</button>
				<h1>Register</h1>
				<form onSubmit={this.registrationHandler}>
					<label>Username</label>
					<input
						type='text'
						name='fName'
						minLength='2'
						ref={this.username}
					/>
					<label>Password</label>
					<input
						type='password'
						name='password1'
						ref={this.password1}
					/>
					<label>Confirm Password</label>
					<input
						type='password'
						name='password2'
						ref={this.password2}
					/>
					<input type='submit' value='Register' />
				</form>
			</div>
		);
	}
}