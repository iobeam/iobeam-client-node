"use strict";
jest.autoMockOff();
const MockDate = require("mockdate");
const DataBatch = require("../../src/resources/DataBatch")

const FIELDS = ["foo", "bar", "baz"];

describe("DataBatch construction", () => {
    it("tests constructor fails", () => {
        const check = (fields) => {
            try {
                new DataBatch(fields);
                expect(false).toBe(true);
            } catch (Exception) {
                expect(true).toBe(true);
            }
        };

        check(null);
        check(undefined);
        check("this is not an array");
    });

    it("tests constructor", () => {
        const batch = new DataBatch(FIELDS);
        const have = batch.fields();
        expect(have.length).toBe(FIELDS.length);
        for (let i = 0; i < FIELDS.length; i++) {
            expect(have[i]).toBe(FIELDS[i]);
        }
    });

    it("tests constructor deep copies", () => {
        const temp = ["a", "b", "c"];
        const batch = new DataBatch(temp);
        let have = batch.fields();
        expect(have.length).toBe(temp.length);
        for (let i = 0; i < temp.length; i++) {
            expect(have[i]).toBe(temp[i]);
        }
        temp.push("d");
        have = batch.fields();
        expect(have.length).toBe(temp.length - 1);
    });
});

describe("adding to batches", () => {
    it("tests full row", () => {
        const check = (have, wantTime, wantData) => {
            expect(have.time).toBe(wantTime);
            expect(have.foo).toBe(wantData.foo);
            expect(have.bar).toBe(wantData.bar);
            expect(have.baz).toBe(wantData.baz);
        }
        const batch = new DataBatch(FIELDS);
        const row1 = {foo: 1.0, bar: 2.0, baz: 3.0};
        batch.add(0, row1);
        let have = batch.rows();
        expect(have.length).toBe(1);
        check(have[0], 0, row1);

        const row2 = {foo: 4.0, bar: 5.0, baz: 6.0};
        batch.add(1000, row2);
        have = batch.rows();
        expect(have.length).toBe(2);
        check(have[0], 0, row1);
        check(have[1], 1000, row2);
    });

    it("tests sparse row", () => {
        const batch = new DataBatch(FIELDS);
        const row1 = {foo: 1.0, baz: 3.0};
        batch.add(0, row1);
        let have = batch.rows();
        expect(have.length).toBe(1);
        expect(have[0].time).toBe(0);
        expect(have[0].foo).toBe(row1.foo);
        expect(have[0].bar).toBe(null);
        expect(have[0].baz).toBe(row1.baz);

        const row2 = {foo: 1.0};
        batch.add(1000, row2);
        have = batch.rows();
        expect(have.length).toBe(2);
        expect(have[1].time).toBe(1000);
        expect(have[1].foo).toBe(row1.foo);
        expect(have[1].bar).toBe(null);
        expect(have[1].baz).toBe(null);
    });

    it("tests bad data errors", () => {
        const check = (badRow) => {
            try {
                batch.add(0, badRow);
                expect(false).toBe(true);
            } catch (Exception) {
                expect(batch.rows().length).toBe(0);
            }
        };
        const batch = new DataBatch(FIELDS);

        check({wrong: 5.0});
        check({foo: 1.0, bar: 2.0, baz: 3.0, bad: 5.0});
        check(null);
        check(undefined);
    });
});

describe("adding too many to batch", () => {
    const batch = new DataBatch(FIELDS);

    it("tests size function", () => {
        for (let i = 0; i < 166; i++) {
            batch.add(i, {foo: i, bar: i, baz: i});
            expect(batch.size()).toBe((i + 1) * 3);
        }
    });

    it("tests than > 500 fails", () => {
        try {
            batch.add(167, {foo: 167});
            expect(false).toBe(true);
        } catch (Exception) {
            expect(batch.size()).toBe(498);
        }
    });
});
