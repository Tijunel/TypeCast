'use strict';

// Module imports
import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Page imports
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Join from './pages/join';
import Lobby from './pages/lobby';
import Profile from './pages/profile';
import Game from './pages/game';

import TopNav from './components/navigation/topNav';
import Footer from './components/navigation/footer';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      signedIn: false
    }
  }

  componentDidMount = () => {
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

  render = () => {
    return (
      <React.Fragment>
        <TopNav signedIn={this.state.signedIn} />
        <Router>
          <Switch>
            <Route path="/home" component={() => <Home signedIn={this.state.signedIn}/>} />
            <Route path="/login" component={() => <Login />} />
            <Route path="/register" component={() => <Register />} />
            <Route path="/join" component={() => <Join />} />
            <Route path="/lobby" component={() => <Lobby />} />
            <Route path="/profile" component={() => <Profile />} />
            <Route path="/game" component={() => <Game />} />
            <Route path="/" component={() => <Home />} />
          </Switch>
        </Router>
        <Footer/>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById("root"));