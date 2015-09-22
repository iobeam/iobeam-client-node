"use strict";

function Exception(message) {
    this.message = message;
    this.name = "Exception";
    this.iobeam = true;
}

module.exports = Exception;
