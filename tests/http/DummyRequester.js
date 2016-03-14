"use strict";
jest.autoMockOff();
const RequestResults = require("../../src/constants/RequestResults");
const Utils = require("../../src/utils/Utils");

const CORRECT_USER = "test";
const CORRECT_PASS = "correct";
const CORRECT_PID = 1;
const CORRECT_TOKEN = "dummytoken";

const _lastReq = {
    url: null,
    headers: new Map(),
    params: {},
    method: null,
    set: (key, value) => {
        _lastReq.headers.set(key, value);
        return _lastReq;
    },
    query: (params) => {
        Object.assign(_lastReq.params, params);
        return _lastReq;
    },
    reset: () => {
        _lastReq.url = null;
        _lastReq.headers = new Map();
        _lastReq.params = {};
    }
};
const _deviceIds = new Set();

function registerDevice(deviceId, deviceName) {
    if (_deviceIds.has(deviceId)) {
        const err = {message: "no dupe id", code: 150};
        return {status: 422, type: "application/json", body: {errors: [err]}};
    }
    _deviceIds.add(deviceId);
    return {status: 200, type: "application/json", body: {device_id: deviceId, device_name: deviceName}};
}

function getUserToken(req) {
    if (req.headers) {
        const auth = req.headers.get("Authorization");
        if (auth) {
            const slice = auth.slice(auth.indexOf(" ") + 1);
            const args = new Buffer(slice, "base64").toString("ascii").split(":");
            if (args.length === 2 && args[0] === CORRECT_USER && args[1] === CORRECT_PASS) {
                return {status: 200, type: "application/json", body: {}};
            }
        }
    }
    const errors = [{message: "invalid"}];
    return {status: 403, type: "application/json", body: {errors: errors}};
}

function getProjectToken(req) {
    if (req.headers) {
        const auth = req.headers.get("Authorization");
        const correctToken = auth === "Bearer " + CORRECT_TOKEN;
        const correctPid = req.params.project_id === CORRECT_PID;
        if (correctToken && correctPid) {
            return {status: 200, type: "application/json", body: {}};
        }
    }
    const errors = [{message: "invalid"}];
    return {status: 403, type: "application/json", body: {errors: errors}};
}

function refreshProjectToken(token) {
    if (token === CORRECT_TOKEN) {
        return {status: 200, type: "application/json", body: {
            token: "refreshtoken",
            expires: "a date",
            project_id: CORRECT_PID,
            read: true,
            write: true,
            admin: false
        }};
    }
    const errors = [{message: "invalid"}];
    return {status: 403, type: "application/json", body: {errors: errors}};
}

function modQuery(params) {
    // TODO: Modify the url.
}

const DummyRequester = {
    OK_TOKEN: CORRECT_TOKEN,
    OK_PID: CORRECT_PID,
    OK_USER: CORRECT_USER,
    OK_PASS: CORRECT_PASS,
    BAD_TOKEN: "badtoken",
    BAD_USER: "WRONG",
    BAD_PASS: "WRONG",
    BASE_URL: "dummy/v1",

    execute: (r, cb) => {
        if (r.url === "dummy/v1/tokens/user") {
            const ret = getUserToken(r);
            cb(Utils.statusCodeToResult(ret.status), ret);
        } else if (r.url === "dummy/v1/tokens/project") {
            let ret;
            if (r.method === "GET") {
                ret = getProjectToken(r);
            } else if (r.method === "POST") {
                ret = refreshProjectToken(r.body.refresh_token);
            }
            cb(Utils.statusCodeToResult(ret.status), ret);
        } else if (r.token !== DummyRequester.OK_TOKEN) {
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
        _lastReq.reset();
        _lastReq.url = url;
        _lastReq.method = "GET";
        _lastReq.token = (token || null);
        if (token) {
            _lastReq.set("Authorization", "Bearer " + token);
        }
        return _lastReq;
    },

    postRequest: (url, body, token) => {
        _lastReq.reset();
        _lastReq.url = url;
        _lastReq.method = "POST";
        _lastReq.body = body;
        _lastReq.token = (token || null);
        if (token) {
            _lastReq.set("Authorization", "Bearer " + token);
        }
        return _lastReq;
    },

    getLastRequest: () => _lastReq
};

module.exports = DummyRequester;
