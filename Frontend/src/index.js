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
import Error from './pages/error';

import TopNav from './components/navigation/topNav';

class App extends React.Component {
  constructor() {
    super();
  }

  componentDidMount = () => {
    // Check for token
  }

  render = () => {
    return (
      <React.Fragment>
        <TopNav/>
        <Router>
          <Switch>
            <Route path="/" component={() => <Home/>}/>
            <Route path="/home" component={() => <Home/>}/>
            <Route path="/login" component={() => <Login/>}/>
            <Route path="/register" component={() => <Register/>}/>
            <Route path="/join" component={() => <Join/>}/>
            <Route path="/lobby/:id" component={() => <Lobby/>}/>
            <Route path="/profile/:id" component={() => <Profile/>}/>
            <Route path="/game/:id" component={() => <Game/>}/>
            <Route path="*" component={() => <Error/>}/>
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById("root"));