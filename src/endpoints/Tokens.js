"use strict";

const RequestResults = require("../constants/RequestResults");
const Utils = require("../utils/Utils");

let _requester = null;

module.exports = {

    initialize: function(requester) {
        Utils.assertValidRequester(requester);
        _requester = requester;
    },

    getUserToken: function(username, password, callback) {
        const URL = _requester.getFullEndpoint("/tokens/user");
        const req = _requester.getRequest(URL);
        const authStr = "Basic " +
            new Buffer(username + ":" + password).toString("base64");
        req.set("Authorization", authStr);

        const innerCb = (status, webResp) => {
            if (status == RequestResults.PENDING) {
                return;
            } else if (!Utils.isCallback(callback)) {
                return;
            }

            const resp = Utils.getDefaultApiResp(status, webResp);
            if (!resp.timeout) {
                const body = webResp.body;
                if (status === RequestResults.SUCCESS) {
                    resp.body = body;
                } else if (status === RequestResults.FAILURE) {
                    resp.error = body.errors[0].message;
                }
            }
            callback(resp);
        }
        _requester.execute(req, innerCb);
    }

};
