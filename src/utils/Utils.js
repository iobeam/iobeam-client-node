const RequestResults = require("../constants/RequestResults");
const ApiException = require("../exceptions/ApiException");
const Exception = require("../exceptions/Exception");

function isFunction(f) {
    return f !== null && typeof(f) === "function";
}

module.exports = {

    getDefaultApiResp: function(webStatus, webResp) {
        return {
            success: (webStatus === RequestResults.SUCCESS),
            timeout: (webStatus === RequestResults.TIMEOUT),
            allowed: (webStatus !== RequestResults.FORBIDDEN),
            code: webResp.status,
            error: null
        };
    },

    isCallback: function(callback) {
        return isFunction(callback);
    },

    assertValidToken: function(token) {
        if (token === null || typeof(token) === "undefined") {
            throw new ApiException("Need a valid token.");
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
        if (deviceId === null || typeof(deviceId) !== "string") {
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
