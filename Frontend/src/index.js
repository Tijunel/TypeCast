'use strict';

// Module imports
import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Page imports
import Home from './pages/home';

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
        <Router>
          <Switch>
            <Route exact path="/" component={() => <Home/>}/>
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById("root"));