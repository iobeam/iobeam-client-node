"use strict";
const RequestResults = require("../constants/RequestResults");
const Utils = require("../utils/Utils");

let _token = null;
let _requester = null;

function setOpt(request, opts, name) {
    const temp = {};
    if (opts[name]) {
        temp[name] = opts[name];
        request.query(temp);
    }
}

module.exports = {

    initialize: function(token, requester) {
        Utils.assertValidToken(token);
        Utils.assertValidRequester(requester);
        _token = token;
        _requester = requester;
    },

    query: function(projectId, deviceId, seriesName, callback, options) {
        Utils.assertValidToken(_token);
        Utils.assertValidProjectId(projectId);
        const did = deviceId || "all";
        const sname = seriesName || "all";
        const opts = options || {};
        if (did !== "all") {
            Utils.assertValidDeviceId(did);
        }
        const endpoint = "/exports/" + projectId + "/" + did + "/" + sname;
        const URL = _requester.getFullEndpoint(endpoint);
        const context = {
            projectId: projectId,
            deviceId: deviceId,
            seriesName: seriesName,
            options: opts
        };

        const req = _requester.getRequest(URL, _token);
        setOpt(req, opts, "limit");
        setOpt(req, opts, "from");
        setOpt(req, opts, "to");
        setOpt(req, opts, "output");
        setOpt(req, opts, "group_by");
        setOpt(req, opts, "operator");
        setOpt(req, opts, "timefmt");

        const bodyHandler = function(resp, body, status) {
            if (status === RequestResults.SUCCESS) {
                resp.body = body;
            } else if (status === RequestResults.FAILURE) {
                resp.error = body.errors[0].message;
            }
        };
        const innerCb = Utils.createInnerCb(callback, context, bodyHandler);
        _requester.execute(req, innerCb);
    }
};
