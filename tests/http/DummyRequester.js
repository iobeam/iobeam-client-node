"use strict";
jest.autoMockOff();
const RequestResults = require("../../src/constants/RequestResults");
const Utils = require("../../src/utils/Utils");

let _lastReq = null;
const _deviceIds = new Set();

function registerDevice(deviceId, deviceName) {
    if (_deviceIds.has(deviceId)) {
        const err = {message: "no dupe id", code: 150};
        return {status: 422, body: {errors: [err]}}
    }
    _deviceIds.add(deviceId);
    return {status: 200, body: {device_id: deviceId, device_name: deviceName}};
}

const DummyRequester = {
    OK_TOKEN: "dummytoken",
    BAD_TOKEN: "badtoken",

    execute: (r, cb) => {
        if (r.token !== DummyRequester.OK_TOKEN) {
            cb(RequestResults.FORBIDDEN, {status: 403});
        } else if (r.url === "dummy/v1/devices") {
            const ret = registerDevice(r.body.device_id, r.body.device_name);
            cb(Utils.statusCodeToResult(ret.status), ret);
        } else {
            // TODO: update
            cb(RequestResults.FORBIDDEN, {status: 403});
        }
    },

    getFullEndpoint: (e) => "dummy/v1" + e,

    getRequest: (url, token) => {
        _lastReq = {
            url: url,
            token: (token || null)
        };
    },

    postRequest: (url, body, token) => {
        _lastReq = {
            url: url,
            body: body,
            token: (token || null)
        };
        return _lastReq;
    },

    getLastRequest: () => _lastReq
}

module.exports = DummyRequester;
