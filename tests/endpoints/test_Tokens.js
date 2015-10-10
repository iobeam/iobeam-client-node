"use strict";
jest.autoMockOff();
const Tokens = require("../../src/endpoints/Tokens");
const RequestResults = require("../../src/constants/RequestResults");

const CORRECT_USER = "test";
const CORRECT_PASS = "correct";

const __req = {
    headers: new Map(),
    set: function(key, value) {
        this.headers.set(key, value);
    }
}

const fakeRequester = {
    execute: (r, cb) => {
        let user = null;
        let pass = null;
        if (r.headers) {
            const auth = r.headers.get("Authorization");
            if (auth) {
                const slice = auth.slice(auth.indexOf(" ") + 1);
                const args = new Buffer(slice, "base64").toString("ascii").split(":");
                if (args.length === 2 && args[0] === CORRECT_USER && args[1] === CORRECT_PASS) {
                    cb(RequestResults.SUCCESS, {status: 200, body:{}});
                    return;
                }
            }
        }
        const errors = [{message: "invalid"}];
        cb(RequestResults.FORBIDDEN, {status: 403, body: {errors: errors}});
    },
    getFullEndpoint: (e) => e,
    getRequest: () => __req,
    postRequest: () => { ; }
}

describe("test user token", () => {
    Tokens.initialize(fakeRequester);
    it("good combo returns body and success", () => {
        const cb = (resp) => {
            expect(typeof(resp)).toBe("object");
            expect(resp.timeout).toBe(false);
            expect(resp.allowed).toBe(true);
            expect(resp.code).toBe(200);
            expect(resp.success).toBe(true);
            expect(typeof(resp.body)).toBe("object");
        };
        Tokens.getUserToken(CORRECT_USER, CORRECT_PASS, cb);
    });

    const badCases = [
        {msg: "wrong user -> 403/error", user: "WRONG", pass: CORRECT_PASS},
        {msg: "wrong pass -> 403/error", user: CORRECT_USER, pass: "WRONG"},
        {msg: "null user -> 403/error", user: null, pass: CORRECT_PASS},
        {msg: "undef user -> 403/error", user: undefined, pass: CORRECT_PASS},
        {msg: "null pass -> 403/error", user: CORRECT_USER, pass: null},
        {msg: "undef pass -> 403/error", user: CORRECT_USER, pass: undefined}
    ];
    const badCb = (resp) => {
        expect(typeof(resp)).toBe("object");
        expect(resp.timeout).toBe(false);
        expect(resp.allowed).toBe(false);
        expect(resp.code).toBe(403);
        expect(resp.success).toBe(false);
        expect(typeof(resp.error)).toBe("object");
    };
    badCases.forEach((c) => {
        it(c.msg, () => {
            Tokens.getUserToken(c.user, c.pass, badCb);
        });
    });
});
