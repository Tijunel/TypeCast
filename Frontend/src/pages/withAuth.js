'use strict';

import React from 'react';
import { Redirect } from 'react-router-dom';

export default function WithAuth(ComponentToProtect) {
    return class extends React.Component {
        constructor() {
            super();
            this.state = {
                loading: true,
                redirect: false
            }
        }

        checkToken = () => {
            fetch('/user/validate', {
                method: 'GET',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' }
            })
                .then(res => {
                    if (res.status === 200) this.setState({ loading: false });
                    else this.setState({ loading: false, redirect: true });
                })
                .catch(err => { this.setState({ loading: false, redirect: true }); });
        }

        componentDidMount = () => {
            this.checkToken();
            this.timerID = setInterval(() => this.checkToken(), 30000);
            this.forceUpdate();
        }

        render = () => {
            if (this.state.loading) return null;
            if (this.state.redirect) return <Redirect to='/login' />
            return (
                <React.Fragment>
                    <ComponentToProtect />
                </React.Fragment>
            );
        }
    }
}