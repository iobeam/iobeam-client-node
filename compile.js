var fs = require("fs-extra");
var semver = require("semver");
var exec = require("child_process").exec;

function log(msg) {
    console.log("[iobeam-client] " + msg);
}

var forceBabel;
// if dependency, check the package.json
try {
    var pjson = require(__dirname + "/../../package.json");
    var iobeamClient = pjson.iobeam;
    forceBabel = iobeamClient.babel || iobeamClient.es5 || false;
} catch (Exception) {
    forceBabel = false;
}

var src;
log("Determining whether to use ES5 or not...");
if (!forceBabel && semver.gt(process.version, "4.0.0")) {
    log("ES5 not needed, using original files.");
    src = "./src";
} else {
    if (forceBabel) {
        log("Library requested that ES5 be used.");
    } else {
        log("Node version too old, using ES5.");
    }
    src = "./es5";
}

try {
    fs.copySync(src, "./lib", {clobber: true});
} catch (err) {
        return console.error(err);
}
