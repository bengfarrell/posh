var app = require('app');  // Module to control application life.
var path = require('path');
var BrowserWindow = require('browser-window');  // Module to create native browser window.

require('crash-reporter').start();

var mainWindow = null;

app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    global['config'] = {
        html: 'index.html',
        debug: false,
        slide: 1,
        frame: true,
        fullscreen: false
    }

    process.argv.forEach(function (arg) {
        var key = arg.split(':')[0];
        var value = arg.split(':')[1];

        if (value != "undefined" && value != undefined && value) {
            global['config'][key] = value;
            if (key == "debug" || key == "frame" || key == "fullscreen") {
                global['config'].debug = (global['config'].debug == "true") ? true : false;
                global['config'].frame = (global['config'].frame == "true") ? true : false;
                global['config'].fullscreen = (global['config'].fullscreen == "true") ? true : false;
            }
            console.log("Setting config." + key + " to " + value);
        }
    });


    // Create the browser window.
    mainWindow = new BrowserWindow({frame: global['config'].frame, fullscreen: global['config'].fullscreen});

    var ipc = require('ipc');
    ipc.on('keyboardEvent', function (event, arg) {
        switch (arg.key) {
            case "S":
                secondaryWindow = new BrowserWindow({width: 800, height: 600});
                secondaryWindow.loadUrl('file://' + __dirname + '/stats.html');
                secondaryWindow.on('closed', function () {
                    secondaryWindow = null;
                });
                break;
            case "O":
                secondaryWindow = new BrowserWindow({width: 800, height: 600});
                secondaryWindow.loadUrl('file://' + __dirname + '/opencvdemo.html');
                secondaryWindow.on('closed', function () {
                    secondaryWindow = null;
                });
                break;
            case "D":
                if (arg.window == "main") {
                    mainWindow.openDevTools();
                } else {
                    secondaryWindow.openDevTools();
                }
                break;

            case "X":
                mainWindow.webContents.send('appClosed');
                mainWindow.close();
                if (secondaryWindow) {
                    secondaryWindow.close();
                }
                break;
        }
    });

    mainWindow.loadUrl('file://' + __dirname + '/' + global['config'].html);

    if (global['config'].debug) {
        mainWindow.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});