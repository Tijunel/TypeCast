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
            fetch('/checkToken', {
                method: 'GET',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' }
            })
                .then(res => {
                    if (res.status === 200) this.setState({ loading: false });
                    else this.setState({ loading: false, redirect: true});
                })
                .catch(err => { this.setState({ loading: false, redirect: true}); });
        }

        componentDidMount = () => {
            this.checkToken();
            this.timerID = setInterval(() => this.checkToken(), 30000);
        }

        render = () => {
            const { loading, redirect } = this.state
            if (loading) return null;
            if (redirect) return <Redirect to='/signin' />
            return (
                <React.Fragment>
                    <ComponentToProtect/>
                </React.Fragment>
            );
        }
    }
}