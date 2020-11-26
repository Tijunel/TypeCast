import React from 'react';

export default class Profile extends React.Component {
    constructor() {
        super();
    }

    render = () => {
        return (
            <div class='column'>
                <h1>PROFILE</h1>
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