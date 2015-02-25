#!/usr/bin/env node

// retrieve all global links, and unlink all

var fs = require('fs')
var execSync = require('exec-sync');
var readJson = require('read-package-json')
var pwd = execSync("pwd")


var cliArgs = require("command-line-args");

/* define the command-line options */
var cli = cliArgs([
    { name: "global", type: Boolean, alias: "g", description: "remove from global cache" },
    { name: "help", type: Boolean, description: "Print usage instructions" },
    { name: "module", type: Array, defaultOption: true, description: "The module to unlink" }
]);

/* parse the supplied command-line values */
var options = cli.parse();

/* generate a usage guide */
var usage = cli.getUsage({
    header: "NPM unlinker, unlink module locally or globally",
    footer: "\nex : node unlink.js -g lib-vpaid , will uninstall lib-vpaid from the global npm cache, and install the last version into the cache"
});

if (options['help']) {
    console.log(usage);
}

else if (options['global']) {
    var output = execSync('ls -l /usr/local/lib/node_modules | grep "\\\->"')

    var m = (options["module"] &&options["module"].length > 0) ? null : options["module"].join(' ')

    if (String(output).trim().length > 0) {
        console.log("try to unlink " + (m ? m : "all modules") + " globally")

        output.split("\n").forEach(function(val) {
            var dir = String(val.split('->')[1]).trim()

            readJson(dir + '/package.json', console.error, false, function (er, data) {
                if (er) {
                    // if we got an error, this mean we should totaly remove link from node_modules, the package may have change name
                    console.error("WARNING, file  " + dir + "/package.json, doesn't exist or throw an error (error : " + er.errno + " - " + er.code + ")")
                    return
                }

                if (!m || (options["module"].indexOf(data.name) != -1)) {
                    var unlink = execSync("npm r " + data.name + " -g", true)

                    if (unlink.stderr) {
                        console.log('unable to unlink ' + data.name + ' module in ' + dir + ', does the module exists ?')
                    }
                    else {
                        console.log('module "' + data.name + '" removed from global cache')
                    }
                }

            });
        });
    } else {
        console.log('nothing to unlink globally for ' + (m ? m : "all modules"));
    }
} else {
    var runInstall = false;

    // module per module
    if (options["module"] && options["module"].length > 0) {
        options["module"].forEach(function(val) {
            execSync("npm unlink " + val, true);
        });

        runInstall = true;
    }
    // all modules
    else {
        if (String(execSync('ls -l ./node_modules | grep "\\\->"')).trim().length > 0) {
            fs.readdirSync(pwd + '/node_modules').forEach(function(val) {
                var stat = fs.lstatSync(pwd + '/node_modules/' + val)

                if (stat.isSymbolicLink()) {
                    var unlink = execSync("npm unlink " + val, true)
                    console.log(unlink.stdout)
                    runInstall = true
                }
            })
        }
    }

    if (runInstall) {
        console.log("run npm install command, please wait");
        var npmInstall = execSync("npm install", true);

        if (npmInstall.stderr) {
            console.log('npm install throw an error ' + npmInstall.stderr)
        }
    }
    else {
        console.log('no linked module in your ./node_modules directory, nothing to do')
    }
}
