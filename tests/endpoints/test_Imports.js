"use strict";
jest.autoMockOff();
const Imports = require("../../src/endpoints/Imports");
const RequestResults = require("../../src/constants/RequestResults");

const fakeImportRequester = {
    execute: (r, cb) => {
        cb(RequestResults.FORBIDDEN, {status: 401});
    },
    getFullEndpoint: (e) => e,
    getRequest: () => { ; },
    postRequest: () => { ; }
}

describe("test sending", () => {
    Imports.initialize("bad token", fakeImportRequester);
    it("returns full response, not just boolean", () => {
        const cb = (resp) => {
            expect(typeof(resp)).toBe("object");
            expect(resp.timeout).toBe(false);
            expect(resp.allowed).toBe(false);
            expect(resp.code).toBe(401);
            expect(resp.success).toBe(false);
        };
        Imports.import(1, 1, {}, cb);
    });
});
