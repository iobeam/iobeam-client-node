"use strict";
jest.autoMockOff();
const Imports = require("../../src/endpoints/Imports");
const DataBatch = require("../../src/resources/DataStore");
const RequestResults = require("../../src/constants/RequestResults");

let req = null;

const fakeImportRequester = {
    execute: (r, cb) => {
        cb(RequestResults.FORBIDDEN, {status: 401});
    },
    getLastRequest: () => req,
    getFullEndpoint: (e) => e,
    getRequest: () => { ; },
    postRequest: (url, body, token) => {
        req = {
            url: url,
            body: body,
            token: token
        }
        return req
    },
    reset: () => { req = null; }
}

describe("test sending", () => {
    Imports.initialize("bad token", fakeImportRequester);
    const PROJECT_ID = 1;
    const DEVICE_ID = "test-device";

    it("returns full response, not just boolean", () => {
        const cb = (resp) => {
            expect(typeof(resp)).toBe("object");
            expect(resp.timeout).toBe(false);
            expect(resp.allowed).toBe(false);
            expect(resp.code).toBe(401);
            expect(resp.success).toBe(false);
        };
        Imports.import(PROJECT_ID, DEVICE_ID, {}, cb);
    });

    it("checks request is right", () => {
       const cb = (resp) => {
            const req = fakeImportRequester.getLastRequest().body;
            expect(req.project_id).toBe(PROJECT_ID);
            expect(req.device_id).toBe(DEVICE_ID);
            expect(req.sources.length).toBe(0);
        };
        Imports.import(PROJECT_ID, DEVICE_ID, {}, cb);
    });
});

describe("test batch send", () => {
    Imports.initialize("token", fakeImportRequester);
    const PROJECT_ID = 1;
    const DEVICE_ID = "test-device";
    const FIELDS = ["foo", "bar"];

    it("checks empty request is true", () => {
        const batch = new DataBatch(FIELDS);
        fakeImportRequester.reset();
        const cb = (resp) => {
            const req = fakeImportRequester.getLastRequest();
            expect(req).toBeNull();
            expect(resp.success).toBe(true);
        }
        Imports.importBatch(PROJECT_ID, DEVICE_ID, batch, cb);
    });

    it("checks request is right", () => {
        const batch = new DataBatch(FIELDS);
        batch.add(0, {foo: 1.0, bar: 2.0});
        batch.add(10, {foo: 3.0, bar: 4.0});
        batch.add(20, {foo: 5.0});
        fakeImportRequester.reset();

        const cb = (resp) => {
            const req = fakeImportRequester.getLastRequest().body;
            expect(req.project_id).toBe(PROJECT_ID);
            expect(req.device_id).toBe(DEVICE_ID);
            expect(req.sources.fields.length).toBe(FIELDS.length + 1);
            expect(req.sources.fields[0]).toBe("time");
            for (let i = 0; i < FIELDS.length; i++) {
                expect(req.sources.fields[i + 1]).toBe(FIELDS[i]);
            }
            expect(req.sources.data.length).toBe(3);

            expect(req.sources.data[0][0]).toBe(0);  // time
            expect(req.sources.data[0][1]).toBe(1.0);  // foo
            expect(req.sources.data[0][2]).toBe(2.0);  // bar

            expect(req.sources.data[1][0]).toBe(10);  // time
            expect(req.sources.data[1][1]).toBe(3.0);  // foo
            expect(req.sources.data[1][2]).toBe(4.0);  // bar

            expect(req.sources.data[2][0]).toBe(20);  // time
            expect(req.sources.data[2][1]).toBe(5.0);  // foo
            expect(req.sources.data[2][2]).toBe(null);  // bar
        };
        Imports.importBatch(PROJECT_ID, DEVICE_ID, batch, cb);
    });
});
