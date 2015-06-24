var fs = require('fs');
var fsutils = require('fs-utils');
var spawn = require('win-spawn');
var downloadatomshell = require('gulp-download-atom-shell');

posh = {};

posh.defaultConfig = {
    "root": ".",
    "application-main-page": "index.html",
    "components": "components",
    "atomshell-version": "0.28.3",
    "atomshell-directory": "binaries",
    "atomshell-app-directory": "app",
    "polymer-prefixes": ["core", "paper", "polymer", "platform", "font"],
    "polymer-demo-path": "demo/index.html",
    "bower-dependencies": {"posh-starter": "https://github.com/theposhery/posh-starter.git#v0.1"},
    "npm-dependencies": {"posh": "git+https://github.com/bengfarrell/posh.git#master"},
    "use-bower-for-component-id": true
};

// load configuration
posh.loadConfig = function() {
    var config;
    if (fs.existsSync('./.posh')) {
        config = JSON.parse(fs.readFileSync(cfg["root"] + '/.posh', 'utf8'));
    } else {
        config = {};
    }

    for (var c in posh.defaultConfig) {
        if (!config[c]) {
            config[c] = posh.defaultConfig[c];
        }
    }

    config.__pathToComponents = config["root"] + "/" + config["atomshell-app-directory"] + "/" + config["components"]
    return config;
};

posh.getVersion = function() {
    var pkg = JSON.parse(fs.readFileSync(__dirname + "/../package.json", 'utf8'));
    console.log('Posh v' + pkg.version);
};

posh.runProject = function(html, options) {
    var cfg = posh.loadConfig();

    // Atom-Shell bin path
    var myOS = require('os').platform();
    var binpath = 'binaries/atom';
    if (myOS.substr(0,3) == "win") { binpath = 'binaries\\atom.exe'; }
    if (myOS.substr(0,6) == "darwin") { binpath = 'binaries/Atom.app/Contents/MacOS/Atom'; }

    if (html) {
        cfg["application-main-page"] = html;
    }
    var args = [cfg["atomshell-app-directory"], 'html:' + cfg["root"] + "/" + cfg["atomshell-app-directory"] + "/" + cfg["application-main-page"]];

    if (options.debug) { args.push('debug:' + options.debug ); }
    if (options.fullscreen) { args.push('fullscreen:' + options.fullscreen ); }
    spawn(binpath, args);
};

// run component
posh.runComponent = function(comp, options) {
    var cfg = posh.loadConfig();
    if (!fs.existsSync(cfg.__pathToComponents)) {
        console.log('Component directory does not exist: ' + cfg.__pathToComponents );
        console.log('If you want to use a different directory, specify in the .posh file at the root of your project');
        console.log(JSON.stringify(posh.defaultConfig, null, 2));
        return;
    }

    // Atom-Shell bin path
    var myOS = require('os').platform();
    var binpath = 'binaries/atom';
    if (myOS.substr(0,3) == "win") { binpath = 'binaries\\atom.exe'; }
    if (myOS.substr(0,6) == "darwin") { binpath = 'binaries/Atom.app/Contents/MacOS/Atom'; }

    var args = [cfg["atomshell-app-directory"], 'html:' + cfg.__pathToComponents + '/' + comp + '/' + cfg["polymer-demo-path"]];

    if (options.debug) { args.push('debug:' + options.debug ); }
    if (options.fullscreen) { args.push('fullscreen:' + options.fullscreen ); }

    spawn(binpath, args);
};

// list components
posh.listComponents = function(options) {
    var cfg = posh.loadConfig();
    if (!fs.existsSync(cfg.__pathToComponents)) {
        console.log('Component directory does not exist: ' + cfg["root"] + '/' + cfg["components"] );
        console.log('If you want to use a different directory, specify in the .posh file at the root of your project');
        console.log(JSON.stringify(posh.defaultConfig, null, 2));
        return;
    }

    var comps = fs.readdirSync(cfg.__pathToComponents);
    comps.forEach( function(comp) {
        var result = posh.filterBy(comp, options, cfg);
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
posh.filterBy = function(comp, options, cfg) {

    // use bower.json to figure out if component has a polymer dependency
    var bower;

    if (cfg["use-bower-for-component-id"]) {
        if (fs.existsSync(cfg.__pathToComponents + '/' + comp + '/bower.json' )) {
            bower = JSON.parse(fs.readFileSync(cfg.__pathToComponents + '/' + comp + '/bower.json'));
            if (!bower.dependencies || !bower.dependencies.polymer) {
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

posh.installatom = function(env, cfg) {
    // download atom shell
    downloadatomshell({
        version: cfg["atomshell-version"],
        outputDir: cfg["atomshell-directory"]
    }, function() {
        console.log("Downloaded Atom-Shell");
    });
};

posh.create = function(env, cfg) {

    posh.installatom(env, cfg);

    // make application directory
    if (!fs.existsSync(process.cwd() + "/" + cfg["atomshell-app-directory"])) {
        fs.mkdirSync(process.cwd() + "/" +  cfg["atomshell-app-directory"])
    }

    // make component directory
    if (!fs.existsSync(process.cwd() + "/" + cfg["atomshell-app-directory"]  + "/" + cfg["components"])) {
        fs.mkdirSync(process.cwd() + "/" + cfg["atomshell-app-directory"] + "/" + cfg["components"])
    }

    // create bower file
    if (!fs.existsSync(process.cwd() + "/" + cfg["atomshell-app-directory"]  + "/" + cfg["components"])) {
        fs.mkdirSync(process.cwd() + "/" + cfg["atomshell-app-directory"] + "/" + cfg["components"])
    }

    // copy over starter files
    if (!fs.existsSync(process.cwd() + "/" + cfg["atomshell-app-directory"] + "/main.js")) {
        fsutils.copyFileSync(__dirname + "/../starterfiles/main.js", process.cwd() + "/" + cfg["atomshell-app-directory"] + "/main.js");
    } else {
        console.log("It looks like you already have a main.js file, so Posh won't replace it");
    }

    if (!fs.existsSync("./" + cfg["atomshell-app-directory"] + "/package.json")) {
        fsutils.copyFileSync(__dirname + "/../starterfiles/atom-package.json", process.cwd() + "/" + cfg["atomshell-app-directory"] + "/package.json");
    } else {
        console.log("It looks like you already have a package.json file for your app, so Posh won't replace it");
    }

    if (!fs.existsSync(process.cwd() + "/.bowerrc")) {
        fsutils.copyFileSync(__dirname + "/../starterfiles/.bowerrc", process.cwd() + "/.bowerrc");
    } else {
        console.log("It looks like you already have a .bowerrc file for your app, so Posh won't replace it");
    }

    var package = posh.loadCurrentDependencies("../starterfiles/rootproject-package.json", "./package.json");
    var bower = posh.loadCurrentDependencies("../starterfiles/bower.json", "./bower.json");
    bower = posh.addDependencies(bower, cfg["bower-dependencies"]);
    package = posh.addDependencies(package, cfg["npm-dependencies"]);

    if (env) {
        bower.name = env;
        package.name = env;
    }

    fs.writeFileSync("bower.json", JSON.stringify(bower, null, 2));
    fs.writeFileSync("package.json", JSON.stringify(package, null, 2));
    var npm = spawn("npm", ["install"]);
    npm.stdout.on('data', function (data) { console.log(" " + data); });
    npm.stderr.on('data', function (data) { console.log(" " + data); });
    npm.on('close', function (exitCode) {
        var bower = spawn("bower", ["install"]);
        bower.on('close', function(exitCode) {
           console.log("Setup finished. Try your first component - enter 'posh comp posh-starter'");
        });
        bower.stdout.on('data', function (data) { console.log(" " + data); });
        bower.stderr.on('data', function (data) { console.log(" " + data); });
    });

};

// load dependencies
posh.loadCurrentDependencies = function(src, dest) {
    var manifest;
    if (fs.existsSync(dest)) {
        manifest = fsutils.readJSONSync(dest);
    } else {
        manifest = fsutils.readJSONSync(__dirname + "/" + src);
    }
    return manifest;
};

// add dependencies to package (bower or package.json)
posh.addDependencies = function(manifest, dependenciesToAdd) {
    var currentDependencies = [];
    for (var c in manifest.dependencies) { currentDependencies.push(c); }
    for (var c in dependenciesToAdd) {
        if ( currentDependencies.indexOf(c) == -1 ) {
            manifest.dependencies[c] = dependenciesToAdd[c];
        }
    }
    return manifest;
};

module.exports = posh;