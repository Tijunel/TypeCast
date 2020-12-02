'use strict';

const got = require('got');

class MSCall {
    constructor() {
        this.api = got.extend({ responseType: 'json' });
    }

    setURLPrefix = (prefix) => {
        this.api = this.api.extend({ prefixUrl: prefix });
    }

    call = async (path, method, options) => {
        const searchParameters = options.searchParameters || {};
        const headers = options.headers || {};
        const json = options.json || (method === 'GET' ? undefined : {});
        let response;
        try {
            response = await this.api(path, {   // path contains req.params
                headers,                        // Translates to req.headers
                searchParameters,               // Translates to req.query or what is after ? in URL
                method,                         // Translates to GET, POST, PUT, or DELETE
                json                            // Translates to req.body
            });
        } catch (error) {
            return { status: 500 }
        }
        response = { status: response.statusCode, body: response.body };
        return response;
    }
}

module.exports = MSCall;