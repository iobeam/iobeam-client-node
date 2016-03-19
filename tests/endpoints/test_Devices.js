"use strict";
jest.autoMockOff();
const Devices = require("../../src/endpoints/Devices");
const DummyRequester = require("../http/DummyRequester");

const PROJECT_ID = 1;
const PROJECT_TOKEN = DummyRequester.OK_TOKEN;

describe("test sending", () => {
    Devices.initialize(PROJECT_TOKEN, DummyRequester);
    const DEVICE_ID = "junk";
    const DEVICE_NAME = "junk-name";
    const DEVICE_TYPE = "junk-type";

    it("tests register no args", () => {
        const cb = (resp, context) => {
            const body = DummyRequester.getLastRequest().body;
            expect(body).toBeDefined();
            expect(body.project_id).toBe(PROJECT_ID);
            expect(body.device_type).toBeUndefined();

            expect(context).toBeDefined();
            expect(context.projectId).toBe(PROJECT_ID);
            expect(context.deviceId).toBeUndefined();
            expect(context.deviceName).toBeUndefined();
            expect(context.deviceType).toBeUndefined();
        };
        Devices.register(1, cb);
    });

    it("tests register device id", () => {
        const cb = (resp, context) => {
            const body = DummyRequester.getLastRequest().body;
            expect(body).toBeDefined();
            expect(body.project_id).toBe(PROJECT_ID);
            expect(body.device_id).toBe(DEVICE_ID);
            expect(body.device_type).toBeUndefined();

            expect(context).toBeDefined();
            expect(context.projectId).toBe(PROJECT_ID);
            expect(context.deviceId).toBe(DEVICE_ID);
            expect(context.deviceName).toBeUndefined();
            expect(context.deviceType).toBeUndefined();
        };
        Devices.register(1, cb, DEVICE_ID);
    });

    it("tests register device name", () => {
        const cb = (resp, context) => {
            const body = DummyRequester.getLastRequest().body;
            expect(body).toBeDefined();
            expect(body.project_id).toBe(PROJECT_ID);
            expect(body.device_name).toBe(DEVICE_NAME);
            expect(body.device_type).toBeUndefined();

            expect(context).toBeDefined();
            expect(context.projectId).toBe(PROJECT_ID);
            expect(context.deviceId).toBeFalsy();
            expect(context.deviceName).toBe(DEVICE_NAME);
            expect(context.deviceType).toBeUndefined();
        };
        Devices.register(1, cb, null, DEVICE_NAME);
    });

    it("tests register id & name", () => {
        const cb = (resp, context) => {
            const body = DummyRequester.getLastRequest().body;
            expect(body).toBeDefined();
            expect(body.project_id).toBe(PROJECT_ID);
            expect(body.device_id).toBe(DEVICE_ID);
            expect(body.device_name).toBe(DEVICE_NAME);
            expect(body.device_type).toBeUndefined();

            expect(context).toBeDefined();
            expect(context.projectId).toBe(PROJECT_ID);
            expect(context.deviceId).toBe(DEVICE_ID);
            expect(context.deviceName).toBe(DEVICE_NAME);
            expect(context.deviceType).toBeUndefined();
        };
        Devices.register(1, cb, DEVICE_ID, DEVICE_NAME);
    });

    it("tests register id & name & type", () => {
        const cb = (resp, context) => {
            const body = DummyRequester.getLastRequest().body;
            expect(body).toBeDefined();
            expect(body.project_id).toBe(PROJECT_ID);
            expect(body.device_id).toBe(DEVICE_ID);
            expect(body.device_name).toBe(DEVICE_NAME);
            expect(body.device_type).toBe(DEVICE_TYPE);

            expect(context).toBeDefined();
            expect(context.projectId).toBe(PROJECT_ID);
            expect(context.deviceId).toBe(DEVICE_ID);
            expect(context.deviceName).toBe(DEVICE_NAME);
            expect(context.deviceType).toBe(DEVICE_TYPE);
        };
        Devices.register(1, cb, DEVICE_ID, DEVICE_NAME, DEVICE_TYPE);
    });
});
