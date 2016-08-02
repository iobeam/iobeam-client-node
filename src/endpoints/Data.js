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

    query: function(namespace, callback, opts = {}, context = {}) {
        Utils.assertValidToken(_token);
        let endpoint = "/data/" + namespace + "/";
        if (context.seriesName) {
            endpoint = endpoint + context.seriesName + "/";
        }
        const URL = _requester.getFullEndpoint(endpoint);
        context.options = context.options || opts;

        const req = _requester.getRequest(URL, _token);

        if (opts.limit) {
            req.query({limit: opts.limit});
        }
        if (opts.limit_by) {
            req.query({limit_by: opts.limit_by});
        }
        if (opts.time) {
            req.query({time: opts.time});
        }
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
        } else {
            console.log("Invalid format for query output");
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
    }
};
