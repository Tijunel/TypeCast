'use strict';

const got = require('got');

class MSCall {
    constructor() {
        this.api = got.extend({
            responseType: 'json'
        });
    }

    setPrefixURL = (url) => {
        this.api = this.api.extend({
            prefixUrl: url
        });
    };

    call = async (path, method = 'GET', options = {}) => {
        options = options || {};
        const searchParams = options.searchParams || {};
        const headers = options.headers || {};
        const json = options.json || (method === 'GET' ? undefined : {});
        let res;
        try {
            res = await this.api(path, {        // path contains req.params
                headers,                        // Translates to req.headers
                searchParams,                   // Translates to req.query or what is after ? in URL
                method,                         // Translates to GET, POST, PUT, or DELETE
                json                            // Translates to req.body
            });
        } catch (error) {
            console.log(error);
            return { status: 500 };
        }
        res = { status: res.statusCode, body: res.body };
        return res;
    }
}

module.exports = MSCall;