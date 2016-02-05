"use strict";
const util = require("util");
const DataStore = require("./DataStore");

module.exports = util.deprecate(DataStore, "DataBatch is a deprecated alias. Use DataStore.");
