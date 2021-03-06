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

    /* TODO(rrk) Remove deprecated params in v0.9.0*/

    /**
     * Register the device with the iobeam.
     * @param {integer} projectId - Project ID for the device
     * @param {function} [callback] - Callback for the API response
     * @param {Device} [deviceId] - Desired Device object with wanted specs.
     * Otherwise randomly generated by iobeam.
     */
    register: function(projectId, callback, device) {
        Utils.assertValidToken(_token);
        const URL = _requester.getFullEndpoint("/devices");
        let did = device || null;
        let dname = null;
        let dtype = null;
        if (device instanceof Device) {
            did = device.getId();
            dname = device.getName();
            dtype = device.getType();
        } else if (device) {
            console.warn("Please use Device instead of passing a string.");
        }

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
            device: new Device(did, dname, dtype),
            deviceId: did,
            deviceName: dname,
            deviceType: dtype
        };
        const req = _requester.postRequest(URL, reqBody, _token);
        const bodyHandler = function(resp, body, status) {
            if (status === RequestResults.SUCCESS) {
                resp.device = new Device(body.device_id, body.device_name, body.device_type, body.created);
            } else if (body && body.errors) {
                resp.error = body.errors[0];
            }
        };
        const innerCb = Utils.createInnerCb(callback, context, bodyHandler);
        _requester.execute(req, innerCb);
    }

};
