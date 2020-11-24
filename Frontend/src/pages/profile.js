import React from 'react';
import './_styling/profile.css';

export default class Profile extends React.Component {
    constructor() {
        super();
    }

    render = () => {
        console.log("Rendering profile page");
        return (
            <div id='profile'>
                <h1>Profile</h1>
                <p>Can you read this?</p>
            </div>
        );
    }
}