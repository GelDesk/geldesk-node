'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function Statusbar(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.Statusbar = Statusbar;

var def = Component.of(Statusbar, 'geldesk.ui', {
  defaultChildType: 'geldesk.ui.StatusItem'
});

Statusbar.prototype.visible = def.PROP('visible');
