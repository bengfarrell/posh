var troncfg = function() {
  var self = this;

  /** app defaults */
  this.html = 'index.html';
  this.debug = false;
  this.frame = true;
  this.fullscreen = false;
  this.verbose = true;
  /*******************/

  this.options = { 'debug': { flags: [ 'd', 'debug', 'D'], type: 'boolean' },
    'html': { flags: ['html'], type: 'string' } };

  /**
   * apply args from CLI
   */
  this.load = function() {
    process.argv.forEach(function (arg) {
      var key = arg.split(':')[0];
      var value = arg.split(':')[1];

      if (value != "undefined" && value != undefined && value) {
        for (var c in self.options) {
          if (self.options[c].flags.indexOf(key) != -1) {
            if (self.options[c].type === 'boolean') {
              value = self.argToBoolean(value);
            }
            self[key] = value;
            console.log("Setting config." + key + " to " + value);
          }
        }
      }
    });
  };

  /**
   * simple arg to boolean conversion
   * @param arg
   * @returns {boolean}
   */
  this.argToBoolean = function(arg) {
    return (arg == "true") ? true : false;
  };

  this.load();
}

module.exports = troncfg;
