'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function StatusItem(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.StatusItem = StatusItem;

var def = Component.of(StatusItem, 'geldesk.ui');

StatusItem.prototype.text = def.PROP('text');
StatusItem.prototype.type = def.PROP('type', 'label');
StatusItem.prototype.visible = def.PROP('visible');
