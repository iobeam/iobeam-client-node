"use strict";

const RequestResults = require("../constants/RequestResults");
const ApiException = require("../exceptions/ApiException");
const Exception = require("../exceptions/Exception");

function isFunction(f) {
    return f !== null && typeof(f) === "function";
}

function isString(s) {
    return s !== null && typeof(s) === "string";
}

module.exports = {

    getDefaultApiResp: function(webStatus, webResp) {
        return {
            success: (webStatus === RequestResults.SUCCESS),
            timeout: (webStatus === RequestResults.TIMEOUT),
            allowed: (webStatus !== RequestResults.FORBIDDEN),
            code: webResp ? webResp.status : 0,
            error: null
        };
    },

    createInnerCb: function(callback, context, handleBody) {
        const utils = this;
        if (!utils.isCallback(callback)) {
            return function() {};
        }

        return function(status, webResp) {
            if (status == RequestResults.PENDING) {
                return;
            }

            const resp = utils.getDefaultApiResp(status, webResp);
            if (!resp.timeout) {
                const body = webResp.body;
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

    assertValidToken: function(token) {
        if (!isString(token)) {
            throw new ApiException("Need a valid token.");
        } else if (token.length <= 0) {
            throw new ApiException("token is too short: " + token.length);
        }
    },

    assertValidProjectId: function(projectId) {
        if (projectId === null || typeof(projectId) === "undefined") {
            throw new ApiException("Invalid projectId: " + projectId);
        } else if (isNaN(parseInt(projectId)) || parseInt(projectId) <= 0) {
            throw new ApiException("Invalid projectId: " + projectId);
        }
    },

    assertValidDeviceId: function(deviceId) {
        if (!isString(deviceId)) {
            throw new ApiException("Invalid deviceId: " + JSON.stringify(deviceId));
        } else if (deviceId.length <= 0) {
            throw new ApiException("deviceId too short: " + deviceId.length);
        }
    },

    assertValidDataPoint: function(datapoint) {
        if (datapoint === null || typeof(datapoint) === "undefined") {
            throw new ApiException("Invalid datapoint: " + JSON.stringify(datapoint));
        } else if (!datapoint.hasOwnProperty("timestamp") || !datapoint.hasOwnProperty("value")) {
            throw new ApiException("Invalid datapoint: " + JSON.stringify(datapoint));
        }
    },

    // TODO - change Exception type
    assertValidRequester: function(requester) {
        if (requester === null || typeof(requester) === "undefined") {
            throw new Exception("Invalid requester");
        }
        // Check that it has necessary functions:
        const hasExecute = isFunction(requester.execute);
        const hasGetFullEndpoint = isFunction(requester.getFullEndpoint);
        const hasGetRequest = isFunction(requester.getRequest);
        const hasPostRequest = isFunction(requester.postRequest);

        if (!hasExecute || !hasGetFullEndpoint || !hasGetRequest || !hasPostRequest) {
            throw new Exception("Invalid requester");
        }
    }
};
