"use strict";

function _DataPoint(value, timestamp) {
	let ts = timestamp || null;
	if (ts === null) {
		ts = Date.now();
	}
	return {
		value: value,
		timestamp: ts
	};
}

module.exports = _DataPoint;
