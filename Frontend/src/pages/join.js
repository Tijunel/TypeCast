// page where you view all the existing lobbies and can click to join one

import React from 'react';
import './_styling/join.css';

export default class Join extends React.Component {
    constructor() {
        super();
    }

    render = () => {
        return (
            <div id='join'>
                Hey there. Join a lobby:<br/>
                A<br/>
                B<br/>
                C<br/>
                D
            </div>
        );
    }
}