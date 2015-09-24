var fs = require("fs-extra");
var semver = require("semver");
var exec = require("child_process").exec

console.log("Determining whether to use Babel or not...");
if (semver.gt(process.version, "4.0.0")) {
    console.log("Babel not needed, using original files.");
    fs.copySync("./src", "./lib", {clobber: true}, function(err) {
        if (err) {
            return console.error(err);
        }
        return console.log("success");
    });
} else {
    console.log("Node version too old, using babel.");
    exec("npm run babel", function(err) {
        if (err !== null) {
            console.log(err);
            return -1;
        }
    });
}
