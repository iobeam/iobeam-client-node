"use strict";

const RequestResults = require("../constants/RequestResults");

const Utils = require("../utils/Utils");

let _token = null;
let _requester = null;

module.exports = {

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
            const body = webResp.body;
            if (status === RequestResults.SUCCESS) {
                resp.timestamp = body.server_timestamp;
            } else if (status === RequestResults.FAILURE) {
                resp.error = body.errors[0].message;
            }
            callback(resp);
        };
        _requester.execute(req, innerCb);
    },

    register: function(projectId, callback, deviceId, deviceName) {
        Utils.assertValidToken(_token);
        const URL = _requester.getFullEndpoint("/devices");
        const did = deviceId || null;
        const dname = deviceName || null;

        const reqBody = {project_id: projectId};
        if (did !== null) {
            reqBody.device_id = did;
        }
        if (dname !== null) {
            reqBody.device_name = dname;
        }

        const req = _requester.postRequest(URL, _token, reqBody);
        const innerCb = function(status, webResp) {
            if (status === RequestResults.PENDING) {
                return;
            } else if (!Utils.isCallback(callback)) {
                return;
            }

            const resp = Utils.getDefaultApiResp(status, webResp);
            const body = webResp.body;
            if (status === RequestResults.SUCCESS) {
                resp.device = {
                    device_id: body.device_id,
                    device_name: body.device_name
                };
            } else if (status === RequestResults.FAILURE) {
                resp.error = body.errors[0].message;
            }
            callback(resp);
        };
        _requester.execute(req, innerCb);
    }

};
