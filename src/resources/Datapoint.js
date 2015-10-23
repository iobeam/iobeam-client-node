"use strict";

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

module.exports = _DataPoint;
