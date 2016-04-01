'use strict';
var sys = {
  events: require('events')
};
var core = require('../core.js');
var geldesk = require('../index.js');
var EventEmitter = sys.events.EventEmitter;
var Promise = geldesk.Promise;
var flattenError = geldesk.rpc.flattenError;
var expandError = geldesk.rpc.expandError;

/** Maximum request id value (9007199254740991) */
var MAX_REQUEST_ID = Number.MAX_SAFE_INTEGER;

function Connection(app, opts) {
  opts = opts || {};
  this.app = app;
  this.callbacks = {};
  this.router = app.router;
  this.channel = opts.channel || new geldesk.rpc.StdioChannel();
  this.events = new EventEmitter();
  this.isOpen = false;
  this.sentPendingResponse = {};
  this.sentRequestCount = 0;
  this.handlers = {
    receive: this.receive.bind(this)
  };
  this.channel.on('data', this.handlers.receive);
}
geldesk.rpc.Connection = Connection;

// #region Events
Connection.prototype.on = function(event, listener) {
  this.events.on(event, listener);
  return this;
};

Connection.prototype.removeListener = function(event, listener) {
  this.events.removeListener(event, listener);
  return this;
};
// #endregion

// #region Open, Close
Connection.prototype.open = Promise.method(function() {
  var self = this;
  return this.channel.open().then(function() {
    self.isOpen = true;
  });
});
// #endregion

// #region Receive
Connection.prototype.parseLine = function(line) {
  var frame = [];
  try {
    frame = JSON.parse(line);
  } catch(ex) {
    ex.line = line;
    frame.err = ex;
  }
  if (!frame.length && !frame.err) {
    frame.err = new Error('Empty frame.');
    frame.err.line = line;
  }
  return frame;
};

Connection.prototype.receive = function(line) {
  var frame = this.parseLine(line);
  if (frame.err) {
    this.events.emit('error', frame.err);
    return;
  }
  var message = {
    line: line,
    requestId: frame.pop(),
    args: frame.pop(),
    path: frame.pop(),
    cb: null,
    hasCb: false,
    hasPath: false
  };
  message.hasCb = message.requestId > 0;
  message.hasPath = typeof message.path === 'string';
  if (message.hasPath)
    this.receiveRequest(message);
  else
    this.receiveResponse(message);
};

Connection.prototype.receiveRequest = function(message) {
  var conn = this;
  var router = this.router;
  var calledBack = 0;
  if (message.hasCb)
      message.cb = requestCallback;
  // Route Request
  try {
    router.route(message);
  } catch(reqErr) {
    // Unhandled Request Error
    if (message.hasCb)
      message.cb(reqErr);
    else
      this.events.emit('error', reqErr);
  }
  // Callback
  function requestCallback() {
    if (calledBack++)
        return;
    // Respond
    var args = Array.prototype.slice.call(arguments);
    if (args[0])
      args[0] = flattenError(args[0]);
    conn.respond(message.requestId, args);
  }
};

Connection.prototype.receiveResponse = function(message) {
  var cb;
  var recvErr;
  if (message.args[0])
    message.args[0] = expandError(message.args[0]);
  // Call Back
  if (message.hasCb) {
    cb = this.callbacks[message.requestId];
    message.hasCb = cb ? true : false;
  }
  if (message.hasCb) {
    delete this.callbacks[message.requestId];
    cb.apply(null, message.args);
    return;
  }
  // Error Notification Or Missing Callback
  recvErr = message.args[0] && message.args[0] instanceof Error ? 
      message.args[0] :
      new Error('Callback not found: ' + message.requestId);
  this.events.emit('error', recvErr);
};
// #endregion

// #region Notify, Request, Respond
Connection.prototype.notify = function(path, args) {
  if (typeof path !== 'string')
    throw new Error('path must be a string.');
  if (!args)
    args = [];
  return this.send([path, args, -1]);
};

Connection.prototype.notifyErr = function(err) {
  return this.send([[err], -1]);
};

Connection.prototype.request = Promise.promisify(Connection_sendRequest);

Connection.prototype.respond = function(requestId, args) {
  if (!args)
    args = [];
  return this.send([args, requestId]);
};
// #endregion

Connection.prototype.send = function(frame) {
  var data = JSON.stringify(frame);
  return this.channel.write(data);
};

function Connection_sendRequest(path, args, cb) {
  var requestId = -1;
  if (typeof path !== 'string')
    throw new Error('path must be a string.');
  if (!args)
    args = [];
  else if(typeof args === 'function') {
    cb = args;
    args = [];
  }
  if (cb) {
    requestId = ++this.sentRequestCount;
    this.callbacks[requestId] = cb;
    if (requestId === MAX_REQUEST_ID)
      this.sentRequestCount = 0;
  }
  return this.send([path, args, requestId]);
}
Connection.prototype.sendRequest = Connection_sendRequest;