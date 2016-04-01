'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function Panel(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.Panel = Panel;

var def = Component.of(Panel, 'geldesk.ui');

Panel.prototype.dock = def.PROP('dock');
Panel.prototype.visible = def.PROP('visible');
