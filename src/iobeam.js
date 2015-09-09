"use strict";

const Requester = require("./http/Requester");
const Utils = require("./utils/Utils");

const Devices = require("./endpoints/Devices");
const Imports = require("./endpoints/Imports");


function _Client(projectId, projectToken, services, deviceId, path) {
    Utils.assertValidProjectId(projectId);
    Utils.assertValidToken(projectToken);
    Utils.assertValidRequester(Requester);

    /* Private vars */
    const _projectId = projectId;
    const _token = projectToken;
    let _deviceId = deviceId || null;
    const _dataset = {};

    const _services = services;
    const _msgQueue = [];
    let _inProgress = false;

    /* Private funcs */
    function __hasService(key) {
        if (_services === null || typeof(_services) === "undefined") {
            return false;
        } else if (!_services.hasOwnProperty(key)) {
            return false;
        } else if (_services[key] === null || typeof(_services[key]) === "undefined") {
            return false;
        } else {
            return true;
        }
    }

    function __startMsgQueue() {
        if (!_inProgress && _msgQueue.length > 0) {
            _inProgress = true;
            const next = _msgQueue.shift();
            console.log("next: ");
            console.log(next);
            next();
        }
    }

    /* Init code */
    _services.devices.initialize(_token, Requester);
    _services.imports.initialize(_token, Requester);


    return {

        dataset: function() {
            return _dataset;
        },

        setDeviceId: function(deviceId) {
            if (deviceId !== null && typeof(deviceId) === "string") {
                _deviceId = deviceId;
            }
            return self;
        },

        addDataPoint: function(seriesName, point) {
            Utils.assertValidDataPoint(point);
            if (!_dataset.hasOwnProperty(seriesName)) {
                _dataset[seriesName] = [];
            }
            _dataset[seriesName].push(point);
        },

        register: function(deviceId, deviceName) {
            if (!__hasService("devices")) {
                return; // TODO throw exception
            }
            const cb = function(deviceResp) {
                console.log(deviceResp);
                if (deviceResp.success) {
                    _deviceId = deviceResp.device.device_id;
                }
                _inProgress = false;
                __startMsgQueue();
            };
            _msgQueue.push(function() {
                _services.devices.register(_projectId, cb, deviceId, deviceName);
            });
            __startMsgQueue();
        },

        send: function() {
            if (!__hasService("imports")) {
                return; // TODO throw exception
            }
            const cb = function(resp) {
                console.log(resp);
                _inProgress = false;
                __startMsgQueue();
            };
            _msgQueue.push(function() {
                Utils.assertValidDeviceId(_deviceId);
                _services.imports.import(_projectId, _deviceId, _dataset, cb);
            });
            __startMsgQueue();
        }
    };
}

function _Builder(projectId, projectToken) {
    Utils.assertValidProjectId(projectId);
    Utils.assertValidToken(projectToken);
    Utils.assertValidRequester(Requester);

    const services = {devices: Devices, imports: Imports};
    let _deviceId = null;

    let _savePath = null;
    let _regArgs = null;

    return {
        setDeviceId: function(deviceId) {
            if (deviceId !== null && typeof(deviceId) === "string") {
                _deviceId = deviceId;
            }
            return this;
        },

        setSavePath: function(path) {
            if (path !== null && typeof(path) === "string") {
                _savePath = path;
            }
            return this;
        },

        register: function(deviceId, deviceName) {
            _regArgs = {};
            if (deviceId) {
                _regArgs.deviceId = deviceId;
            }
            if (deviceName) {
                _regArgs.deviceName = deviceName;
            }
            return this;
        },

        build: function() {
            const client = _Client(projectId, projectToken, services, _deviceId, _savePath);
            if (_regArgs !== null) {
                client.register(_regArgs.deviceId, _regArgs.deviceName);
            }
            return client;
        }
    };
}

module.exports = {Builder: _Builder};
