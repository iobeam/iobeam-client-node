"use strict";
const fs = require("fs");
const path = require("path");

const Requester = require("./http/Requester");
const Utils = require("./utils/Utils");

const Devices = require("./endpoints/Devices");
const Imports = require("./endpoints/Imports");

const DataBatch = require("./resources/DataBatch");

const _ID_FILENAME = "/iobeam_device_id";
const UTF8_ENC = "utf8";

function _Client(projectId, projectToken, services, requester,
                 deviceId, p) {
    Utils.assertValidProjectId(projectId);
    Utils.assertValidToken(projectToken);
    Utils.assertValidRequester(Requester);

    /* Private vars */
    const _projectId = projectId;
    const _token = projectToken;
    let _deviceId = deviceId || null;
    const _dataset = {};
    const _batches = [];

    // Use the disk cache if the id is there / it is provided.
    const _path = p ? path.join(p, _ID_FILENAME) : null;
    if (_path !== null) {
        try {
            _deviceId = fs.readFileSync(_path, UTF8_ENC).trim();
        } catch (Exception) {
            // File does not exist or unreadable, ignore.
        }
    }

    const _services = services;
    const _msgQueue = [];
    let _inProgress = false;

    /* Private funcs */
    function __setDeviceId(deviceId) {
        Utils.assertValidDeviceId(deviceId);
        _deviceId = deviceId;
        if (_path !== null) {
            fs.writeFile(_path, deviceId + "\n", UTF8_ENC);
        }
    }

    function __hasService(key) {
        if (!Utils.isSet(_services)) {
            return false;
        } else if (!_services.hasOwnProperty(key)) {
            return false;
        } else if (!Utils.isSet(_services[key])) {
            return false;
        } else {
            return true;
        }
    }

    function __startMsgQueue() {
        if (!_inProgress && _msgQueue.length > 0) {
            _inProgress = true;
            const next = _msgQueue.shift();
            next();
        }
    }

    function __convertSeriesToBatch(name, values) {
        const batch = new DataBatch([name]);
        for (let i in values) {
            const pt = values[i];
            const temp = {};
            temp[name] = pt.value;
            batch.add(pt.timestamp, temp);
        }
        return batch;
    }

    /* Init code */
    _services.devices.initialize(_token, requester);
    _services.imports.initialize(_token, requester);


    return {

        /*dataset: function() {
            return _dataset;
        },*/

        /**
         * Set the device id for this client.
         * @param {string} deviceId - Device Id to use
         * @returns (object) This client object
         */
        setDeviceId: function(deviceId) {
            __setDeviceId(deviceId);
            return this;
        },

        /** Get the device id for this client. */
        getDeviceId: function() {
            return _deviceId;
        },

        addDataPoint: function(seriesName, point) {
            Utils.assertValidDataPoint(point);
            if (!_dataset.hasOwnProperty(seriesName)) {
                _dataset[seriesName] = [];
            }
            _dataset[seriesName].push(point);
        },

        /**
         * Add a DataBatch to be sent.
         * @param {DataBatch} dataBatch - Batch of data o be sent.
         */
        addDataBatch: function(dataBatch) {
            _batches.push(dataBatch);
        },

        /**
         * Register this client with a device
         * @param {string} deviceId - Optional, desired device Id
         * @param {string} deviceName - Optional, desired device name
         * @param {function} callback - Optional, function to call with response
         * @param {bool} setOnDupe - If true, will set this client to use the deviceId
         * if it already exists.
         */
        register: function(deviceId, deviceName, callback, setOnDupe) {
            deviceId = deviceId || null;
            setOnDupe = setOnDupe || false;
            if (!__hasService("devices")) {
                return; // TODO throw exception
            } else if (_deviceId !== null && deviceId === _deviceId) {
                return;
            } else if (_deviceId !== null && deviceId === null) {
                return;
            }

            const cb = function(deviceResp) {
                if (deviceResp.success) {
                    __setDeviceId(deviceResp.device.device_id);
                } else if (setOnDupe && deviceResp.error.code === 150) {
                    __setDeviceId(deviceId);
                    deviceResp.success = true;
                    deviceResp.device = {device_id: deviceId};
                    // TODO what about device name?
                }

                if (Utils.isCallback(callback)) {
                    callback(deviceResp.success, deviceResp.device);
                }

                // Let the message queue progress
                _inProgress = false;
                __startMsgQueue();
            };
            _msgQueue.push(function() {
                _services.devices.register(_projectId, cb, deviceId, deviceName);
            });
            __startMsgQueue();
        },

        /**
         * Send data stored in the client.
         * @param {function} callback - Function to call with response
         */
        send: function(callback) {
            if (!__hasService("imports")) {
                return; // TODO throw exception
            }

            const cb = function(resp) {
                if (Utils.isCallback(callback)) {
                    callback(resp.success);
                }
                _batches.shift();

                _inProgress = false;
                __startMsgQueue();
            };

            for (let s in _dataset) {
                _batches.push(__convertSeriesToBatch(s, _dataset[s]));
                delete _dataset[s];
            }

            for (let i in _batches) {
                const b = _batches[i];
                if (b.rows().length === 0) {
                    callback(true);
                    continue;
                }
                _msgQueue.push(function() {
                    Utils.assertValidDeviceId(_deviceId);
                    _services.imports.importBatch(_projectId, _deviceId, b, cb);
                });
            }
            __startMsgQueue();
        }
    };
}

/**
 * Builder for iobeam client object (interacts with iobeam backend).
 * @constructor
 * @param {int} projectId - The project this client is for
 * @param {string} projectToken - The token to use for this project
 */
function _Builder(projectId, projectToken) {
    Utils.assertValidProjectId(projectId);
    Utils.assertValidToken(projectToken);
    Utils.assertValidRequester(Requester);

    const services = {devices: Devices, imports: Imports};
    let _deviceId = null;

    let _savePath = null;
    let _regArgs = null;
    let _backend = Requester;


    return {
        /**
         * Specify the device id for the client object.
         * @param {string} deviceId - Desired device id (needs to be registered).
         */
        setDeviceId: function(deviceId) {
            if (deviceId !== null && typeof(deviceId) === "string") {
                _deviceId = deviceId;
            }
            return this;
        },

        /**
         * Specify the backend base URL to use for API calls
         * @param {string} url - Base URL of API calls, meaning the final
         * URL will be `<url><endpoint>`, e.g., for endpoint "/ping", it will
         * be `<url>/ping`.
         */
        setBackend: function(url) {
            _backend.initialize(url);
            return this;
        },

        /**
         * Set a disk path for saving this client's device ID.
         * @param {string} path - File system path. If not provided, the
         * current directory will be used.
         */
        saveToDisk: function(path) {
            let p = path || null;
            if (p === null) {
                p = ".";
            }
            if (p !== null && typeof(p) === "string") {
                _savePath = p;
            }
            return this;
        },

        /**
         * Register this device using the client.
         * @param {object} deviceSpec - An object with two fields, `deviceId`
         * and `deviceName`, which are used if to manually specify id or name
         * for this device.
         * @param {function} callback - Callback to run after register call,
         * takes two params:
         *      (1) a boolean 'success' on whether it succeeded; and
         *      (2) if successful, a device object (undefined otherwise).
         * @param {boolean} setOnDupe - Sets client deviceId if register call
         * fails with duplicate error message
         */
        register: function(deviceSpec, callback, setOnDupe) {
            _regArgs = {
                callback: callback,
                setOnDupe: (setOnDupe || false)
            };
            if (deviceSpec) {
                if (deviceSpec.deviceId) {
                    _regArgs.deviceId = deviceSpec.deviceId;
                }
                if (deviceSpec.deviceName) {
                    _regArgs.deviceName = deviceSpec.deviceName;
                }
            }
            return this;
        },

        registerOrSetId: function(deviceId, callback) {
            return this.register({deviceId: deviceId}, callback, true);
        },

        /**
         * Builds the iobeam client specified by this builder.
         */
        build: function() {
            const client = _Client(projectId, projectToken, services, _backend,
                                   _deviceId, _savePath);
            if (_regArgs !== null) {
                client.register(_regArgs.deviceId, _regArgs.deviceName,
                                _regArgs.callback, _regArgs.setOnDupe);
            }
            return client;
        }
    };
}

module.exports = {
    Builder: _Builder,
    Datapoint: require("./resources/Datapoint"),
    DataBatch: require("./resources/DataBatch")
};
