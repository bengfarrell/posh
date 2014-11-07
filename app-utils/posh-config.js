var poshcfg = function() {
    /** app defaults */
    this.html = 'index.html';
    this.debug = false;
    this.frame = true;
    this.fullscreen = false;

    /**
     * apply args from CLI
     */
    this.applyArgsToConfig = function() {
        process.argv.forEach(function (arg) {
            var key = arg.split(':')[0];
            var value = arg.split(':')[1];

            if (value != "undefined" && value != undefined && value) {
                this[key] = value;
                if (key == "debug" || key == "frame" || key == "fullscreen") {
                    this.debug = (this.debug == "true") ? true : false;
                    this.frame = (this.frame == "true") ? true : false;
                    this.fullscreen = (this.fullscreen == "true") ? true : false;
                }

                if (verbose) {
                    console.log("Setting config." + key + " to " + value);
                }
            }
        });
    }
}

module.exports = poshcfg;