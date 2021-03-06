import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import './_styling/topNav.css';

export default class TopNav extends React.Component {
    constructor() {
        super();
        this.state = {
            signedIn: false
        }
    }

    componentDidMount = () => {
        this.setState({ signedIn: false });
        fetch('/user/validate', {
            method: 'GET',
            credentials: "include",
            headers: { 'Content-Type': 'application/json' }
          })
            .then(res => {
              if (res.status === 200) this.setState({ signedIn: true });
              else this.setState({ signedIn: false });
            })
            .catch(err => { this.setState({ signedIn: false }); });
    }

    handleAuth = () => {
        if(this.state.signedIn) {
            fetch('/user/invalidate', {
                method: 'GET',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' }
              })
                .then(res => {
                  if (res.status === 200) this.setState({ signedIn: false });
                })
                .catch(err => {  });
        }
    }

    hostGame = () => {
		// generate a random 4 digit room code / lobby code
		let roomCode = "";
		let menu = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var menuLength = 26;
		for (let i = 0; i < 4; i++)
			roomCode += menu.charAt(Math.floor(Math.random() * menuLength));
		// load lobby page. Not sure how else to do it. This is not very React-y
		window.location.href = "/lobby/:" + roomCode;
	}

    render = () => {
        return (
            <header>
                <Navbar id='top' collapseOnSelect expand='sm'fixed='top' variant='dark'>
                    <Navbar.Brand className='link-0' href='/'><b>TypeCast</b></Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className='mr-auto'>
                            <Nav.Link className="link-1" href="/home">Home</Nav.Link> 
                            <Nav.Link className="link-2" href="/join" onClick={this.handleClick}>Join</Nav.Link> 
                            <Nav.Link className="link-3" onClick={this.hostGame}>Host</Nav.Link>
                        </Nav>
                        <Nav className='log'>
                            <Nav.Link className="link-4" href="/login" onClick={this.handleAuth}>
                                {this.state.signedIn ? "Log Out" : "Log In"}
                            </Nav.Link>
                            <Nav.Link className="link-5" href="/profile" onClick={this.handleClick}>Profile</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </header>
        );
    }
}