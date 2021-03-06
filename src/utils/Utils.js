"use strict";
const jwt = require("jsonwebtoken");

const RequestResults = require("../constants/RequestResults");
const ApiException = require("../exceptions/ApiException");

function isFunction(f) {
    return f !== null && typeof(f) === "function";
}

function isString(s) {
    return s !== null && typeof(s) === "string";
}

module.exports = {

    getDefaultApiResp: function(webStatus, webResp) {
        const ret = {
            success: (webStatus === RequestResults.SUCCESS),
            timeout: (webStatus === RequestResults.TIMEOUT),
            allowed: (webStatus !== RequestResults.FORBIDDEN),
            code: webResp ? webResp.status : 0,
            error: null
        };
        if (ret.timeout) {
            ret.error = {"message": "Connection time out"};
        }

        return ret;
    },

    createInnerCb: function(callback, context, handleBody) {
        const utils = this;
        if (!utils.isCallback(callback)) {
            return function() {};
        }

        return function(status, webResp) {
            if (status === RequestResults.PENDING) {
                return;
            }

            const resp = utils.getDefaultApiResp(status, webResp);
            if (!resp.timeout) {
                const body = (webResp.type === "application/json") ? webResp.body : webResp.text;
                handleBody(resp, body, status);
            }
            callback(resp, context);
        };
    },

    statusCodeToResult: function(status) {
        if (status === 401 || status === 403) {
            return RequestResults.FORBIDDEN;
        } else if (status === 200 || status === 201 || status === 204) {
            return RequestResults.SUCCESS;
        } else {
            return RequestResults.FAILURE;
        }
    },

    isCallback: function(callback) {
        return isFunction(callback);
    },

    isSet: function(item) {
        return item !== null && typeof(item) !== "undefined";
    },

    isInArray: function(needle, array) {
        for (let i in array) {
            if (array[i] === needle) {
                return true;
            }
        }
        return false;
    },

    isExpiredToken: function(token) {
        const tb64url = token.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
        const decoded = jwt.decode(tb64url);
        return new Date().getTime() >= (decoded.exp * 1000);
    },

    assertValidToken: function(token) {
        if (!isString(token)) {
            throw new ApiException("Need a valid token.");
        } else if (token.length <= 0) {
            throw new ApiException("token is too short: " + token.length);
        }
    },

    assertValidProjectId: function(projectId) {
        if (projectId === null || typeof(projectId) === "undefined") {
            throw new ApiException("Invalid projectId (must be int > 0): " + projectId);
        } else if (isNaN(parseInt(projectId)) || parseInt(projectId) <= 0) {
            throw new ApiException("Invalid projectId (must be int > 0): " + projectId);
        }
    },

    assertValidDeviceId: function(deviceId) {
        if (!isString(deviceId)) {
            throw new ApiException("Invalid deviceId (must be a string): " +
                JSON.stringify(deviceId));
        } else if (deviceId.length <= 0) {
            throw new ApiException("deviceId too short: " + deviceId.length);
        } else if (deviceId.match("[a-zA-Z0-9:_-]+")[0] !== deviceId) {
            throw new ApiException("Device id can only include a-z, A-Z, 0-9, _, :, and -");
        }
    },

    // TODO - change Exception type
    assertValidRequester: function(requester) {
        if (requester === null || typeof(requester) === "undefined") {
            throw new ApiException("Invalid requester");
        }
        // Check that it has necessary functions:
        const hasExecute = isFunction(requester.execute);
        const hasGetFullEndpoint = isFunction(requester.getFullEndpoint);
        const hasGetRequest = isFunction(requester.getRequest);
        const hasPostRequest = isFunction(requester.postRequest);

        if (!hasExecute || !hasGetFullEndpoint || !hasGetRequest || !hasPostRequest) {
            throw new ApiException("Invalid requester");
        }
    }
};
