"use strict";
const Utils = require("../utils/Utils");

/**
 * Represents a device.
 * @constructor
 * @param {string} id - Device id
 * @param {string} [name] - Human readable device names
 * @param {type} [type] - Device type
 * @returns {object} A Device object with the given parameters.
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
