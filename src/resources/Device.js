"use strict";
const Utils = require("../utils/Utils");

/**
 * Represents a device.
 * @constructor
 * @param {string} id - Device id
 * @param {string} name - Human readable device names
 * @param {type} type - Device type
 * @returns {object} Object representing a device.
 */
function Device(id, name, type, created) {
    const _id = id || null;
    if (_id) {
        Utils.assertValidDeviceId(_id);
    }
    const _name = name || null;
    const _type = type || null;
    const _created = created || null;

    this.getCreated = () => _created;
    this.getId = () => _id;
    this.getName = () => _name;
    this.getType = () => _type;
}

module.exports = Device;
