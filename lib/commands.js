'use strict';

var core = require('./core.js');
var geldesk = require('./index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

// #region CommandSet
function CommandSet(name, props, data) {
  props = 
  Component.init(this, name, props);
  this.item = {};
  this.items = [];
  this.controller = new CommandSetController(this);
  createCommandItems(this, data);
}
geldesk.CommandSet = CommandSet;

var def = Component.of(CommandSet, 'geldesk', {
  createWithData: true,
  serializeData: serializeItemData
});

def.EVENT('exec', true);
// #endregion

// #region Controller
function CommandSetController(component) {
  this.component = component;
  this.events = component._componentEvents;
}

CommandSetController.prototype.exec = function(itemPath) {
  this.events.emit('exec', itemPath);
  // TODO: Find the item and let it emit the event.
};
// #endregion

// #region CommandItem
function CommandItem(data, group) {
  data = data || [];
  this.id = data[0] || '';
  var props = data[1] || {};
  this.enabled = props.enabled === undefined ? true : 
    props.enabled ? true : false;
  this.group = props.group || group || '';
  this.text = props.text || '';
  if (data.length > 2) {
    this.items = [];
    this.item = {};
    createCommandItems(this, data, 2);
  } else {
    this.items = null;
    this.item = null;
  }
}
geldesk.CommandItem = CommandItem;

function serializeItemData(commandSet) {
  var data = [];
  var items = commandSet.items;
  var len = items.length;
  var opts = {
    skipDefaults: !commandSet._componentLoaded
  };
  for (var i = 0; i < len; i++)
    data.push(serializeItem(items[i], opts));
  return data;
}

function serializeItem(item, opts) {
  // Properties
  var skipDefaults = opts.skipDefaults || false;
  var props = {};
  if (!(skipDefaults && item.enabled === true))
    props.enabled = item.enabled;
  if (!(skipDefaults && item.group === ''))
    props.group = item.group;
  if (!(skipDefaults && item.text === ''))
    props.text = item.text;
  // Sub Items?
  var items = item.items;
  if (!items)
    return [item.id, props];
  var data = [];
  var len = items.length;
  for (var i = 0; i < len; i++)
    data.push(serializeItem(items[i], opts));
  return [item.id, props].concat(data);
}

function createCommandItems(parent, data, start) {
  if (!data)
    return;
  start = start || 0;
  var len = data.length;
  var group;
  for (var i = start; i < len; i++) {
    var newItem = new CommandItem(data[i], group);
    group = newItem.group;
    parent.items.push(newItem);
    parent.item[newItem.id] = newItem;
  }
}
// #endregion
