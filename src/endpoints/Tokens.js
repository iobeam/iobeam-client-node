"use strict";

const ApiException = require("../exceptions/ApiException");
const RequestResults = require("../constants/RequestResults");
const Utils = require("../utils/Utils");

let _requester = null;

function assertValidPermissions(perms) {

    if (perms === null || !(perms instanceof Object)) {
        throw new ApiException("permissions must be an object");
    }
}


module.exports = {

    initialize: function(requester) {
        Utils.assertValidRequester(requester);
        _requester = requester;
    },

    getUserToken: function(username, password, callback) {
        const URL = _requester.getFullEndpoint("/tokens/user");
        const context = {
            username: username,
            password: password
        };

        const req = _requester.getRequest(URL);
        const authStr = "Basic " +
            new Buffer(username + ":" + password).toString("base64");
        req.set("Authorization", authStr);

        const bodyCb = function(resp, body, status) {
            if (status === RequestResults.SUCCESS) {
                resp.body = body;
            } else if (body && body.errors) {
                resp.error = body.errors[0];
            }
        };
        const innerCb = Utils.createInnerCb(callback, context, bodyCb);
        _requester.execute(req, innerCb);
    },

    getProjectToken: function(projectId, permissions, userToken, callback) {
        Utils.assertValidProjectId(projectId);
        Utils.assertValidToken(userToken);
        assertValidPermissions(permissions);
        const context = {
            projectId: projectId,
            permissions: permissions,
            userToken: userToken
        };

        const URL = _requester.getFullEndpoint("/tokens/project");
        const req = _requester.getRequest(URL, userToken);

        const readPerm = permissions.read || false;
        const writePerm = permissions.write || false;
        const adminPerm = permissions.admin || false;
        req.query({read: readPerm, write: writePerm, admin: adminPerm})
            .query({project_id: projectId})
            .query({include_user: false});

        const bodyCb = function(resp, body, status) {
            if (status === RequestResults.SUCCESS) {
                resp.body = body;
            } else if (body && body.errors) {
                resp.error = body.errors[0];
            }
        };
        const innerCb = Utils.createInnerCb(callback, context, bodyCb);
        _requester.execute(req, innerCb);
    },

    refreshProjectToken: function(projectToken, callback) {
        Utils.assertValidToken(projectToken);
        const context = {
            projectToken: projectToken
        };

        const URL = _requester.getFullEndpoint("/tokens/project");
        const reqBody = {refresh_token: projectToken};
        const req = _requester.postRequest(URL, reqBody);

        const bodyHandler = function(resp, body, status) {
            if (status === RequestResults.SUCCESS) {
                resp.body = body;
            } else if (body && body.errors) {
                resp.error = body.errors[0];
            }
        };
        const innerCb = Utils.createInnerCb(callback, context, bodyHandler);
        _requester.execute(req, innerCb);
    }

};
