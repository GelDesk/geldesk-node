'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function MenuItem(name, props) {
  props = 
  Component.init(this, name, props);
  this.controller = new MenuItemController(this._componentEvents);
}
geldesk.ui.MenuItem = MenuItem;

var def = Component.of(MenuItem, 'geldesk.ui', {
  defaultChildType: 'geldesk.ui.MenuItem'
});

def
.EVENT('clicked');

MenuItem.prototype.group = def.PROP('group', '');
MenuItem.prototype.text = def.PROP('text');
MenuItem.prototype.type = def.PROP('type', 'normal');
MenuItem.prototype.visible = def.PROP('visible');

MenuItem.prototype._componentOnChildAdd = function(child) {
  this.type('submenu');
};

function MenuItemController(events) {
  this.events = events;
}

MenuItemController.prototype.clicked = function() {
  this.events.emit('clicked');
};
