"use strict";
jest.autoMockOff();
jest.dontMock("../../src/http/Requester");
const Requester = require("../../src/http/Requester");

const TEST_URL = "test";
const TEST_TOKEN = "dummy";

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
