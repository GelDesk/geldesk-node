'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function Toolbar(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.Toolbar = Toolbar;

var def = Component.of(Toolbar, 'geldesk.ui', {
  defaultChildType: 'geldesk.ui.ToolItem'
});

Toolbar.prototype.visible = def.PROP('visible');
