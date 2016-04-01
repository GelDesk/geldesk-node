'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

// #region Window
function Window(name, props) {
  props = 
  Component.init(this, name, props);
  this.controller = new WindowController(this);
}
geldesk.ui.Window = Window;

var def = Component.of(Window, 'geldesk.ui');
def
.EVENT('closed', true)
.EVENT('closing', true)
.EVENT('resized', false)
.EVENT('shown', true);

Window.prototype.startPosition = def.PROP('startPosition', 'center');
Window.prototype.title = def.PROP('title');
Window.prototype.visible = def.PROP('visible');

Window.prototype.close = function Window_close() {
  return Component.request(this, 'close');
};

Window.prototype.show = function Window_show() {
  var self = this;
  self.visible(true);
  if (!this._componentLoaded)
    return Component.load(self);
  return Component.request(self, 'show');
};
// #endregion

// #region WindowController
function WindowController(component) {
  this.component = component;
  this.events = component._componentEvents;
}

WindowController.prototype.closed = function() {
  this.events.emit('closed');
};

WindowController.prototype.closing = function() {
  // TODO: Add a hook to dynamically decide if the window should be closed or 
  // if something else (i.e. confirm("Do you want to save?") ...)
  this.component.close();
};

WindowController.prototype.resized = function() {
  this.events.emit('resized');
};

WindowController.prototype.shown = function() {
  this.events.emit('shown');
};
// #endregion
