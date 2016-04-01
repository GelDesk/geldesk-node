'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function Button(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.Button = Button;

var def = Component.of(Button, 'geldesk.ui');

Button.prototype.bind = def.PROP('bind');
Button.prototype.dock = def.PROP('dock');
Button.prototype.enabled = def.PROP('enabled');
Button.prototype.text = def.PROP('text');
Button.prototype.visible = def.PROP('visible');
