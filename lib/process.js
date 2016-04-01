'use strict';

var core = require('./core.js');
var geldesk = require('./index.js');
var Promise = geldesk.Promise;

// TODO: There are now going to be multiple processes in order to show a 
// window in it's own process if the developer wants. So take all single-
// process code out of ProcessManager and put it into a new ProcessClient 
// class.

function ProcessManager(app, opts) {
  opts = opts || {};
  this.app = app;
  this.connection = opts.connection || new geldesk.rpc.Connection(app);
  this.controller = new ProcessController(this);
  this.app.router.addController('process', this.controller);
}
geldesk.ProcessManager = ProcessManager;

ProcessManager.prototype.connect = function () {
  var self = this;
  // TODO: If debugging, give 30 seconds for the developer to attach.
  var timeout = true ? 30720 : 2048;
  return new Promise(function(resolve, reject) {
    self.controller.resolveOnConnected = resolve;
    self.connection.open().then(function() {
      console.log('connection opened');
    });
  }).timeout(timeout, 'connection timed out.');
};

ProcessManager.prototype.quit = Promise.method(function () {
  console.log('Quitting...');
  this.connection.notify('process/quit');
});

function ProcessController(client) { }

ProcessController.prototype.shutdown = function() {
  process.exit();
};

ProcessController.prototype.connected = function() {
  var resolveOnConnected = this.resolveOnConnected;
  if (resolveOnConnected) {
    delete this.resolveOnConnected;
    resolveOnConnected();
  }
};
