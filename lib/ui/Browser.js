'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function Browser(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.Browser = Browser;

var def = Component.of(Browser, 'geldesk.ui');

Browser.prototype.dock = def.PROP('dock', 'fill');
Browser.prototype.url = def.PROP('url', 'about:blank');
Browser.prototype.visible = def.PROP('visible');
