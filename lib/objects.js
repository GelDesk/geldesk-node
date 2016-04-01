'use strict';

var core = require('./core.js');
var geldesk = require('./index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

// #region ObjectSet
function ObjectSet(name, props, data) {
  props = 
  Component.init(this, name, props);
  this.root = data && data[0] && data[0][0] === 'root' ? 
    data[0][1] || {} : 
    {};
  this.controller = new ObjectSetController(this);
}
geldesk.ObjectSet = ObjectSet;

var def = Component.of(ObjectSet, 'geldesk', {
  createWithData: true,
  serializeData: serializeItemData
});

function serializeItemData(objectSet) {
  var data = [];
  var root = objectSet.root;
  data.push(['root', root]);
  return data;
}

// #endregion

// #region Controller
function ObjectSetController(component) {
  this.component = component;
  this.events = component._componentEvents;
}
// #endregion
