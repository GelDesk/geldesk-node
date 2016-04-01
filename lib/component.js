'use strict';

var path = require('path');
var util = require('util');
var lodash = require('lodash');
var core = require('./core.js');
var geldesk = require('./index.js');
var EventEmitter = require('events').EventEmitter;
var Promise = geldesk.Promise;
var hasOwnProp = Object.prototype.hasOwnProperty;

// #region Component
function Component() { /* see: Component.init */ }
geldesk.Component = Component;

// #region Static
/** Adds a child component to the given parent component. */
Component.add = function Component_add(parent, child) {
  // Pre-add Hook (parent, then child)
  if (typeof parent._componentOnChildAdd === 'function')
    if (parent._componentOnChildAdd(child) === false)
      return;
  if (typeof child._componentOnAdd === 'function')
    if (child._componentOnAdd(parent) === false)
      return;
  if (!(parent instanceof Component))
    throw new Error('Argument must be a Component type: parent');
  if (!(child instanceof Component))
    throw new Error('Argument must be a Component type: child');
  // Automatically remove the child from any existing parent.
  if (child._componentParent)
    Component.remove(child);
  // Child must have a name before it is attached.
  if (!child.name())
    child.name(Component.createName(child.constructor, parent));
  // Add
  parent._componentChild[child.name()] = child;
  parent._componentChildren.push(child);
  child._componentParent = parent;
  Component.drill(child, setComponentPath);
  // Post-add Hook (child, then parent)
  if (typeof child._componentOnAdded === 'function')
    child._componentOnAdded(parent);
  if (typeof parent._componentOnChildAdded === 'function')
    parent._componentOnChildAdded(child);
};
/** Builds a component from the given array data. */
Component.build = function Component_build(data, opts) {
  if (!data)
    throw new Error('Missing argument: data');
  var app = geldesk.app();
  opts = typeof opts === 'string' ? 
    {relativeTo: opts} : 
    opts || {};
  if (!lodash.isArray(data))
    data = [data];
  var info = buildComponentInfo(app, null, data, {
      relativeTo: opts.relativeTo
    });
  // Auto-name before creating the component if necessary.
  if (!info.name && !info.component) {
    info.name = Component.createName(info.typeDef.TypeConstructor);
  }
  var component = buildComponent(info);
  return component;
};
function buildComponent(info) {
  var component = info.component;
  if (component)
    return component;
  var TypeConstructor = info.typeDef.TypeConstructor;
  // NOTE: info.data will be undefined unless typeDef.createWithData == true.
  component = new TypeConstructor(info.name, info.props, info.data);
  var children = info.components;
  if (!children)
    return component;
  var child;
  for (var i = 0; i < info.components.length; i++) {
    child = buildComponent(children[i]);
    Component.add(component, child);
  }
  return component;
}
function buildComponentInfo(app, typeDefParent, data, opts) {
  if (data.length < 1)
    throw new Error('Invalid operation: no data.');
  // Is header a file?
  var header = '' + data[0];
  if (header.substr(0, 2) === './') {
    if (data.length !== 1)
      throw new Error('Invalid file reference: Too many elements.');
    header = path.join(opts.relativeTo || process.cwd(), header);
    data = require(header);
    // If the file didn't contain an data array then it must be a Component, 
    // so just return an info object that contains one component field.
    if (data && !lodash.isArray(data))
      return {component: data};
    // Create a NEW opts object in order to reset the relativeTo path, so that 
    // everything we load within it is relative to the header file's directory.
    opts = lodash.assign({}, opts);
    opts.relativeTo = path.dirname(header);
    header = '' + data[0];
  }
  // header is a string, e.g: 'instanceName:namespace.TypeName' where the 
  // instanceName, namespace AND TypeName are optional. So, you might have 
  // 'instanceName:ns.subns.TypeName', just 'instanceName' or no 
  // instanceName and just a TypeName (':TypeName'). A namespace should 
  // no appear without a TypeName.
  header = header.split(':');
  var nsType = Component.nsType(header[1] || '');
  if (!nsType.name && typeDefParent) {
    nsType = Component.nsType(typeDefParent.defaultChildType || '');
  }
  // Create info
  var info = {
    name: header[0] || '',
    type: nsType.name,
    props: data.length > 1 ? data[1] || {} : {},
    namespace: nsType.namespace
  };
  // Using namespaces
  var using = info.props.using;
  if (using) {
    delete info.props.using;
    using = [].concat(using, app.component.defaultNamespaces.concat);
  } else
    using = app.component.defaultNamespaces;
  var typeDef = buildTypeDefRequired(info.type, info.namespace, using);
  info.typeDef = typeDef;
  info.namespace = typeDef.namespace;
  // Child components or data
  if (data.length < 3)
    return info;
  if (typeDef.createWithData) {
    info.data = data.slice(2);
    return info;
  }
  var components = info.components = [];
  var child;
  for (var i = 2; i < data.length; i++) {
    child = buildComponentInfo(app, info.typeDef, data[i], opts);
    components.push(child);
  }
  return info;
}
/** Returns the specified typeDef or throws an error. */
function buildTypeDefRequired(typeName, namespaceName, usingNamespaces) {
  var typeDef;
  if (namespaceName)
    return Component.requireTypeDef(typeName, namespaceName);
  var len = usingNamespaces.length;
  for (var i = 0; i < len; i++) {
    typeDef = Component.getTypeDef(typeName, usingNamespaces[i]);
    if (typeDef)
      return typeDef;
  }
  throw new Error('Type not found: ' + typeName);
}
/** Returns a child or descendant component of the parent from the given 
 * pathOrName. */
Component.child = function Component_child(parent, pathOrName) {
  var obj = parent._componentChild[pathOrName];
  if (obj)
    return obj;
  var pathItems = String.prototype.split.call(pathOrName, '/');
  var len = pathItems.length;
  if (len === 1)
    return undefined;
  obj = parent;
  for (var i = 0; i < len; i++) {
    obj = obj._componentChild[pathItems[i]];
    if (!obj)
      return undefined;
  }
  return obj;
};
/** Creates a default name for the given type, optionally within the given 
 * parent component. */
Component.createName = function Component_createName(TypeConstructor, parent) {
  var typeDef = TypeConstructor.typeDef;
  if (!typeDef)
    throw new Error('Argument missing typeDef property: TypeConstructor');
  var name = typeDef.name;
  var id = 0;
  // Lowercase the first letter of the type name (e.g. Window -> window).
  name = name.substr(0, 1).toLowerCase() + name.substr(1);
  // New names get a numerical suffix for every positive integer (not zer0).
  if (parent) {
    // Generate the next id from availability in the component's parent.
    if (Component.exists(name, parent)) {
      id += 1;
      while (Component.exists(name + id, parent))
        id += 1;
      name += id;
    }
  } else {
    // Generate the next id from the component's typeDef.
    id = typeDef.nextId || 0;
    typeDef.nextId = id + 1;
    if (id > 0)
      name += id;
  }
  return name;
};
/** Runs the given action function for the given component as well as every 
* child and descendant component via depth-first, pre-order tree traversal.
* (Think "drill down" or "running a drill".) */
Component.drill = function Component_drill(component, action) {
  action(component);
  var children = component._componentChildren;
  var len = children.length;
  for (var i = 0; i < len; i++)
    Component.drill(children[i], action);
};
/** Returns true if a component with the given name exists in the parent. */
Component.exists = function Component_exists(name, parent) {
  if (parent._componentChild[name])
    return true;
  return false;
};
/** Returns a factory method for the given component type's constructor. */
Component.factory = function Component_factory(TypeConstructor) {
  function component_factory(name, props, data) {
    return new TypeConstructor(name, props, data);
  }
  if (!TypeConstructor)
    throw new Error('Missing argument: TypeConstructor. Check required module.');
  if (typeof TypeConstructor.factory === 'function')
    return TypeConstructor.factory();
  return component_factory;
};
/**
 * Calls the `Component` constructor for the given object and returns a 
 * normalized props argument.
 */
Component.init = function Component_init(component, name, props) {
  // Arguments
  if (typeof name !== 'string' && !props) {
    props = name || {};
    name = props.name;
  } else
    props = props || {};
  props.name = name || '';
  //
  // Construct Component
  //
  // Normally instance fields should be initialized in a constructor but we'd 
  // rather not split the logic here between 2 functions. Furthermore, 
  // nobody should ever be calling the Component constructor in any way so that
  // will basically be enforced here. Lastly, this is better for auto-complete.
  //
  Component.call(component);
  component._componentChild = {};
  component._componentChildren = [];
  component._componentEvents = new EventEmitter();
  component._componentLoaded = false;
  component._componentParent = null;
  component._componentPath = props.name;
  component._componentProps = {
    name: props.name
  };
  //
  // Initialize Property Defaults & Given Values
  //
  var typeDef = component.constructor.typeDef;
  var selfProp = component._componentProps;
  // For each defined property, set it's default value (if any).
  // (Do this first for all properties before assigning any given values.)
  lodash.forEach(typeDef.props, function prop_setDefault(opts, propName) {
    if (hasOwnProp.call(opts, 'defaultValue'))
      selfProp[propName] = opts.defaultValue;
  });
  // For each defined property, possibly assign a property from props.
  // (Don't loop over props since it might have keys for undefined properties).
  lodash.forEach(typeDef.props, function prop_setInitial(opts, propName) {
    if (!hasOwnProp.call(props, propName))
      return;
    var value = props[propName];
    if (typeof component[propName] === 'function')
      component[propName](value);
    else
      selfProp[propName] = value;
  });
  return props;
};
/** Returns the typeDef namespace member if found else `undefined`. */
Component.getTypeDef = function(typeName, namespaceName) {
  var ns = Component.typeDef[namespaceName];
  if (!ns)
    return;
  return ns[typeName];
};
/** Loads the Component into the remote process and returns the result. */
Component.load = Promise.method(
  function Component_load(component) {
    console.log('Loading ' + component.name() + ':' + component.constructor.name);
    var app = geldesk.app();
    var data = Component.serialize(component);
    if (component.controller)
        app.router.addController(component.name(), component);
    return app.component.load(data)
    .then(function(result) {
      Component.drill(component, markAsLoaded);
      return result;
    }).catch(function(err) {
      if (component.controller)
        app.router.removeController(component.name());
    });
  }
);

function markAsLoaded(component) {
  component._componentLoaded = true;
}
/** Sends an RPC notification for the given component event and arguments. */
Component.notify = function Component_notify(component, eventName, etc) {
  var cn = geldesk.app().process.connection;
  var eventPath = component._componentPath + '/' + eventName;
  if (arguments.length < 3)
    return cn.notify(eventPath);
  return cn.notify(eventPath, Array.prototype.slice.call(arguments, 2));
};
/** Returns an object with namespace and name key values derived from 
 * splitting the given namespace.type string.*/
Component.nsType = function Component_nsType(namespaceWithType) {
  var i = namespaceWithType.lastIndexOf('.');
  return {
    // A blank string if i is negative.
    namespace: namespaceWithType.substr(0, i),
    // The whole string if i is -1.
    name: namespaceWithType.substr(i + 1)
  };
};
/**
 * Registers `TypeConstructor` as a `Component` and returns a type-builder 
 * object that has macro methods for defining properties and events. The given 
 * constructor should call `Component.init(this, ...)`, which completes the 
 * construction of the `Component` instance (by calling 
 * `Component.call(component)` itself.
 */
Component.of = function Component_of(TypeConstructor, namespace, opts) {
  // Arguments
  if (typeof TypeConstructor !== 'function')
    throw new Error('Argument must be a function: TypeConstructor');
  if (!namespace)
    throw new Error('Argument missing: namespace');
  opts = opts || {};
  // Inherit
  util.inherits(TypeConstructor, Component);
  // Create typeDef
  var name = TypeConstructor.name;
  var typeDef = {
    defaultChildType: opts.defaultChildType || '',
    events: {},
    name: name,
    namespace: namespace,
    nextId: 0,
    props: {},
    TypeConstructor: TypeConstructor,
    createWithData: opts.createWithData ? true : false,
    serializeData: opts.serializeData
  };
  // Register typeDef
  var ns = Component.typeDef[namespace];
  if (!ns)
    ns = Component.typeDef[namespace] = {};
  else if (ns[name])
    throw new Error('Type already defined: ' + namespace + '.' + name);
  ns[name] = typeDef;
  TypeConstructor.typeDef = typeDef;
  // Create and return builder after declaring any property methods that are 
  // implemented by default in the Component.prototype. (name, etc.)
  var buildTypeDef = {
    typeDef: typeDef,
    EVENT: buildTypeDef_EVENT,
    event: buildTypeDef_EVENT,
    PROP: buildTypeDef_PROP,
    prop: buildTypeDef_PROP
  };
  buildTypeDef.PROP('name', '');
  return buildTypeDef;
  // Builder methods
  function buildTypeDef_EVENT(eventName, preSubscribed, opts) {
    opts = opts || {};
    opts.preSubscribed = preSubscribed || false;
    typeDef.events[eventName] = opts;
    return buildTypeDef;
  }

  function buildTypeDef_PROP(propertyName, defaultValue, opts) {
    opts = opts || {};
    if (typeof defaultValue !== 'undefined' && !hasOwnProp.call(opts, 
      'defaultValue')) {
      opts.defaultValue = defaultValue;
    }
    typeDef.props[propertyName] = opts;
    return component_prop;
    /** Property getter/setter for a Component instance. */
    function component_prop(value) {
      /*jshint validthis: true */
      if (arguments.length === 0)
        return this._componentProps[propertyName];
      this._componentProps[propertyName] = value;
      return this;
    }
  }
};
/** Subscribes a handler function to an event on the given component. */
Component.on = function Component_on(component, eventName, handler) {
  if (!component)
    throw new Error('Missing Component argument: component');
  if (!eventName)
    throw new Error('Missing String argument: eventName');
  var typeDef = component.constructor.typeDef;
  if (!typeDef)
    throw new Error('Component typeDef not found for: ' + component.constructor.name);
  var eventOpts = typeDef.events[eventName];
  var events = component._componentEvents;
  events.on(eventName, handler);
  if (!eventOpts || eventOpts.preSubscribed)
    return;
  if (events.listenerCount(eventName) > 1)
    return;
  // We only tell the remote side once when the first handler is added and 
  // once again when the last handler is removed.
  subscribeComponent(component, eventName);
};
/** Returns the path of the given component instance. */
Component.path = function Component_path(component) {
  return component._componentPath;
};
/** Returns a default component property function implementation. */
Component.prop = function Component_prop(propertyName) {
  function component_prop(value) {
    /*jshint validthis: true */
    if (arguments.length === 0)
      return this._componentProps[propertyName];
    this._componentProps[propertyName] = value;
    return this;
  }
  return component_prop;
};
/** Removes the given child component from it's parent, if any.
 * Returns the parent. */
Component.remove = function Component_remove(child, preservePath) {
  var parent = child._componentParent;
  if (!parent || !parent._componentChildren)
    return parent;
  delete parent._componentChild[child.name()];
  core.removeOne(parent._componentChildren, child);
  child._componentParent = null;
  if (!preservePath)
    Component.drill(child, setComponentPath);
  return parent;
};
/** Removes the given component event handler. */
Component.removeHandler = 
function Component_removeHandler(component, eventName, handler) {
  if (!component)
    throw new Error('Missing Component argument: component');
  if (!eventName)
    throw new Error('Missing String argument: eventName');
  var typeDef = component.constructor.typeDef;
  if (!typeDef)
    throw new Error('Component typeDef not found for: ' + component.constructor.name);
  var eventOpts = typeDef.events[eventName];
  var events = component._componentEvents;
  events.removeListener(eventName, handler);
  if (!eventOpts || eventOpts.preSubscribed)
    return;
  if (events.listenerCount(eventName) > 0)
    return;
  // We only tell the remote side once when the first handler is added and 
  // once again when the last handler is removed.
  unsubscribeComponent(component, eventName);
};
/** Sends an RPC request for the given component action and arguments. 
 * Returns a Promise result. */
Component.request = function Component_request(component, actionName, etc) {
  var cn = geldesk.app().process.connection;
  var actionPath = component._componentPath + '/' + actionName;
  if (arguments.length < 3)
    return cn.request(actionPath);
  return cn.request(actionPath, Array.prototype.slice.call(arguments, 2));
};
/** Returns the typeDef namespace member if found else throws an error. */
Component.requireTypeDef = function(typeName, namespaceName) {
  var typeDef = Component.getTypeDef(typeName, namespaceName);
  if (!typeDef)
    throw new Error('Type not found: ' + namespaceName + '.' + typeName);
  return typeDef;
};

Component.serialize = function(component) {
  var name = component.name();
  var typeDef = component.constructor.typeDef;
  var header = name + ':' + typeDef.namespace + '.' + typeDef.name;
  var props = lodash.merge({}, component._componentProps);
  delete props.name;
  props.e = serializeEventSubs(typeDef, component._componentEvents);
  var data;
  if (typeDef.createWithData) {
    data = typeDef.serializeData(component);
  } else {
    data = [];
    var children = component._componentChildren;
    var len = children.length;
    for (var i = 0; i < len; i++)
      data.push(Component.serialize(children[i]));
  }
  return [header, props].concat(data);
};

function serializeEventSubs(typeDef, events) {
  var typeEvents = typeDef.events;
  var eventOpts;
  var subscriptions = [];
  for (var eventName in typeEvents) {
    eventOpts = typeEvents[eventName];
    if (eventOpts.preSubscribed)
      continue;
    if (events.listenerCount(eventName) > 0)
      subscriptions.push(eventName);
  }
  if (subscriptions.length > 0)
    return subscriptions;
  return undefined;
}
/** Assigns the component properties from the given props object. */
Component.set = function Component_set(component, props) {
  lodash.assign(component._componentProps, props);
};

function setComponentPath(component) {
  if (!component._componentParent) {
    component._componentPath = component._componentProps.name;
    return;
  }
  component._componentPath = 
    component._componentParent._componentPath + '/' + 
    component._componentProps.name;
}

function subscribeComponent(component, eventName) {
  if (!component._componentLoaded)
    return;
  var app = geldesk.app();
  app.component.subscribe(component, eventName);
}

function unsubscribeComponent(component, eventName) {
  if (!component._componentLoaded)
    return;
  var app = geldesk.app();
  app.component.unsubscribe(component, eventName);
}

/**
 * Type definitions for Component types, keyed by 'namespace' then 'TypeName'.
 */
Component.typeDef = {};
// #endregion

// #region Methods

Component.prototype.add = function(component) {
  Component.add(this, component);
  return this;
};

/** Returns a child or descendant component from the given pathOrName. */
Component.prototype.component = function Component_component(pathOrName) {
  return Component.child(this, pathOrName);
};
/** Gets or sets the name of the component instance. */
Component.prototype.name = function(value) {
  if (arguments.length === 0)
    return this._componentProps.name;
  this._componentProps.name = value;
  Component.drill(this, setComponentPath);
  return this;
};
/** Subscribes a handler function to an event on the given component. */
Component.prototype.on = function(eventName, handler) {
  Component.on(this, eventName, handler);
  return this;
};

// #endregion
// #endregion

// #region ComponentManager

function ComponentManager(app) {
  this.app = app;
  this.controller = new ComponentController(this);

  this.defaultNamespaces = ['geldesk.ui', 'geldesk'];

  this.app.router.addController('component', this.controller);
}
geldesk.ComponentManager = ComponentManager;

ComponentManager.prototype.load = function ComponentManager_load (data) {
  var cn = this.app.process.connection;
  return cn.request('component/load', data);
};
ComponentManager.prototype.subscribe = 
function Component_subscribe(component, eventName) {
  var cn = this.app.process.connection;
  return cn.notify('component/subscribe', [component._componentPath, eventName]);
};
ComponentManager.prototype.unsubscribe = 
function Component_unsubscribe(component, eventName) {
  var cn = this.app.process.connection;
  return cn.notify('component/unsubscribe', [component._componentPath, eventName]);
};
// #endregion

// #region ComponentController
function ComponentController(component) { }

ComponentController.prototype.someEvent = function() {
  //this.component._handleSomeEvent(...);
};

ComponentController.prototype.someRequest = function(cb) {
  //this.component._handleSomeRequest(..., cb);
};

// #endregion
