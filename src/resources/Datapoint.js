"use strict";
const util = require("util");

/**
 * Represents a series-centric data point.
 * @constructor
 * @param {number} value - Data point value
 * @param {timestamp} timestamp - Time in milliseconds of data point. If empty,
 * will use current time.
 */
function _DataPoint(value, timestamp) {
    let ts = timestamp || null;
    if (ts === null) {
        ts = Date.now();
    }

    return {
        value: value,
        timestamp: ts
    };
}

module.exports = util.deprecate(_DataPoint, "DataPoint has been deprecated. Use DataStore.");
