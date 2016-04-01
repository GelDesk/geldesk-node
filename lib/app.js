'use strict';

var core = require('./core.js');
var geldesk = require('./index.js');
var Promise = geldesk.Promise;

var app;

// CONSIDER: For data binding, we're going to support three different data 
// component types: CommandModel, ObjectModel and TableModel. Other components 
// will be able to bind to data elements via one of these model component 
// types.
//
// CommandModel will be a flat collection of command elements that components 
// like MenuItem or ToolItem can bind to. (Each command should NOT be a 
// component, but rather an addressable element that the CommandModel 
// component contains and allows access to. The same goes for TableModel and 
// ObjectModel but with Tables/Rows and Objects/Values.)
//
// ObjectModel will be a single JSON-like {object} that has a collection of 
// properties, that can each be an object, array or primitive value. This will 
// be addressable via something like JSONPath.
//
// TableModel will be a flat collection of tables with columns and rows like a 
// model of a standard RDBMS entity table. 
//

function createAppContainer() {
  var Component = geldesk.Component;
  var ComponentManager = geldesk.ComponentManager;
  var ProcessManager = geldesk.ProcessManager;
  var Router = geldesk.rpc.Router;

  app = {};

  // Primary Components
  app.router = new Router(app);
  app.component = new ComponentManager(app);
  app.process = new ProcessManager(app);

  // Startup Method
  app.start = start(app);
}

function getOrCreateAppContainer() {
  if (!app)
    createAppContainer();
  return app;
}
geldesk.app = getOrCreateAppContainer;

function start(app) {
  return Promise.method(function app_start() {
    console.log('Running...');
    if (app.process.connection.channel.isLocalStdio) {
      return app.process.connect();
    }
  });
}
