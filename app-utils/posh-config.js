var poshcfg = function() {
    var self = this;

    /** app defaults */
    this.html = 'index.html';
    this.debug = false;
    this.frame = true;
    this.fullscreen = false;
    this.verbose = true;
    /*******************/

    /**
     * apply args from CLI
     */
    this.load = function() {
        process.argv.forEach(function (arg) {
            var key = arg.split(':')[0];
            var value = arg.split(':')[1];

            if (value != "undefined" && value != undefined && value) {
                self[key] = value;
                if (key == "debug" || key == "frame" || key == "fullscreen") {
                    self.debug = (self.debug == "true") ? true : false;
                    self.frame = (self.frame == "false") ? false : true;
                    self.fullscreen = (self.fullscreen == "true") ? true : false;
                }

                if (self.verbose) {
                    console.log("Setting config." + key + " to " + value);
                }
            }
        });
    }

    this.load();
    console.log(this.html)
}

module.exports = poshcfg;