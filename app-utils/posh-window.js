var BrowserWindow = require('browser-window');

var poshwin = function() {
    /**
     * create new window
     */
    this.create(cfg) {
        var window = new BrowserWindow({frame: cfg.frame, fullscreen: cfg.fullscreen});
        window.loadUrl('file://' + __dirname + '/' + cfg.html);
        if (cfg) { window.openDevTools(); }
        return window;
    }
}

module.exports = poshwin;