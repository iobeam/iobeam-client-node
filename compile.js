var fs = require("fs-extra");
var semver = require("semver");
var exec = require("child_process").exec;

var prefix = "[iobeam-client] ";

function log(msg) {
    console.log(prefix + msg);
}

var forceBabel;
// if dependency, check the package.json
try {
    var pjson = require(__dirname + "/../../package.json");
    var iobeamClient = pjson.iobeam;
    forceBabel = iobeamClient.babel || false;
} catch (Exception) {
    forceBabel = false;
}

log("Determining whether to use Babel or not...");
if (!forceBabel && semver.gt(process.version, "4.0.0")) {
    log("Babel not needed, using original files.");
    fs.copySync("./src", "./lib", {clobber: true}, function(err) {
        if (err) {
            return console.error(err);
        }
    });
} else {
    if (forceBabel) {
        log("Library requested that babel be used.");
    } else {
        log("Node version too old, using babel.");
    }
    exec("npm run babel", function(err) {
        if (err !== null) {
            console.log(err);
            return -1;
        }
    });
}
