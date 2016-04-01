'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function TreeView(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.TreeView = TreeView;

var def = Component.of(TreeView, 'geldesk.ui');

TreeView.prototype.dock = def.PROP('dock');
TreeView.prototype.nodes = def.PROP('nodes');
TreeView.prototype.visible = def.PROP('visible');
