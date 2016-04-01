'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');
var Component = geldesk.Component;
var Promise = geldesk.Promise;

function DataGrid(name, props) {
  props = 
  Component.init(this, name, props);
}
geldesk.ui.DataGrid = DataGrid;

var def = Component.of(DataGrid, 'geldesk.ui');

DataGrid.prototype.dock = def.PROP('dock');
DataGrid.prototype.nodes = def.PROP('columns');
DataGrid.prototype.visible = def.PROP('visible');
