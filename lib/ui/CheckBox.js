'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function CheckBox(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.CheckBox = CheckBox;

var def = Component.of(CheckBox, 'geldesk.ui');

CheckBox.prototype.dock = def.PROP('dock');
CheckBox.prototype.checked = def.PROP('checked');
CheckBox.prototype.text = def.PROP('text');
CheckBox.prototype.visible = def.PROP('visible');
