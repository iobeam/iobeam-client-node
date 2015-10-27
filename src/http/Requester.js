"use strict";
const request = require("superagent");

const RequestResults = require("../constants/RequestResults");
const Utils = require("../utils/Utils");

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

    /**
     * Execute a superagent HTTP request.
     * @param {object} req - superagent request
     * @param {function} callback - Function to call after the request with status
     * @param {object} context - Related information about this call to pass to callback
     */
    execute: function(req, callback, context) {
        callback(RequestResults.PENDING, null, null);
        //const key = req.req.path;

        req.end(function(err, res) {
            let result = null;
            if ((err && err.timeout === _timeout) || typeof(res) === "undefined") {
                result = RequestResults.TIMEOUT;
            } else {
                result = Utils.statusCodeToResult(res.status);
            }
            //console.log("API Response: " + key + ": " + result + " [" +
            //            res.status +"]");
            callback(result, res, context);
        });
    },

    /**
     * Creates full URL given an endpoint suffix.
     * @param {string} endpoint - Endpoint suffice to append to base URL.
     * @returns {string} Full URL of an API endpoint
     */
    getFullEndpoint: function(endpoint) {
        return _urlBase + endpoint;
    },

    /**
     * Create a GET superagent request for a given url and (optionally) token.
     * @param {string} url - URL of the request
     * @param {string} token - Token to use as a Bearer auth token
     * @returns {object} superagent GET request aimed at url
     */
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

    /**
     * Create a POST superagent request for a given url, body, and (optionally) token.
     * @param {string} url - URL of the request
     * @param {object} body - JSON formatted body for the request
     * @param {string} token - Token to use as a Bearer auth token
     * @returns {object} superagent POST request aimed at url
     */
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
