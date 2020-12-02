'use strict';

const got = require('got');

class MSCall {
    constructor() {
        this.api = got.extend({
            responseType: 'json'
        });
    }

    setURLPrefix = (prefix) => {
        this.api = this.api.extend({
            prefixUrl: prefix
        });
    }

    call = async(path, method, options) => {
        const searchParameters = options.searchParameters || {};
        const headers = options.headers || {};
        const json = options.json || (method === "GET" ? undefined : {});
        let response;
        try {
            response = await this.api(path, {
                headers, 
                searchParameters,
                method,
                json
            })l
        } catch (error) {
            return { status: 500 }
        }
        response = {status: response.statusCode, body: response.body };
        return response;
    }
}

module.exports = MSCall;