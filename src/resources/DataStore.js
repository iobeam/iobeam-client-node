"use strict";
const Exception = require("../exceptions/Exception");
const Utils = require("../utils/Utils");

const _reserved = ["time", "time_offset", "all"];

const _DataStore = function(fields, rows) {
    const lower = [];
    for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        if (f === undefined || f === null || f === "" || typeof(f) !== "string") {
            throw new Exception("Column name cannot be empty");
        }
        lower.push(f.toLowerCase());
    }
    for (let i = 0; i < _reserved.length; i++) {
        const r = _reserved[i];
        if (lower.indexOf(r) >= 0) {
            throw new Exception("'" + r + "' is a reserved column name");
        }
    }

    const _fields = fields;
    const _rows = rows;

    /**
     * Add a new row to the store at a particular time.
     * @param {int} time - Timestamp for all the points
     * @param {object} data - Represents data to add for this row, with
     * the property names representing the fields. Omitted field names are
     * set to null.
    */
    this.add = function(time, data) {
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
    };

    /**
     * Add a new row to the store at the current timestamp.
     * @param {object} data - Represents data to add for this row, with
     * the property names representing the fields. Omitted field names are
     * set to null.
     */
    this.addNow = function(data) {
        this.add(Date.now(), data);
    };

    /* Get the list of fields in this store. */
    this.fields = function() {
        return _fields.slice(0);
    };

    /* Get the list of rows in this store */
    this.rows = function() {
        const ret = [];
        for (let i = 0; i < _rows.length; i++) {
            const r = _rows[i];
            const temp = {};
            const keys = Object.keys(r);
            for (let j = 0; j < keys.length; j++) {
                const k = keys[j];
                temp[k] = r[k];
            }
            ret.push(temp);
        }
        return ret;
    };

    this.reset = function() {
        _rows.splice(0, _rows.length);
    };

    /**
     * Get the size of this store.
     * @returns {int} Size of the store, which is (# of fields) * (# of rows).
     */
    this.size = function() {
        return _fields.length * _rows.length;
    };

    /**
     * Get a new copy of this DataStore at the current state.
     * @returns {DataStore} A copy of the current DataStore with the same
     * fields and rows.
     */
    this.snapshot = function() {
        return new DataStore(this);
    };
};

/**
 * Represents a data store, i.e., rows of data points.
 * @constructor
 * @param {array} fields - List of columns in this store.
 * @returns {DataStore} Object representing a store of data in table format.
 */
function DataStore(fields) {
    if (fields === null || typeof(fields) === "undefined") {
        throw new Exception("Cannot make DataStore from null/undefined");
    } else if (fields instanceof DataStore) {
        _DataStore.call(this, fields.fields(), fields.rows());
    } else if (fields.constructor === Array) {
        _DataStore.call(this, fields.slice(0), []);
    } else {
        throw new Exception("Unable to make DataStore with: " + fields);
    }
}

module.exports = DataStore;
