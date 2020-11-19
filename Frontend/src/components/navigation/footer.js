import React from 'react';
import { Button } from 'react-bootstrap';
import './_styling/footer.css';

export default class Footer extends React.Component {
    constructor() {
        super();
    }

    render = () => {
        return (
            <footer id='footer'>
                <div id='footer-content'>
                    <b>Copyright &copy; TypeCast 2020. </b>
                    <b id='attributions-button'>Attributions</b>
                    <b id='licenses-button'>Licenses</b>
                </div>
            </footer>
        );
    }
}