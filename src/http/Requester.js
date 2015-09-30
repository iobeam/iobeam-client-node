"use strict";
const request = require("superagent");

const RequestResults = require("../constants/RequestResults");

const TIMEOUT = 10000;
const CONTENT_TYPE = "application/json";
const _URL_BASE = "https://api.iobeam.com/v1";

module.exports = {
    execute: function(req, callback, context) {
        callback(RequestResults.PENDING, null);
        const key = req.req.path;

        req.end(function(err, res) {
            if ((err && err.timeout === TIMEOUT) || (typeof(res) === "undefined")) {
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

    getFullEndpoint: function(endpoint) {
        return _URL_BASE + endpoint;
    },

    getRequest: function(url, token) {
        const ret = request
            .get(url)
            .timeout(TIMEOUT);
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
            .timeout(TIMEOUT);

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
