"use strict";
const fs = require("fs");
const path = require("path");

const Requester = require("./http/Requester");
const Utils = require("./utils/Utils");

const Devices = require("./endpoints/Devices");
const Imports = require("./endpoints/Imports");
const Tokens = require("./endpoints/Tokens");

const DataStore = require("./resources/DataStore");
const Device = require("./resources/Device");

const _ID_FILENAME = "/iobeam_device_id";
const UTF8_ENC = "utf8";

function __callUserCallback(cb /*, arg1, arg2, ...*/) {
    const cbArgs = Array.prototype.slice.call(arguments, 1);
    if (Utils.isCallback(cb)) {
        cb.apply(this, cbArgs);
    }
}

function _Client(projectId, projectToken, services, requester,
                 deviceId, p) {
    Utils.assertValidProjectId(projectId);
    Utils.assertValidToken(projectToken);
    Utils.assertValidRequester(Requester);

    /* Private vars */
    const _projectId = projectId;
    const _services = services;
    const _batches = [];
    let _token = projectToken;
    let _deviceId = deviceId || null;

    // Use the disk cache if the id is there / it is provided.
    const _path = p ? path.join(p, _ID_FILENAME) : null;
    if (_path !== null) {
        try {
            _deviceId = fs.readFileSync(_path, UTF8_ENC).trim();
        } catch (Exception) {
            // File does not exist or unreadable, ignore.
        }
    }

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
        }
        return true;
    }

    function __startMsgQueue() {
        if (!_inProgress && _msgQueue.length > 0) {
            _inProgress = true;
            const next = _msgQueue.shift();
            next();
        }
    }

    // Let the message queue progress
    function __msgDone() {
        _inProgress = false;
        __startMsgQueue();
    }

    function __setNewToken(resp) {
        if (resp.success) {
            _token = resp.body.token;
            __initServices();
        }
        __msgDone();
    }

    function __checkToken() {
        if (Utils.isExpiredToken(_token)) {
            _msgQueue.push(function() {
                _services.tokens.refreshProjectToken(_token, __setNewToken);
            });
        }
    }

    function __initServices() {
        _services.devices.initialize(_token, requester);
        _services.imports.initialize(_token, requester);
        _services.tokens.initialize(requester);
    }

    __initServices();

    const ret = {

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

        /**
         * Add a DataStore to be tracked and sent on subsequent send() calls.
         * @param {DataStore} dataStore - Store of data o be sent.
         */
        addDataStore: function(dataStore) {
            _batches.push(dataStore);
        },

        /**
         * Create and track DataStore to be sent on subsequent send() calls.
         * @param {array} columns - Columns to track in the DataStore.
         * @return {DataStore} DataStore object in which to add data.
         */
        createDataStore: function(columns) {
            const ret = new DataStore(columns);
            _batches.push(ret);
            return ret;
        },

        /**
         * Register this client with a device. Any registration call that is made before a send()
         * call is guaranteed to finish before the send() call is started.
         *
         * @param {Device} [device] - Register device with same parameters as this Device object.
         * @param {function} [callback] - Function to call upon completion. It can take
         * 3 arguments: success (bool), device object, and error.
         * @param {bool} [setOnDupe] - If true, will set this client to use the device
         * if it already is registered.
         */
        register: function(deviceId, deviceName, callback, setOnDupe, deviceType) {
            let dev;
            let givenCb = callback || null;
            let setDupe = setOnDupe || false;

            if (deviceId instanceof Device) {
                dev = deviceId;
                givenCb = deviceName || null;
                setDupe = callback || false;
            } else if (typeof deviceId === "string") {
                console.warn("Please use iobeam.Device as the first argument");
                dev = new Device(deviceId, deviceName, deviceType);
            } else if (typeof callback === "function") {
                console.warn("Please use iobeam.Device as the first argument");
            } else if (typeof deviceName === "function") {
                givenCb = deviceName || null;
                setDupe = callback || false;
            }

            const did = dev ? dev.getId() : null;

            if (!__hasService("devices")) {
                return; // TODO throw exception
            } else if (_deviceId !== null && (did === _deviceId || did === null)) {
                __callUserCallback(givenCb, null, dev);
                return;
            }

            const cb = function(resp) {
                let success = resp.success;
                let device = null;
                let error = resp.error;

                if (success) {
                    __setDeviceId(resp.device.getId());
                    device = resp.device;
                    error = null;
                } else if (setDupe && resp.error && resp.error.code === 150) {
                    __setDeviceId(did);
                    success = true;
                    error = null;
                    device = new Device(did);
                    // TODO what about device name?
                }

                __callUserCallback(givenCb, error, device);
                __msgDone();
            };

            try {
                __checkToken();
            } catch (err) {
                __callUserCallback(callback, err, null);
                return;
            }
            _msgQueue.push(function() {
                try {
                    _services.devices.register(_projectId, cb, dev);
                } catch (err) {
                    __callUserCallback(callback, err.message, dev);
                }
            });
            __startMsgQueue();
        },

        /**
         * Send data stored in the client. DataStores associated with the client
         * object are copied and then reset (i.e. emptied of data). Each DataStore
         * copy is then sent to iobeam.
         * @param {function} [callback] - Function to call with response taking a boolean, as
         * well as optional arguments of the DataStore it applies the callback applies to and
         * any error that was caused.
         */
        send: function(callback) {
            if (!__hasService("imports")) {
                return; // TODO throw exception
            }

            const cb = function(resp, context) {
                __callUserCallback(callback, resp.error, context.store);
                __msgDone();
            };

            try {
                __checkToken();
            } catch (err) {
                __callUserCallback(callback, err, null);
                return;
            }

            for (let i = 0; i < _batches.length; i++) {
                const b = _batches[i];
                if (b.rows().length === 0) {
                    __callUserCallback(callback, null, b);
                    continue;
                }

                const snapshot = b.snapshot();
                b.reset();
                _msgQueue.push(function() {
                    try {
                        Utils.assertValidDeviceId(_deviceId);
                        _services.imports.importBatch(_projectId, _deviceId, snapshot, cb);
                    } catch (err) {
                        __callUserCallback(callback, err.message, snapshot);
                    }
                });
            }
            __startMsgQueue();
        }
    };

    return ret;
}

/**
 * Builder for iobeam client object (interacts with iobeam backend).
 * @constructor
 * @param {int} projectId - The project this client is for
 * @param {string} projectToken - The token to use for this project
 */
function Builder(projectId, projectToken) {
    Utils.assertValidProjectId(projectId);
    Utils.assertValidToken(projectToken);
    Utils.assertValidRequester(Requester);

    const services = {devices: Devices, imports: Imports, tokens: Tokens};
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
            let p = path || ".";
            if (typeof(p) === "string") {
                _savePath = p;
            }
            return this;
        },

        /**
         * Register this device using the client.
         * @param {Device} deviceSpec - An iobeam.Device object that specifies
         * the properties of the device you want to register.
         * @param {function} callback - Callback to run after register call,
         * takes three params:
         *      (1) a boolean 'success' on whether it succeeded;
         *      (2) if successful, a device object (null otherwise); and
         *      (3) if unsuccessful, an error string of what went wrong.
         * @param {boolean} setOnDupe - Sets client deviceId if register call
         * fails with duplicate error message
         */
        register: function(deviceSpec, callback, setOnDupe) {
            _regArgs = {
                callback: callback,
                setOnDupe: (setOnDupe || false)
            };
            if (deviceSpec instanceof Device) {
                _regArgs.device = deviceSpec;
            } else if (deviceSpec) {
                /* TODO(rrk): Remove in v0.9.0 */
                console.warn("Please use a iobeam.Device object instead of a 'deviceSpec'.");
                _regArgs.device = new Device(deviceSpec.deviceId, deviceSpec.deviceName,
                    deviceSpec.deviceType);
            }
            return this;
        },

        /**
         * Register using this device id. If already present on iobeam, use
         * this id. Alias for 'register(new Device(deviceId), callback, true)'.
         */
        registerOrSetId: function(deviceId, callback) {
            return this.register(new Device(deviceId), callback, true);
        },

        /**
         * Builds the iobeam client specified by this builder.
         */
        build: function() {
            const client = _Client(projectId, projectToken, services, _backend,
                                   _deviceId, _savePath);
            if (_regArgs !== null) {
                client.register(_regArgs.device, _regArgs.callback, _regArgs.setOnDupe);
            }
            return client;
        }
    };
}

module.exports = {
    Builder: Builder,
    DataStore: DataStore,
    Device: Device
};
