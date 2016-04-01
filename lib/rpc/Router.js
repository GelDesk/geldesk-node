'use strict';

var core = require('../core.js');
var geldesk = require('../index.js');

function Router(app) {
  this.app = app;
  this.controllers = {};
}
geldesk.rpc.Router = Router;

Router.prototype.addController = function(name, controller) {
  this.controllers[name] = controller;
  return this;
};

Router.prototype.removeController = function(name) {
  delete this.controllers[name];
  return this;
};

Router.prototype.route = function(message) {
  var routeData = this.createRouteData(message.path);
  this.locateTarget(routeData);
  if (routeData.error)
    throw routeData.error;
  var target = routeData.target;
  var action = routeData.action;
  if (message.hasCb)
    action.apply(target, [].concat(message.args, message.cb));
  else
    action.apply(target, message.args);
};

Router.prototype.createRouteData = function(path) {
  var pathItems = ('' + path).split('/');
  var routeData = {
    action: null,
    actionName: pathItems.pop(),
    error: null,
    fullPath: path,
    target: null,
    targetPath: '',
    targetPathItems: pathItems
  };
  routeData.targetPath = pathItems.join('/');
  return routeData;
};

Router.prototype.locateTarget = function(routeData) {
  var path = routeData.targetPathItems;
  var len = path.length;
  var obj;
  if (len > 0) {
    obj = this.controllers[path[0]];
    for (var i = 1; i < len; i++)
      obj = obj._componentChild[path[i]];
    // If we got a component, then the target is it's controller. Otherwise, 
    // obj is already a controller.
    routeData.target = obj.controller || obj;
  }
  if (!routeData.target) {
    routeData.error = new Error('target not found: ' + routeData.fullPath);
    return;
  }
  routeData.action = routeData.target[routeData.actionName];
  if (typeof routeData.action !== 'function') {
    routeData.error = new Error('method not found: ' + routeData.fullPath);
  }
};
