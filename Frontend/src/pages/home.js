import React from 'react';
import './_styling/home.css';

export default class Home extends React.Component {
    constructor() {
        super();
    }

    render = () => {
        return (
            <div id='home'>
                <h1>Welcome to TypeCast!</h1>
                <p>TypeCast was created to put programmer's typing speed to the test. This site enables you
                   to create a profile with which you can track your stats, race your friends or randoms, or just practice!
                   Typical type racing websites track your speed using wpm (words per minute). Obviously, this just
                   won't do for programming, so we use lpm (lines per minute) where each "line" is counted as 80 characters.
                   We hope you enjoy this unique type racing experience!
                    <br/><br/>
                   -The TypeCasters
                </p>
            </div>
        );
    }
}