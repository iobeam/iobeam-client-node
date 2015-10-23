"use strict";

const RequestResults = require("../constants/RequestResults");

const Utils = require("../utils/Utils");

let _token = null;
let _requester = null;

module.exports = {

    initialize: function(token, requester) {
        Utils.assertValidToken(token);
        Utils.assertValidRequester(requester);
        _token = token;
        _requester = requester;
    },

    import: function(projectId, deviceId, dataSet, callback) {
        Utils.assertValidToken(_token);
        Utils.assertValidProjectId(projectId);
        const URL = _requester.getFullEndpoint("/imports");

        const reqBody = {};
        reqBody.project_id = parseInt(projectId);
        reqBody.device_id = deviceId;
        reqBody.sources = [];

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
        const innerCb = function(status, webResp) {
            if (status === RequestResults.PENDING) {
                return;
            } else if (!Utils.isCallback(callback)) {
                return;
            }

            const resp = Utils.getDefaultApiResp(status, webResp);
            callback(resp);
        };
        _requester.execute(req, innerCb);
    },

    importBatch: function(projectId, deviceId, batch, callback) {
        Utils.assertValidToken(_token);
        Utils.assertValidProjectId(projectId);
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
        const innerCb = Utils.createInnerCb(callback, null, function(){});
        _requester.execute(req, innerCb);
    }
};
