import React from 'react';
import { Nav, Navbar, Button } from 'react-bootstrap';
import './_styling/topNav.css';

export default class TopNav extends React.Component {
    constructor() {
        super();
    }

    handleClick = () => {
        // If not signed in
            // Go to sign in page if clicked:
                // Type
                // Game
                // Sign In
                // Profile
        // Else do what it say
    }

    handleAuth = () => {
        // Handle sign in or sign out button
    }

    render = () => {
        return (
            <header>
                <Navbar id='top' collapseOnSelect expand='sm'fixed='top' variant='dark'>
                    <Navbar.Brand className='link-0' href='/'><b>TypeCast</b></Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className='mr-auto'>
                            <Nav.Link className="link-1" href="/">Home</Nav.Link> 
                            <Nav.Link className="link-2" onClick={this.handleClick}>Type</Nav.Link> 
                            <Nav.Link className="link-3" onClick={this.handleClick}>Game</Nav.Link>
                        </Nav>
                        <Nav className='log'>
                            {/* Make this dynamic (Sign In vs. Sign Out) */}
                            <Nav.Link className="link-4" onClick={this.handleAuth}>Sign In/Out</Nav.Link>
                            <Nav.Link className="link-5" onClick={this.handleClick}>Profile</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </header>
        );
    }
}