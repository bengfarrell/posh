var fs = require('fs');
var spawn = require('child_process').spawn;

posh = {};

posh.defaultConfig = {
    "root": ".",
    "components": "components",
    "atomshell-version": "0.16.2",
    "atomshell-directory": "binaries",
    "atomshell-app-directory": "app",
    "polymer-prefixes": ["core", "paper", "polymer", "platform", "font"],
    "polymer-demo-path": "demo.html",
    "use-bower-for-component-id": true
}

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
}

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
    spawn(binpath, args);
}

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
}

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
}

module.exports = posh;