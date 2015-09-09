"use strict";
const request = require("superagent");

const RequestResults = require("../constants/RequestResults");

const TIMEOUT = 10000;
const CONTENT_TYPE = "application/json";
const _URL_BASE = "https://api-dev.iobeam.com/v1";

module.exports = {
    execute: function(req, callback, context) {
        callback(RequestResults.PENDING, null);
        const key = req.req.path;

        req.end(function(err, res) {
            if ((err && err.timeout === TIMEOUT) || (typeof(res) === "undefined")) {
                console.log("API Response: " + key + ": TIMEOUT");
                callback(RequestResults.TIMEOUT, res, context);
            } else if (res.status === 401 || res.status === 403) {
                console.log("API Response: " + key + ": FORBIDDEN [" + res.status +"]");
                callback(RequestResults.FORBIDDEN, res, context);
            } else if (res.status === 200 || res.status === 201 || res.status === 204) {
                console.log("API Response: " + key + ": SUCCESS [" + res.status +"]");
                callback(RequestResults.SUCCESS, res, context);
            } else {
                console.log("API Response: " + key + ": FAILURE");
                callback(RequestResults.FAILURE, res, context);
            }

        });
    },

    getFullEndpoint: function(endpoint) {
        return _URL_BASE + endpoint;
    },

    getRequestUnauthed: function(url) {
        return request
            .get(url)
            .timeout(TIMEOUT);
    },

    postRequestUnauthed: function(url, body) {
        return request
            .post(url)
            .set("Accept", CONTENT_TYPE)
            .set("Content-Type", CONTENT_TYPE)
            .send(body)
            .timeout(TIMEOUT);
    },

    getRequest: function(url, token) {
        const tokenStr = "Bearer " + token;
        return this.getRequestUnauthed(url)
            .set("Authorization", tokenStr);
    },

    postRequest: function(url, token, body) {
        const tokenStr = "Bearer " + token;
        return this.postRequestUnauthed(url, body)
            .set("Authorization", tokenStr);
    }
};
