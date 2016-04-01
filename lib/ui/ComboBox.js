'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function ComboBox(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.ComboBox = ComboBox;

var def = Component.of(ComboBox, 'geldesk.ui');

ComboBox.prototype.dock = def.PROP('dock');
ComboBox.prototype.placeholder = def.PROP('placeholder');
ComboBox.prototype.text = def.PROP('text');
ComboBox.prototype.visible = def.PROP('visible');
