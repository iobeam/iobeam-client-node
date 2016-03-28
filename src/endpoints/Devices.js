"use strict";
const RequestResults = require("../constants/RequestResults");
const Device = require("../resources/Device");
const Utils = require("../utils/Utils");

let _token = null;
let _requester = null;

module.exports = {

    /**
     * Initialize the service with a token and HTTP requester.
     * @param {string} token - Token to use when communicating with backend
     * @param {object} requester - A requester object that handles communicating
     * with the backend
     */
    initialize: function(token, requester) {
        Utils.assertValidToken(token);
        Utils.assertValidRequester(requester);
        _token = token;
        _requester = requester;
    },

    getTimestamp: function(callback) {
        Utils.assertValidToken(_token);
        const URL = _requester.getFullEndpoint("/devices/timestamp");

        const req = _requester.getRequest(URL, _token);
        const innerCb = function(status, webResp) {
            if (status === RequestResults.PENDING) {
                return;
            } else if (!Utils.isCallback(callback)) {
                return;
            }

            const resp = Utils.getDefaultApiResp(status, webResp);
            if (!resp.timeout) {
                const body = webResp.body;
                if (status === RequestResults.SUCCESS) {
                    resp.timestamp = body.server_timestamp;
                } else if (status === RequestResults.FAILURE) {
                    if (body && body.errors) {
                        resp.error = body.errors[0];
                    }
                }
            }
            callback(resp);
        };
        _requester.execute(req, innerCb);
    },

    /**
     * Register the device with the iobeam.
     * @param {integer} projectId - Project ID for the device
     * @param {function} callback - Callback for the API response
     * @param {string} deviceId - Optional, desired device ID (otherwise
     * randomly generated)
     * @param {string} deviceName - Optional, desired device name (otherwise
     * randomly generated)
     * @param {string} deviceType - Optional, desired device type
     */
    register: function(projectId, callback, deviceId, deviceName, deviceType) {
        Utils.assertValidToken(_token);
        const URL = _requester.getFullEndpoint("/devices");
        const did = deviceId || null;
        const dname = deviceName || null;
        const dtype = deviceType || null;

        const reqBody = {project_id: projectId};
        if (did !== null) {
            reqBody.device_id = did;
        }
        if (dname !== null) {
            reqBody.device_name = dname;
        }
        if (dtype !== null) {
            reqBody.device_type = dtype;
        }

        const context = {
            projectId: projectId,
            deviceId: deviceId,
            deviceName: deviceName,
            deviceType: deviceType
        };
        const req = _requester.postRequest(URL, reqBody, _token);
        const bodyHandler = function(resp, body, status) {
            if (status === RequestResults.SUCCESS) {
                resp.device = new Device(body.device_id, body.device_name, body.device_type, body.created);
                /* TODO(rrk): Deprecated, remove in v0.8.0 */
                resp.device.device_id = resp.device.getId();
                resp.device.device_name = resp.device.getName();
                resp.device.created = resp.device.getCreated();
                if (body.device_type) {
                    resp.device.device_type = resp.device.getType();
                }
            } else if (status === RequestResults.FAILURE) {
                if (body && body.errors) {
                    resp.error = body.errors[0];
                }
            }
        };
        const innerCb = Utils.createInnerCb(callback, context, bodyHandler);
        _requester.execute(req, innerCb);
    }

};
