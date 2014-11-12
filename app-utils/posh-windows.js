var BrowserWindow = require('browser-window');

var poshwin = function() {
    /**
     * create new window
     */
    this.create = function(cfg) {
        var window = new BrowserWindow({frame: cfg.frame, fullscreen: cfg.fullscreen});
        window.loadUrl('file://' + process.cwd() + '/' + cfg.html);
        if (cfg.debug) { window.openDevTools(); }
        return window;
    }
}

module.exports = poshwin;