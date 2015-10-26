"use strict";
const Exception = require("../exceptions/Exception");
const Utils = require("../utils/Utils");

/**
 * Represents a data batch, i.e., rows of data points.
 * @constructor
 * @param {array} fields - List of columns in this batch
 */
function DataBatch(fields) {
    if (fields === null || typeof(fields) === "undefined" ||
        fields.constructor !== Array) {
        throw new Exception("fields must be an array of strings");
    }

    const _rows = [];
    // Deep copy to prevent accidental modification
    const _fields = [];
    fields.forEach(function(f) {
        _fields.push(f);
    });

    return {

        /**
         * Add a new row to the batch at a particular time.
         * @param {int} time - Timestamp for all the points
         * @param {object} data - Represents data to add for this row, with
         * the property names representing the fields. Omitted field names are
         * set to null.
         */
        add: function(time, data) {
            if (data === null || typeof(data) === "undefined") {
                throw new Exception("data cannot be null/undefined");
            }

            // Verify data object
            for (let k in data) {
                if (!Utils.isInArray(k, _fields)) {
                    throw new Exception("data contains field not in this batch: " + k);
                }
            }
            let row = {time: time};

            _fields.forEach(function(f) {
                const val = data[f] || null;
                row[f] = val;
            });
            _rows.push(row);
        },

        /* Return the list of fields in this batch */
        fields: function() {
            return _fields;
        },

        /* Return the list of rows in this batch */
        rows: function() {
            return _rows;
        }
    };
}

module.exports = DataBatch;
