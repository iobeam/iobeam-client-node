"use strict";
jest.autoMockOff();
const Exports = require("../../src/endpoints/Exports");
const DummyRequester = require("../http/DummyRequester");

const PROJECT_ID = 1;
const PROJECT_TOKEN = DummyRequester.OK_TOKEN;

describe("tests query", () => {
    Exports.initialize(PROJECT_TOKEN, DummyRequester);
    const DEVICE_ID = "junk";
    const SERIES_NAME = "series-name";
    const cases = [
        {
            msg: "tests fully qualified, no opts",
            url: DummyRequester.BASE_URL + "/exports/1/junk/series-name",
            did: DEVICE_ID,
            sname: SERIES_NAME,
            opts: undefined,
            opts_len: 0
        },
        {
            msg: "tests no device, no opts",
            url: DummyRequester.BASE_URL + "/exports/1/all/series-name",
            did: null,
            sname: SERIES_NAME,
            opts: undefined,
            opts_len: 0
        },
        {
            msg: "tests no series, no opts",
            url: DummyRequester.BASE_URL + "/exports/1/junk/all",
            did: DEVICE_ID,
            sname: null,
            opts: undefined,
            opts_len: 0
        },
        {
            msg: "tests no device, no series, no opts",
            url: DummyRequester.BASE_URL + "/exports/1/all/all",
            did: null,
            sname: null,
            opts: undefined,
            opts_len: 0
        },
        {
            msg: "tests no device, no series w/ opts",
            url: DummyRequester.BASE_URL + "/exports/1/all/all",
            did: null,
            sname: null,
            opts: {to: 10, from: 0, limit: 3},
            opts_len: 3
        },
    ];

    cases.forEach( (c) => {
        it(c.msg, () => {
            const cb = (resp, context) => {
                const req = DummyRequester.getLastRequest();
                expect(req.url).toBe(c.url);

                expect(context).toBeDefined();
                expect(context.projectId).toBe(PROJECT_ID);
                expect(context.deviceId).toBe(c.did);
                expect(context.seriesName).toBe(c.sname);
                expect(Object.keys(context.options).length).toBeDefined(c.opts_len);
                if (c.opts_len > 0) {
                    for (let k in context.options) {
                        expect(k in c.opts).toBe(true);
                    }
                }
            };
            Exports.query(PROJECT_ID, c.did, c.sname, cb, c.opts);
        });
    });
});
