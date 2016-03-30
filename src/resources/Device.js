"use strict";
const Utils = require("../utils/Utils");

/**
 * Represents a device.
 * @constructor
 * @param {string} id - Device id
 * @param {string} [name] - Human readable device names
 * @param {type} [type] - Device type
 * @returns {Device} A Device object with the given parameters.
 */
function Device(id, name, type, created) {
    const _id = id || null;
    if (_id) {
        Utils.assertValidDeviceId(_id);
    }
    const _name = name || null;
    const _type = type || null;
    const _created = created || null;

    /**
     * Get the device's created date.
     * @returns {string} Creation date as a string, null if not set.
     */
    this.getCreated = () => _created;

    /**
     * Get the device's id.
     * @returns {string} Device id.
     */
    this.getId = () => _id;

    /**
     * Get the device's name.
     * @returns {string} Device name, null if not set.
     */
    this.getName = () => _name;

    /**
     * Get the device's type.
     * @returns {string} Device type, null if not set.
     */
    this.getType = () => _type;

    this.toJSON = () => {
        const ret = {id: _id};
        if (_name) {
            ret.name = _name;
        }
        if (_type) {
            ret.type = _type;
        }
        if (_created) {
            ret.created = _created;
        }
        return ret;
    };
}

module.exports = Device;
