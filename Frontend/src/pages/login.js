// page where existing members log in to the game

import React from 'react';
import './_styling/login.css';
import Form from 'react-bootstrap';

export default class Login extends React.Component {
    constructor() {
        super();
    }

    render = () => {
        return (
            <div id='login'>
                <h1>LOG IN</h1>
                <form>
                  <label>
                    <div id='label'>Username</div>
                    <input type="text" name="name" />
                  </label>
                </form>
                <form>
                  <label>
                    <div id='label'>Password</div>
                    <input type="text" name="name" />
                  </label>
                </form>
                <form>
                  <button class="button">Log in</button>
                </form>
                <form>
                  <button class="button reg">Register</button>
                </form>
            </div>
        );
    }
}