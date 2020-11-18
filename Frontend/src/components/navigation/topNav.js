import React from 'react';
import { Nav, Navbar, Button } from 'react-bootstrap';
import './_styling/topNav.css';

export default class TopNav extends React.Component {
    constructor() {
        super();
    }

    handleProfile = () => {
        // Go to profile if signed in
        // Else go to 
    }

    render = () => {
        return (
            <header>
                <Navbar id='top' collapseOnSelect expand='sm'fixed='top'>
                    <Navbar.Brand className='link-0' href='/'><b>TypeCast</b></Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className='mr-auto'>
                            <Nav.Link className="link-1" href="/">Home</Nav.Link> 
                            <Nav.Link className="link-2" href="/type">Type</Nav.Link> 
                            <Nav.Link className="link-3" href="/join">Game</Nav.Link>
                        </Nav>
                        <Nav className='log'>
                            {/* Make this dynamic (Sign In vs. Sign Out) */}
                            <Nav.Link className="link-4" href="/signin">Sign In/Out</Nav.Link>
                            <Nav.Link className="link-5" href="/profile">Profile</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </header>
        );
    }
}