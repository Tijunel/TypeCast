import React from 'react';
import { Button } from 'react-bootstrap';
import './_styling/footer.css';

export default class Footer extends React.Component {
    constructor() {
        super();
    }

    handleAttributions = () => {
        // Use react-router to take the user to /attributions
    }

    handleLicenses = () => {
        // Use react-router to take the user to /licenses
    }

    render = () => {
        return (
            <footer id='footer'>
                <div id='footer-content'>
                    <b>Copyright &copy; TypeCast 2020 </b>
                    <b onClick={this.handleAttributions} id='attributions-button'>Attributions</b>
                    <b onClick={this.handleLicenses} id='licenses-button'>Licenses</b>
                </div>
            </footer>
        );
    }
}