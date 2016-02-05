"use strict";
const RequestResults = require("../constants/RequestResults");
const Utils = require("../utils/Utils");

let _token = null;
let _requester = null;

module.exports = {

    /**
     * Initialize the Imports module.
     * @param {string} token - Project token to use when making API calls
     * @param {Requester} requester - Object that performs the API calls via HTTP
     */
    initialize: function(token, requester) {
        Utils.assertValidToken(token);
        Utils.assertValidRequester(requester);
        _token = token;
        _requester = requester;
    },

    /**
     * Perform API call to send data in series format
     * @param {int} projectId - Project ID this data belongs to
     * @param {string} deviceId - Device ID this data belongs to
     * @param {object} dataSet - Data organized by series names as properties and
     * arrays of data points.
     * @param {function} callback - Function to be called after request returns.
     */
    import: function(projectId, deviceId, dataSet, callback) {
        Utils.assertValidToken(_token);
        Utils.assertValidProjectId(projectId);
        Utils.assertValidDeviceId(deviceId);
        const URL = _requester.getFullEndpoint("/imports");

        const reqBody = {
            project_id: parseInt(projectId),
            device_id: deviceId,
            sources: []
        };

        for (let series in dataSet) {
            if (dataSet.hasOwnProperty(series)) {
                const seriesTemp = {name: series, data: []};
                dataSet[series].forEach(function(dp) {
                    const temp = {time: dp.timestamp, value: dp.value};
                    seriesTemp.data.push(temp);
                });
                reqBody.sources.push(seriesTemp);
            }
        }

        const req = _requester.postRequest(URL, reqBody, _token);
        const innerCb = Utils.createInnerCb(callback, null, function() {});
        _requester.execute(req, innerCb);
    },

    /**
     * Performs API call to send data in batch/table format.
     * @param {int} projectId - Project ID this data belongs to
     * @param {string} deviceId - Device ID this data belongs to
     * @param {DataBatch} batch - Data in table format
     * @param {function} callback - Function to be called after request returns.
     */
    importBatch: function(projectId, deviceId, batch, callback) {
        Utils.assertValidToken(_token);
        Utils.assertValidProjectId(projectId);
        Utils.assertValidDeviceId(deviceId);
        if (batch.rows().length === 0) {
            if (Utils.isCallback(callback)) {
                const resp = Utils.getDefaultApiResp(RequestResults.SUCCESS, {status: 200});
                callback(resp);
            }
            return;
        }
        const URL = _requester.getFullEndpoint("/imports?fmt=table");


        const reqBody = {
            project_id: parseInt(projectId),
            device_id: deviceId
        };

        const fields = ["time"];
        batch.fields().forEach(function(f) {
            fields.push(f);
        });

        const rows = batch.rows();
        const data = [];
        rows.forEach(function(r) {
            const temp = [];
            fields.forEach(function(f) {
                temp.push(r[f]);
            });
            data.push(temp);
        });

        reqBody.sources = {
            fields: fields,
            data: data
        };

        const req = _requester.postRequest(URL, reqBody, _token);
        const innerCb = Utils.createInnerCb(callback, null, function() {});
        _requester.execute(req, innerCb);
    }
};
