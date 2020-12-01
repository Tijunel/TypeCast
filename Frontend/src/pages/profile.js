// page for viewing user's profile

import React from 'react';
import './_styling/profile.css';

export default class Profile extends React.Component {
    constructor() {
        super();
    }

    render = () => {
        return (
            <div id='profile'>
                <div class="row">
                    <div class="leftcolumn">
                        <h1>PROFILE</h1>
                        <div>
                            <button class="button">Change Username</button>
                        </div>
                        <div>
                            <button class="button">Change Password</button>
                        </div>
                        <div>
                            <button class="button">Reset Score</button>
                        </div>
                        <br></br>
                        <br></br>
                        <div>
                            <button class="button">Delete Account</button>
                        </div>
                    </div>
                    <div class="rightcolumn">
                        <br></br>
                        <h3>Average WPM: 110</h3>
                        
                        <table>
                            <tr>
                                <th>
                                    Game History
                                </th>
                            </tr>
                            <tr>
                                <td>
                                    1st
                                </td>
                                <td>
                                    110 wpm
                                </td>
                                <td>
                                    0:29.15
                                </td>
                                <td>
                                    2020/11/26
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    1st
                                </td>
                                <td>
                                    110 wpm
                                </td>
                                <td>
                                    0:29.15
                                </td>
                                <td>
                                    2020/11/26
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    1st
                                </td>
                                <td>
                                    110 wpm
                                </td>
                                <td>
                                    0:29.15
                                </td>
                                <td>
                                    2020/11/26
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    1st
                                </td>
                                <td>
                                    110 wpm
                                </td>
                                <td>
                                    0:29.15
                                </td>
                                <td>
                                    2020/11/26
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}