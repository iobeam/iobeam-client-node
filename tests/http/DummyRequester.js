"use strict";
jest.autoMockOff();
const RequestResults = require("../../src/constants/RequestResults");
const Utils = require("../../src/utils/Utils");

let _lastReq = null;
const _deviceIds = new Set();

function registerDevice(deviceId, deviceName) {
    if (_deviceIds.has(deviceId)) {
        const err = {message: "no dupe id", code: 150};
        return {status: 422, type: "application/json", body: {errors: [err]}}
    }
    _deviceIds.add(deviceId);
    return {status: 200, type: "application/json", body: {device_id: deviceId, device_name: deviceName}};
}

function modQuery(params) {
    // TODO: Modify the url.
}

const DummyRequester = {
    OK_TOKEN: "dummytoken",
    BAD_TOKEN: "badtoken",
    BASE_URL: "dummy/v1",

    execute: (r, cb) => {
        if (r.token !== DummyRequester.OK_TOKEN) {
            cb(RequestResults.FORBIDDEN, {status: 403, type: "application/json"});
        } else if (r.url === "dummy/v1/devices") {
            const ret = registerDevice(r.body.device_id, r.body.device_name);
            cb(Utils.statusCodeToResult(ret.status), ret);
        } else if (r.url.startsWith(this.BASE_URL + "/exports")) {
            cb(RequestResults.SUCCESS, {status: 200, type: "application/json"});
        } else {
            // TODO: update
            cb(RequestResults.FORBIDDEN, {status: 403, type: "application/json"});
        }
    },

    getFullEndpoint: (e) => "dummy/v1" + e,

    getRequest: (url, token) => {
        _lastReq = {
            url: url,
            token: (token || null),
            query: modQuery
        };
        return _lastReq;
    },

    postRequest: (url, body, token) => {
        _lastReq = {
            url: url,
            body: body,
            token: (token || null),
            query: modQuery
        };
        return _lastReq;
    },

    getLastRequest: () => _lastReq
}

module.exports = DummyRequester;
