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

    query: function(namespace = "input", callback, opts = {}, context = {}) {
        Utils.assertValidToken(_token);
        let endpoint = "/data/" + namespace + "/";
        if (context.fieldName) {
            endpoint = endpoint + context.fieldName + "/";
        }
        if (context.deviceId) {
            opts.where = opts.where || [];
            opts.where.push("eq(device_id," + context.deviceId + ")");
        }
        const URL = _requester.getFullEndpoint(endpoint);
        context.options = context.options || opts;

        const req = _requester.getRequest(URL, _token);

        setOpt(req, opts, "limit");
        setOpt(req, opts, "limit_by");
        setOpt(req, opts, "time");
        setOpt(req, opts, "timefmt");

        //special cases for options
        if (opts.where) {
            //statement format: comparator(field, value)
            opts.where.forEach((statement) => {
                req.query({where: statement});
            });
        }
        if (opts.group_by && opts.operator) {
            req.query({group_by: opts.group_by});
            req.query({operator: opts.operator});
            if (opts.limit_periods) {
                req.query({limit_periods: opts.limit_periods});
            }
        } if (opts.timefmt) {
            req.query({timefmt: opts.timefmt});
        }
        if (opts.output === "csv" || opts.output === "json") {
            req.query({output: opts.output});
        } else if (opts.output) {
            console.log("Output set to json format");
            req.query({output: "json"});
        }

        const bodyHandler = function(resp, body, status) {
            if (status === RequestResults.SUCCESS) {
                resp.body = body;
            } else if (status === RequestResults.FAILURE) {
                resp.error = body.errors[0].message;
            }
        };
        const innerCb = Utils.createInnerCb(callback, context, bodyHandler);
        _requester.execute(req, innerCb);
        opts.where = [];
    }
};
