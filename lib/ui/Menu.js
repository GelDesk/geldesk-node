'use strict';

var lodash = require('lodash');
var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function Menu(name, props) {
  props = Component.init(this, name, props);
}
geldesk.ui.Menu = Menu;

var def = Component.of(Menu, 'geldesk.ui', {
  defaultChildType: 'geldesk.ui.MenuItem'
});

def
.EVENT('closed')
.EVENT('opened');

Menu.prototype.bind = def.PROP('bind');
Menu.prototype.text = def.PROP('text');
Menu.prototype.visible = def.PROP('visible');



//
//// Disabled code to hook post-component-added to parent:
//
//Menu.prototype._componentOnAdded = function (parent) {
//  var bindPath = this._bind;
//  if (!bindPath)
//    return;
//  bindCommandSet(this, parent, bindPath);
//};
//
//// Disabled code to bind the menus on the client-side:
//
//function bindCommandSet(menu, parent, bindPath) {
//  var commandSet = Component.child(parent, bindPath);
//  if (!commandSet)
//    throw new Error('Could not bind to CommandSet: ' + bindPath);
//  createSubMenusFromCommandSet(menu, commandSet);
//}

//function createSubMenuFromCommandSet(commandSet) {
//  var MenuItem = geldesk.ui.MenuItem;
//  return new MenuItem(commandSet.name(), {
//    group: commandSet.group(),
//    text: commandSet.text()
//  });
//}

//function createSubMenuItemsFromCommandItems(parentMenuItem, commandSet) {
//  var MenuItem = geldesk.ui.MenuItem;
//  lodash.forEach(commandSet.items(), function(commandItem, idx) {
//    var menuItem = new MenuItem(commandItem.id, {
//      group: commandItem.group,
//      text: commandItem.text
//    });
//    Component.add(parentMenuItem, menuItem);
//  });
//}

//function createSubMenusFromCommandSet(parentMenu, commandSet) {
//  lodash.forEach(commandSet._componentChildren, function(child) {
//    var subMenu = createSubMenuFromCommandSet(child);
//    Component.add(parentMenu, subMenu);
//    createSubMenuItemsFromCommandItems(subMenu, child);
//    createSubMenusFromCommandSet(subMenu, child);
//  });
//}
