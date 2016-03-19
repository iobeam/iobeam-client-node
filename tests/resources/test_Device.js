"use strict";
jest.autoMockOff();
const Device = require("../../src/resources/Device")

describe("Device construction", () => {
    it("tests constructor fails", () => {
        const check = (id) => {
            try {
                new Device(id);
                expect(false).toBe(true);
            } catch (err) {
                expect(true).toBe(true);
            }
        };

        check("no.periods");
        check(["array"]);
        check(123);
    });
});
