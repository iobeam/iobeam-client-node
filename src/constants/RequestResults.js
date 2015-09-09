const keyMirror = require("keymirror");

module.exports = keyMirror(
    {
        PENDING: null,
        TIMEOUT: null,
        FORBIDDEN: null,
        SUCCESS: null,
        FAILURE: null
    }
);
