"use strict";
jest.autoMockOff();
const Devices = require("../../src/endpoints/Devices");
const Device = require("../../src/resources/Device");
const DummyRequester = require("../http/DummyRequester");

const PROJECT_ID = 1;
const PROJECT_TOKEN = DummyRequester.OK_TOKEN;

describe("test registering", () => {
    Devices.initialize(PROJECT_TOKEN, DummyRequester);
    const DEVICE_ID = "junk";
    const DEVICE_NAME = "junk-name";
    const DEVICE_TYPE = "junk-type";

    it("tests register no args", () => {
        const cb = (resp, context) => {
            const body = DummyRequester.getLastRequest().body;
            expect(body).toBeDefined();
            expect(body.project_id).toBe(PROJECT_ID);

            expect(context).toBeDefined();
            expect(context.projectId).toBe(PROJECT_ID);
            expect(context.device).toBeDefined();
            expect(context.deviceId).toBeNull();
            expect(context.deviceName).toBeNull();
            expect(context.deviceType).toBeNull();
        };
        Devices.register(1, cb);
    });

    it("tests register device id", () => {
        const cb = (resp, context) => {
            const body = DummyRequester.getLastRequest().body;
            expect(body).toBeDefined();
            expect(body.project_id).toBe(PROJECT_ID);
            expect(body.device_id).toBe(DEVICE_ID);

            expect(context).toBeDefined();
            expect(context.projectId).toBe(PROJECT_ID);
            expect(context.device).toBeDefined();
            expect(context.deviceId).toBe(DEVICE_ID);
            expect(context.deviceName).toBeNull();
            expect(context.deviceType).toBeNull();
        };
        Devices.register(1, cb, new Device(DEVICE_ID));
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
            expect(context.device).toBeDefined();
            expect(context.deviceId).toBeNull();
            expect(context.deviceName).toBe(DEVICE_NAME);
            expect(context.deviceType).toBeNull();
        };
        const dev = new Device(null, DEVICE_NAME);
        Devices.register(1, cb, dev);
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
            expect(context.device).toBeDefined();
            expect(context.deviceId).toBe(DEVICE_ID);
            expect(context.deviceName).toBe(DEVICE_NAME);
            expect(context.deviceType).toBeNull();
        };
        const dev = new Device(DEVICE_ID, DEVICE_NAME);
        Devices.register(1, cb, dev);
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
        const dev = new Device(DEVICE_ID, DEVICE_NAME, DEVICE_TYPE);
        Devices.register(1, cb, dev);
    });
});
