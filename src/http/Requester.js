"use strict";
const request = require("superagent");

const RequestResults = require("../constants/RequestResults");

const CONTENT_TYPE = "application/json";

const _DEFAULT_TIMEOUT = 10000;
const _DEFAULT_URL_BASE = "https://api.iobeam.com/v1";

let _urlBase = _DEFAULT_URL_BASE;
let _timeout = _DEFAULT_TIMEOUT;

module.exports = {

    /**
     * Setup configuration parameters of this requester object.
     * @param {string} urlBase - Base portion of the URL endpoints for this API
     * (default: https://api.iobeam.com/v1").
     * @param {number} timeout - Milliseconds to wait before timing out a request
     * (default: 10000).
     */
    initialize: function(urlBase, timeout) {
        if (urlBase) {
            _urlBase = urlBase;
        }
        if (timeout) {
            _timeout = timeout;
        }
    },

    execute: function(req, callback, context) {
        callback(RequestResults.PENDING, null);
        const key = req.req.path;

        req.end(function(err, res) {
            if ((err && err.timeout === _timeout) || (typeof(res) === "undefined")) {
                //console.log("API Response: " + key + ": TIMEOUT");
                callback(RequestResults.TIMEOUT, res, context);
            } else if (res.status === 401 || res.status === 403) {
                //console.log("API Response: " + key + ": FORBIDDEN [" + res.status +"]");
                callback(RequestResults.FORBIDDEN, res, context);
            } else if (res.status === 200 || res.status === 201 || res.status === 204) {
                //console.log("API Response: " + key + ": SUCCESS [" + res.status +"]");
                callback(RequestResults.SUCCESS, res, context);
            } else {
                //console.log("API Response: " + key + ": FAILURE");
                callback(RequestResults.FAILURE, res, context);
            }

        });
    },

    /**
     * Creates full URL given an endpoint suffix.
     * @param {string} endpoint - Endpoint suffice to append to base URL.
     */
    getFullEndpoint: function(endpoint) {
        return _urlBase + endpoint;
    },

    getRequest: function(url, token) {
        const ret = request
            .get(url)
            .timeout(_timeout);
        if (token !== null && typeof(token) === "string") {
            const tokenStr = "Bearer " + token;
            ret.set("Authorization", tokenStr);
        }
        return ret;
    },

    postRequest: function(url, body, token) {
        const ret = request
            .post(url)
            .set("Accept", CONTENT_TYPE)
            .set("Content-Type", CONTENT_TYPE)
            .timeout(_timeout);

        if (token !== null && typeof(token) === "string") {
            const tokenStr = "Bearer " + token;
            ret.set("Authorization", tokenStr);
        }

        if (body !== null && typeof(body) !== "undefined") {
            ret.send(body);
        }

        return ret;
    }
};
