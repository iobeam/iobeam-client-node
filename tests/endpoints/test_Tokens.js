"use strict";
jest.autoMockOff();
const Tokens = require("../../src/endpoints/Tokens");
const RequestResults = require("../../src/constants/RequestResults");

const CORRECT_USER = "test";
const CORRECT_PASS = "correct";
const CORRECT_PID = 1;
const CORRECT_TOKEN = "dummytoken";

const __req = {
    url: null,
    headers: new Map(),
    params: {},
    set: (key, value) => {
        __req.headers.set(key, value);
        return __req;
    },
    query: (params) => {
        Object.assign(__req.params, params);
        return __req;
    },
    reset: () => {
        __req.url = null;
        __req.headers = new Map();
        __req.params = {};
    }
}

const fakeRequester = {

    _handleGetUserToken: (r, cb) => {
        if (r.headers) {
            const auth = r.headers.get("Authorization");
            if (auth) {
                const slice = auth.slice(auth.indexOf(" ") + 1);
                const args = new Buffer(slice, "base64").toString("ascii").split(":");
                if (args.length === 2 && args[0] === CORRECT_USER && args[1] === CORRECT_PASS) {
                    cb(RequestResults.SUCCESS,
                        {
                            status: 200,
                            body: {}
                        }
                    );
                    return;
                }
            }
        }
        const errors = [{message: "invalid"}];
        cb(RequestResults.FORBIDDEN,
            {
                status: 403,
                body: {errors: errors}
            }
        );
    },

    _handleGetProjectToken: (r, cb) => {
        if (r.headers) {
            const auth = r.headers.get("Authorization");
            const correctToken = auth === "Bearer " + CORRECT_TOKEN;
            const correctPid = r.params.project_id === CORRECT_PID;
            if (correctToken && correctPid) {
                cb(RequestResults.SUCCESS,
                    {
                        status: 200,
                        body: {}
                    }
                );
                return;
            }
        }
        const errors = [{message: "invalid"}];
        cb(RequestResults.FORBIDDEN,
            {
                status: 403,
                body: {errors: errors}
            }
        );
    },

    execute: (r, cb) => {
        if (r.url === "/tokens/user") {
            fakeRequester._handleGetUserToken(r, cb);
        } else if (r.url === "/tokens/project") {
            fakeRequester._handleGetProjectToken(r, cb);
        }
    },

    getFullEndpoint: (e) => e,
    getRequest: (url, token) => {
        __req.url = url;
        if (token) {
            __req.set("Authorization", "Bearer " + token);
        }
        return __req;
    },
    postRequest: () => { ; },
    reset: () => {
        __req.reset();
    }
}

describe("test user token", () => {
    Tokens.initialize(fakeRequester);
    it("good combo returns body and success", () => {
        fakeRequester.reset();
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
            fakeRequester.reset();
            Tokens.getUserToken(c.user, c.pass, badCb);
        });
    });
});

describe("test project token", () => {
    Tokens.initialize(fakeRequester);
    it("good combo returns body and success", () => {
        fakeRequester.reset();
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
        {msg: "wrong token -> 403/error", pid: CORRECT_PID, token: "WRONG"}
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
            fakeRequester.reset();
            const perms = {read: true};
            Tokens.getProjectToken(c.pid, perms, c.token, badCb);
        });
    });
});
