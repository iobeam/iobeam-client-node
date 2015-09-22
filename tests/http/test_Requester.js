"use strict";
jest.autoMockOff();
const Requester = require("../../src/http/Requester");
const RequestResults = require("../../src/constants/RequestResults");

const TEST_URL = "test";
const TEST_TOKEN = "dummy";


describe("execute", () => {
    const cases = [
        {
            msg: "tests timeout",
            err: {timeout: 10000},
            expect: RequestResults.TIMEOUT
        },
        {
            msg: "tests 401 = FORBIDDEN",
            err: null,
            res: {status: 401},
            expect: RequestResults.FORBIDDEN
        },
        {
            msg: "tests 403 = FORBIDDEN",
            err: null,
            res: {status: 403},
            expect: RequestResults.FORBIDDEN
        },
        {
            msg: "tests 200 = SUCCESS",
            err: null,
            res: {status: 200},
            expect: RequestResults.SUCCESS
        },
        {
            msg: "tests 201 = SUCCESS",
            err: null,
            res: {status: 201},
            expect: RequestResults.SUCCESS
        },
        {
            msg: "tests 204 = SUCCESS",
            err: null,
            res: {status: 204},
            expect: RequestResults.SUCCESS
        },
        {
            msg: "tests 400 = FAILURE",
            err: null,
            res: {status: 400},
            expect: RequestResults.FAILURE
        },
        {
            msg: "tests 500 = FAILURE",
            err: null,
            res: {status: 500},
            expect: RequestResults.FAILURE
        }
    ];
    
    console.log = function(){};
    cases.forEach((e) => {
        it(e.msg, () => {
            const req = {
                req: {path: TEST_URL},
                end: (cb) => {
                    cb(e.err, e.res);
                }
            };
            const cb = (status, res, ctxt) => {
                if (status === RequestResults.PENDING) {
                    return;
                }
                expect(status).toBe(e.expect);
            };
            Requester.execute(req, cb, null);
        });
    });
});


describe("getRequests", () => {
    it("gives a GET request w/o auth", () => {
        const req = Requester.getRequest(TEST_URL);
        expect(req.url).toBe(TEST_URL);
        expect(typeof(req.req)).toBe("undefined");
    });

    it("gives a GET request w/ auth", () => {
        const req = Requester.getRequest(TEST_URL, TEST_TOKEN);
        expect(req.url).toBe(TEST_URL);
        const headers = req.req._headers;
        expect(typeof(headers)).toBe("object");
        expect(headers.hasOwnProperty("authorization")).toBe(true);
        const shouldToken = "Bearer " + TEST_TOKEN;
        expect(headers.authorization).toBe(shouldToken);
    });
});


describe("postRequests", () => {
    const testBody = {};
    it("tests a POST request w/o a body", () => {
        const req = Requester.postRequest(TEST_URL);
        expect(req.url).toBe(TEST_URL);
        expect(typeof(req.req)).toBe("object");
        expect(req._data).toBe(undefined);
    });

    it("gives a POST request w/o auth", () => {
        const req = Requester.postRequest(TEST_URL, testBody);
        expect(req.url).toBe(TEST_URL);
        expect(typeof(req.req)).toBe("object");
        expect(req._data).toBe(testBody);
    });

    it("gives a POST request w/ auth", () => {
        const req = Requester.postRequest(TEST_URL, testBody, TEST_TOKEN);
        expect(req.url).toBe(TEST_URL);
        const headers = req.req._headers;
        expect(typeof(headers)).toBe("object");
        expect(headers.hasOwnProperty("authorization")).toBe(true);
        const shouldToken = "Bearer " + TEST_TOKEN;
        expect(headers.authorization).toBe(shouldToken);
    });
});
