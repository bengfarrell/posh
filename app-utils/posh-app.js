var poshapp = function() {
    var self = this;

    /** reference to main window */
    this.mainWindow = null;

    /** reference to native Atom-Shell app instance */
    this.application = null;

    /**
     * start the app
     */
    this.start = function() {
        var posh = require('../lib/posh.js');

        this.application = require('app');
        require('crash-reporter').start();

        this.application.on('window-all-closed', function() {
            if (process.platform != 'darwin')
                self.application.quit();
        });

        this.application.on('ready', function() {
            var cfg = new posh.config();
            self.mainWindow = new posh.windows().create(cfg);

            self.mainWindow.on('closed', function () {
                self.mainWindow = null;
            });
        });
    }

    this.start();
}

module.exports = poshapp;