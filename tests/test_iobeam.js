"use strict";
jest.autoMockOff();
const MockDate = require("mockdate");
const iobeam = require("../src/iobeam");

const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6MTB9.eyJ1aWQiOjAsInBpZCI6MzIsImV4cCI6MTQ0OTIzNDY2MCwicG1zIjo3fQ.notlegitsignature=";
MockDate.set(1449234659999);

describe("test import error callback", () => {
    it("forgets to set device id", () => {
        const client = new iobeam.Builder(1, TOKEN).build();
        const ds = client.createDataStore(["temperature"]);
        ds.addNow({temperature: 72.0});
        const callback = (error) => {
            expect(error).not.toBeNull();
        };
        client.send(callback);
    });
});
