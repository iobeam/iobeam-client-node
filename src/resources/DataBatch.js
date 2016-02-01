"use strict";
const Exception = require("../exceptions/Exception");
const Utils = require("../utils/Utils");

const _reserved = ["time", "time_offset", "all"];

const _DataBatch = function(fields, rows) {
    const lower = [];
    for (let f of fields) {
        lower.push(f.toLowerCase());
    }
    for (let r of _reserved) {
        if (lower.indexOf(r) >= 0) {
            throw new Exception("'" + r + "' is a reserved column name");
        }
    }
    
    const _fields = fields;
    const _rows = rows;

    return {

        /**
         * Add a new row to the batch at a particular time.
         * @param {int} time - Timestamp for all the points
         * @param {object} data - Represents data to add for this row, with
         * the property names representing the fields. Omitted field names are
         * set to null.
         */
        add: function(time, data) {
            if (this.size() + fields.length > 500) {
                throw new Exception("batches are limited to 500 data points");
            }

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
            return _fields.slice(0);
        },

        /* Return the list of rows in this batch */
        rows: function() {
            const ret = [];
            _rows.forEach(function(r) {
                const temp = {};
                Object.keys(r).forEach(function(k) {
                    temp[k] = r[k];
                });
                ret.push(temp);
            });
            return ret;
        },

        reset: function() {
            _rows.splice(0, _rows.length);
        },

        /* Return the table size (rows * fields) of this batch */
        size: function() {
            return _fields.length * _rows.length;
        },

        /* Return a new DataBatch with the content of this one at the current state */
        snapshot: function() {
            return new _DataBatch(this.fields(), this.rows());
        }
    };
};

/**
 * Represents a data batch, i.e., rows of data points.
 * @constructor
 * @param {array} fields - List of columns in this batch
 * @returns {object} Object representing a batch of data in table format.
 */
function DataBatch(fields) {

    if (fields === null || typeof(fields) === "undefined" ||
        fields.constructor !== Array) {
        throw new Exception("fields must be an array of strings");
    }

    return new _DataBatch(fields.slice(0), []);
}

module.exports = DataBatch;
