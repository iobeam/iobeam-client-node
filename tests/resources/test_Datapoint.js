"use strict";
jest.autoMockOff();
const MockDate = require("mockdate");
const DataPoint = require("../../src/resources/DataPoint")

describe("datapoint construction", () => {
    const TEST_VAL = 5;
    const TEST_TIME = 1234456678;
    MockDate.set(TEST_TIME);

    it("tests explicit constructor", () => {
        const dp = new DataPoint(TEST_VAL, TEST_TIME);
        expect(dp.value).toBe(TEST_VAL);
        expect(dp.timestamp).toBe(TEST_TIME);
    });

    it("tests implicit constructor", () => {
        const dp = new DataPoint(TEST_VAL);
        expect(dp.value).toBe(TEST_VAL);
        expect(dp.timestamp).toBe(TEST_TIME);
    });

    it("tests explicit w/ null", () => {
        const dp = new DataPoint(TEST_VAL, null);
        expect(dp.value).toBe(TEST_VAL);
        expect(dp.timestamp).toBe(TEST_TIME);
    });

    it("tests explicit w/ undefined", () => {
        const dp = new DataPoint(TEST_VAL, undefined);
        expect(dp.value).toBe(TEST_VAL);
        expect(dp.timestamp).toBe(TEST_TIME);
    });
});
