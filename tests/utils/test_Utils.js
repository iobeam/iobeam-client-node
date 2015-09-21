"use strict";
jest.dontMock("../../src/utils/Utils");
const Utils = require("../../src/utils/Utils");

describe("isCallback", () => {
    const f = function() { };
    const cases = [
        {msg: "checks null is false", arg: null, res: false},
        {msg: "checks undefined is false", arg: undefined, res: false},
        {msg: "checks non-func is false", arg: "callback", res: false},
        {msg: "checks anon func is true", arg: function(){}, res: true},
        {msg: "checks func is true", arg: f, res: true}
    ]

    cases.forEach((e) => {
        it(e.msg, () => {
            expect(Utils.isCallback(e.arg)).toBe(e.res);
        });
    });
});


describe("assertValidToken", () => {
    const cases = [
        {msg: "checks null is invalid", arg: null, res: false},
        {msg: "checks undefined is invalid", arg: undefined, res: false},
        {msg: "checks non-string is invalid", arg: 1, res: false},
        {msg: "checks 0-len string is invalid", arg: "", res: false},
        {msg: "checks string is valid", arg: "token", res: true}
    ];
    cases.forEach((e) => {
        it(e.msg, () => {
            try {
                Utils.assertValidToken(e.arg);
                expect(e.res).toBe(true);
            } catch (ApiException) {
                expect(e.res).toBe(false);
            }
        });
    });
});


describe("assertValidProjectId", () => {
    const cases = [
        {msg: "checks null is invalid", arg: null, res: false},
        {msg: "checks undefined is invalid", arg: undefined, res: false},
        {msg: "checks non-int is invalid", arg: "no int", res: false},
        {msg: "checks 0 is invalid", arg: 0, res: false},
        {msg: "checks negative is invalid", arg: -1, res: false},
        {msg: "checks positive is valid", arg: 1, res: true}
    ];
    cases.forEach((e) => {
        it(e.msg, () => {
            try {
                Utils.assertValidProjectId(e.arg);
                expect(e.res).toBe(true);
            } catch (ApiException) {
                expect(e.res).toBe(false);
            }
        });
    });
});


describe("assertValidDeviceId", () => {
    const cases = [
        {msg: "checks null is invalid", arg: null, res: false},
        {msg: "checks undefined is invalid", arg: undefined, res: false},
        {msg: "checks non-string is invalid", arg: 1, res: false},
        {msg: "checks 0-len string is invalid", arg: "", res: false},
        {msg: "checks string is valid", arg: "token", res: true}
    ];
    cases.forEach((e) => {
        it(e.msg, () => {
            try {
                Utils.assertValidDeviceId(e.arg);
                expect(e.res).toBe(true);
            } catch (ApiException) {
                expect(e.res).toBe(false);
            }
        });
    });
});


describe("assertValidDataPoint", () => {
    const goodDp = {timestamp: 123, value: 5};
    const badDp1 = {timestamp: 123};
    const badDp2 = {value: 5};
    const cases = [
        {msg: "checks null is invalid", arg: null, res: false},
        {msg: "checks undefined is invalid", arg: undefined, res: false},
        {msg: "checks missing value is invalid", arg: badDp1, res: false},
        {msg: "checks missing time is invalid", arg: badDp2, res: false},
        {msg: "checks point is valid", arg: goodDp, res: true}
    ];
    cases.forEach((e) => {
        it(e.msg, () => {
            try {
                Utils.assertValidDataPoint(e.arg);
                expect(e.res).toBe(true);
            } catch (ApiException) {
                expect(e.res).toBe(false);
            }
        });
    });
});

// TODO Add tests for valid Requester
