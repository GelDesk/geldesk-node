'use strict';
var sys = {
  events: require('events'),
  os: require('os'),
  process: process
};
var core = require('../core.js');
var geldesk = require('../index.js');
var EventEmitter = sys.events.EventEmitter;
var Promise = geldesk.Promise;

var EOL = sys.os.EOL;
var ENCODING = 'utf8';
var RPC_PREFIX = '@geldesk:';

function StdioChannel(opts) {
  opts = opts || {};
  this.stdin = opts.stdin || process.stdin;
  this.stdout = opts.stdout || process.stdout;
  this.isLocalStdio = (!opts.stdin);
  this.events = new EventEmitter();
  this.handlers = {
    onDataStdin: this.handleDataStdin.bind(this)
  };
  this.isOpen = false;
  this.incomingLine = '';
}
geldesk.rpc.StdioChannel = StdioChannel;

StdioChannel.prototype.close = Promise.method(function() {
  if (!this.isOpen)
    return true;
  
  this.isOpen = false;
  this.stdin.pause();
  this.stdin.removeListener('data', this.handlers.onDataStdin);
  
  this.events.emit('closed', this, true);
  return true;
});

StdioChannel.prototype.handleDataStdin = function(data) {
  if (!this.isOpen)
    return;
  var lines = (this.incomingLine + data).split(EOL);
  var line;
  this.incomingLine = lines.pop();
  while(lines.length) {
    line = lines.shift();
    if (!line.startsWith(RPC_PREFIX)) {
      this.events.emit('info', line);
      continue;
    }
    line = line.substr(RPC_PREFIX.length);
    this.events.emit('data', line);
  }
};

StdioChannel.prototype.on = function(event, listener) {
  this.events.on(event, listener);
  return this;
};

StdioChannel.prototype.open = Promise.method(function() {
  if (this.isOpen)
    return true;
  try {
    this.isOpen = true;
    this.stdin.on('data', this.handlers.onDataStdin);
    //this.stdin.resume();
  } catch(ex) {
    this.isOpen = false;
    this.stdin.pause();
    this.stdin.removeListener('data', this.handlers.onDataStdin);
    throw ex;
  }
  this.events.emit('opened', this, true);
  return true;
});

StdioChannel.prototype.removeListener = function(event, listener) {
  this.events.removeListener(event, listener);
  return this;
};

StdioChannel.prototype.write = function(data) {
  if (!this.isOpen)
    return false;
  data = RPC_PREFIX + data + EOL;
  this.stdout.write(data, ENCODING);
  return true;
};
