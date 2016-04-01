'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function ToolItem(name, props) {
  props = 
  Component.init(this, name, props);
  this.controller = new ToolItemController(this._componentEvents);
}
geldesk.ui.ToolItem = ToolItem;

var def = Component.of(ToolItem, 'geldesk.ui', {
  defaultChildType: 'geldesk.ui.ToolItem'
});

def
.EVENT('clicked');

ToolItem.prototype.bind = def.PROP('bind');
ToolItem.prototype.text = def.PROP('text');
ToolItem.prototype.type = def.PROP('type', 'button');
ToolItem.prototype.visible = def.PROP('visible');

ToolItem.prototype._componentOnChildAdd = function(child) {
  this.type('dropdown');
};

function ToolItemController(events) {
  this.events = events;
}

ToolItemController.prototype.clicked = function() {
  this.events.emit('clicked');
};
