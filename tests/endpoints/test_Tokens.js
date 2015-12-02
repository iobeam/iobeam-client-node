"use strict";
jest.autoMockOff();
const Tokens = require("../../src/endpoints/Tokens");
const DummyRequester = require("../http/DummyRequester");

const CORRECT_USER = DummyRequester.OK_USER;
const CORRECT_PASS = DummyRequester.OK_PASS;
const CORRECT_PID = DummyRequester.OK_PID;
const CORRECT_TOKEN = DummyRequester.OK_TOKEN;
const BAD_USER = DummyRequester.BAD_USER;
const BAD_PASS = DummyRequester.BAD_PASS;
const BAD_TOKEN = DummyRequester.BAD_TOKEN;

describe("test user token", () => {
    Tokens.initialize(DummyRequester);
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
        {msg: "wrong user -> 403/error", user: BAD_USER, pass: CORRECT_PASS},
        {msg: "wrong pass -> 403/error", user: CORRECT_USER, pass: BAD_PASS},
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

describe("test project token", () => {
    Tokens.initialize(DummyRequester);
    it("good combo returns body and success", () => {
        const cb = (resp) => {
            expect(typeof(resp)).toBe("object");
            expect(resp.timeout).toBe(false);
            expect(resp.allowed).toBe(true);
            expect(resp.code).toBe(200);
            expect(resp.success).toBe(true);
            expect(typeof(resp.body)).toBe("object");
        };
        const perms = {read: true};
        Tokens.getProjectToken(CORRECT_PID, perms, CORRECT_TOKEN, cb);
    });

    const badCases = [
        {msg: "wrong pid -> 403/error", pid: 2, token: CORRECT_TOKEN},
        {msg: "wrong token -> 403/error", pid: CORRECT_PID, token: BAD_TOKEN}
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
            const perms = {read: true};
            Tokens.getProjectToken(c.pid, perms, c.token, badCb);
        });
    });
});

describe("test refresh project token", () => {
    Tokens.initialize(DummyRequester);
    it("good combo returns body and success", () => {
        const cb = (resp) => {
            expect(typeof(resp)).toBe("object");
            expect(resp.timeout).toBe(false);
            expect(resp.allowed).toBe(true);
            expect(resp.code).toBe(200);
            expect(resp.success).toBe(true);
            expect(typeof(resp.body)).toBe("object");
        };
        Tokens.refreshProjectToken(CORRECT_TOKEN, cb);
    });
});
