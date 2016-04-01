'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function TextBox(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.TextBox = TextBox;

var def = Component.of(TextBox, 'geldesk.ui');

TextBox.prototype.dock = def.PROP('dock');
TextBox.prototype.placeholder = def.PROP('placeholder');
TextBox.prototype.text = def.PROP('text');
TextBox.prototype.visible = def.PROP('visible');
