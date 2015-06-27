var fs = require('fs');
var fsutils = require('fs-utils');
var spawn = require('win-spawn');
var downloadelectron = require('gulp-download-electron');

tron = {};

tron.defaultConfig = {
    "application-main-page": "index.html",
    "components": "components",
    "electron-version": "0.28.3",
    "electron-directory": "binaries",
    "electron-app-directory": "app",
    "component-demo-path": "demo/index.html",
    "npm-dependencies": {"tron-cli": "git+https://github.com/bengfarrell/tron-cli.git#master"},
    "use-bower-for-component-id": true
};

// load configuration
tron.loadConfig = function() {
    var config;
    if (fs.existsSync('./tron.json')) {
        config = JSON.parse(fs.readFileSync('./tron.json', 'utf8'));
    } else {
        config = {};
    }

    for (var c in tron.defaultConfig) {
        if (!config[c]) {
            config[c] = tron.defaultConfig[c];
        }
    }

    config.__pathToComponents = "./" + config["electron-app-directory"] + "/" + config["components"]
    return config;
};

tron.getVersion = function() {
    var pkg = JSON.parse(fs.readFileSync(__dirname + "/../package.json", 'utf8'));
    console.log('Tron v' + pkg.version);
};

tron.runProject = function(html, options) {
    var cfg = tron.loadConfig();

    // Electron bin path
    var myOS = require('os').platform();
    var binpath = '';
    if (myOS.substr(0,3) == "win") { binpath = 'binaries\\electron.exe'; }
    if (myOS.substr(0,6) == "darwin") { binpath = 'binaries/Electron.app/Contents/MacOS/Electron'; }

    if (html) {
        cfg["application-main-page"] = html;
    }
    var args = [cfg["electron-app-directory"], 'html:' + "./" + cfg["electron-app-directory"] + "/" + cfg["application-main-page"]];

    if (options.debug) { args.push('debug:' + options.debug ); }
    if (options.fullscreen) { args.push('fullscreen:' + options.fullscreen ); }
    console.log('Running project with Tron: ' + binpath, args);
    spawn(binpath, args);
};

// run component
tron.runComponent = function(comp, options) {
    var cfg = tron.loadConfig();
    if (!fs.existsSync(cfg.__pathToComponents)) {
        console.log('Component directory does not exist: ' + cfg.__pathToComponents );
        console.log('If you want to use a different directory, specify in the .tron file at the root of your project');
        console.log(JSON.stringify(tron.defaultConfig, null, 2));
        return;
    }

    // Electron bin path
    var myOS = require('os').platform();
    var binpath = '';
    if (myOS.substr(0,3) == "win") { binpath = 'binaries\\electron.exe'; }
    if (myOS.substr(0,6) == "darwin") { binpath = 'binaries/Electron.app/Contents/MacOS/Electron'; }

    var args = [cfg["electron-app-directory"], 'html:' + cfg.__pathToComponents + '/' + comp + '/' + cfg["component-demo-path"]];

    if (options.debug) { args.push('debug:' + options.debug ); }
    if (options.fullscreen) { args.push('fullscreen:' + options.fullscreen ); }

    console.log('Running component with Tron: ' + binpath, args);
    spawn(binpath, args);
};

// list components
tron.listComponents = function(options) {
    var cfg = tron.loadConfig();
    if (!fs.existsSync(cfg.__pathToComponents)) {
        console.log('Component directory does not exist: ' +'./' + cfg["components"] );
        console.log('If you want to use a different directory, specify in the tron.json file at the root of your project');
        console.log(JSON.stringify(tron.defaultConfig, null, 2));
        return;
    }

    var comps = fs.readdirSync(cfg.__pathToComponents);
    comps.forEach( function(comp) {
        var result = tron.filterBy(comp, options, cfg);
        if (result) {
            console.log("Component: " + result.name)
            if (result.bower && result.bower.version) {
                console.log('   - version: ' + result.bower.version);
            }
            if (result.bower && result.bower.description) {
                console.log(result.bower.description);
            }
        }
    })
};

// filter component listing by options
tron.filterBy = function(comp, options, cfg) {

    // use bower.json to figure out if component has a polymer dependency
    var bower;

    if (cfg["use-bower-for-component-id"]) {
        if (fs.existsSync(cfg.__pathToComponents + '/' + comp + '/bower.json' )) {
            bower = JSON.parse(fs.readFileSync(cfg.__pathToComponents + '/' + comp + '/bower.json'));
            if (!bower.dependencies) {
                return;
            }
        } else {
            return;
        }
    }
    var prfx = comp.split('-')[0];
    if (options.prefixed) { // list only a certain prefix
        if (prfx == options.prefixed) {
            return {name: comp, bower: bower};
        } else { return; }
    } else {
        return {name: comp, bower: bower};
    }
};

tron.makeconfig = function(env, cfg) {
    if (!fs.existsSync('tron.json')) {
        fs.writeFileSync("tron.json", JSON.stringify(tron.defaultConfig, null, 2));
    } else {
        console.log('A Tron configuration file already exists for this project');
    }
};

tron.installelectron = function(env, cfg) {
    // download electron
    downloadelectron({
        version: cfg["electron-version"],
        outputDir: cfg["electron-directory"]
    }, function() {
        console.log("Downloaded Electron");
    });
};

tron.create = function(env, cfg) {
    tron.installelectron(env, cfg);

    // make application directory
    if (!fs.existsSync(process.cwd() + "/" + cfg["electron-app-directory"])) {
        fs.mkdirSync(process.cwd() + "/" +  cfg["electron-app-directory"])
    }

    // make component directory
    if (!fs.existsSync(process.cwd() + "/" + cfg["electron-app-directory"]  + "/" + cfg["components"])) {
        fs.mkdirSync(process.cwd() + "/" + cfg["electron-app-directory"] + "/" + cfg["components"])
    }

    // create bower file
    if (!fs.existsSync(process.cwd() + "/" + cfg["electron-app-directory"]  + "/" + cfg["components"])) {
        fs.mkdirSync(process.cwd() + "/" + cfg["electron-app-directory"] + "/" + cfg["components"])
    }

    // copy over starter files
    if (!fs.existsSync(process.cwd() + "/" + cfg["electron-app-directory"] + "/main.js")) {
        fsutils.copyFileSync(__dirname + "/../starterfiles/main.js", process.cwd() + "/" + cfg["electron-app-directory"] + "/main.js");
    } else {
        console.log("It looks like you already have a main.js file, so Tron won't replace it");
    }

    if (!fs.existsSync(process.cwd() + "/" + cfg["electron-app-directory"] + "/index.html")) {
        fsutils.copyFileSync(__dirname + "/../starterfiles/index.html", process.cwd() + "/" + cfg["electron-app-directory"] + "/index.html");
    } else {
        console.log("It looks like you already have an index.html file, so Tron won't replace it");
    }

    if (!fs.existsSync("./" + cfg["electron-app-directory"] + "/package.json")) {
        fsutils.copyFileSync(__dirname + "/../starterfiles/tron-package.json", process.cwd() + "/" + cfg["electron-app-directory"] + "/package.json");
    } else {
        console.log("It looks like you already have a package.json file for your app, so Tron won't replace it");
    }

    if (!fs.existsSync(process.cwd() + "/.bowerrc")) {
        fsutils.copyFileSync(__dirname + "/../starterfiles/.bowerrc", process.cwd() + "/.bowerrc");
    } else {
        console.log("It looks like you already have a .bowerrc file for your app, so Tron won't replace it");
    }

    var package = tron.loadCurrentDependencies("../starterfiles/rootproject-package.json", "./package.json");
    var bower = tron.loadCurrentDependencies("../starterfiles/bower.json", "./bower.json");
    package = tron.addDependencies(package, cfg["npm-dependencies"]);

    if (env) {
        bower.name = env;
        package.name = env;
    }

    tron.makeconfig(env);

    fs.writeFileSync("bower.json", JSON.stringify(bower, null, 2));
    fs.writeFileSync("package.json", JSON.stringify(package, null, 2));
    var npm = spawn("npm", ["install"]);
    npm.stdout.on('data', function (data) { console.log(" " + data); });
    npm.stderr.on('data', function (data) { console.log(" " + data); });
    npm.on('close', function (exitCode) {
        var bower = spawn("bower", ["install"]);
        bower.on('close', function(exitCode) {
           console.log("Setup finished. Try running your project - enter 'tron run'");
        });
        bower.stdout.on('data', function (data) { console.log(" " + data); });
        bower.stderr.on('data', function (data) { console.log(" " + data); });
    });

};

// load dependencies
tron.loadCurrentDependencies = function(src, dest) {
    var manifest;
    if (fs.existsSync(dest)) {
        manifest = fsutils.readJSONSync(dest);
    } else {
        manifest = fsutils.readJSONSync(__dirname + "/" + src);
    }
    return manifest;
};

// add dependencies to package (bower or package.json)
tron.addDependencies = function(manifest, dependenciesToAdd) {
    var currentDependencies = [];
    for (var c in manifest.dependencies) { currentDependencies.push(c); }
    for (var c in dependenciesToAdd) {
        if ( currentDependencies.indexOf(c) == -1 ) {
            manifest.dependencies[c] = dependenciesToAdd[c];
        }
    }
    return manifest;
};

module.exports = tron;