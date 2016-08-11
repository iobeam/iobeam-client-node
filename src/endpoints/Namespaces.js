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

    query: function(projectId, callback, opts = {}) {
        Utils.assertValidToken(_token);
        let endpoint = "/namespaces/";
        const context = {
            projectId: projectId,
            options: opts
        };
        const URL = _requester.getFullEndpoint(endpoint);

        const req = _requester.getRequest(URL, _token);
        if (opts.name) {
            req.query({name: opts.name});
        } else if (opts.namespaceID) {
            endpoint = endpoint + opts.namespaceID;
        }

        const bodyHandler = function(resp, body, status) {
            if (status === RequestResults.SUCCESS) {
                resp.body = body;
            } else if (body && body.errors) {
                resp.error = body.errors[0].message;
            }
        };
        const innerCb = Utils.createInnerCb(callback, context, bodyHandler);
        _requester.execute(req, innerCb);
    }
};
