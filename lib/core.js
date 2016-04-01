'use strict';

// # Core Library
//
// Non-public, non-primary-namespace things that have no other home.
//

var lodash = require('lodash');

/**
 * Internal Utilities
 * @namespace core
 */
var core = module.exports;

core.emptyFn = function() { };
core.emptyCallback = function (err, result) { };
core.emptyDataHandler = function (data) { };

function objPath(obj, path) {
  if (Array.isArray(path)) {
    for (var i in path)
      obj = obj[path[i]];
    return obj;
  }
  return obj[path];
}
core.objPath = objPath;

function isIntCore(value, parsedIntValue) {
  if ((parseFloat(value) == parsedIntValue) && !isNaN(value)) {
    return true;
  } else {
    return false;
  }
}

function isInt(value) {
  return isIntCore(value, parseInt(value));
}
core.isInt = isInt;

function isPositiveInt(value) {
  var parsedInt = parseInt(value);
  if (!isIntCore(value, parsedInt))
    return false;
  return (parsedInt > 0);
}
core.isPositiveInt = isPositiveInt;

core.splitNsType = function splitNsType(namespaceWithType) {
  var i = namespaceWithType.lastIndexOf('.');
  var typeName;
  return [
    // Namespace - a blank string if i is negative.
    namespaceWithType.substr(0, i),
    // Type name - the whole string if i is -1.
    namespaceWithType.substr(i + 1)
  ];
};

function tryGetPositiveInt(value) {
  var parsedInt = parseInt(value);
  if (!isIntCore(value, parsedInt))
    return false;
  if (parsedInt > 0)
    return parsedInt;
  else
    return null;
}
core.tryGetPositiveInt = tryGetPositiveInt;

/**
 *  Generates a random UUID
 *  @return {String}
 *  @api public
 */
core.generateId = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 *  Merges properties of object b into object a
 *  @param {Object} a
 *  @param {Object} b
 *  @return {Object}
 *  @api private
 */
core.merge = function (a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};
/** Removes one matching value from the given array and returns it. */
core.removeOne = function core_removeOne(array, value) {
  var len = array.length;
  var removed;
  for (var i = 0; i < len; i++) {
    if (array[i] === value) {
      removed = array.splice(i, 1);
      return removed[0];
    }
  }
};

/** * @namespace */
core.JSON = {};

/**
 * Parses a JSON string and then invokes the given callback
 * @param {String} str The string to parse
 * @param {Object} options Object with options, possibly holding a "reviver" function
 * @return {void}
 * @api public
 */
core.JSON.parse = function (str, options, callback) {
  options = options || {};
  
  var obj;
  var reviver;
  if (lodash.isFunction(options.reviver)) {
    reviver = options.reviver;
  }
  
  try {
    obj = JSON.parse.apply(JSON, lodash.compact([str, reviver]));
  } catch (err) {
    return callback(err);
  }
  
  callback(null, obj);
};

/**
 * Stringifies JSON and then invokes the given callback
 * @param {Object} obj The object to stringify
 * @param {Object} options Object with options, possibly holding a "replacer" function
 * @return {void}
 * @api public
 */
core.JSON.stringify = function (obj, options, callback) {
  options = options || {};
  
  var replacer;
  if (lodash.isFunction(options.replacer)) {
    replacer = options.replacer;
  }
  
  var str;
  try {
    str = JSON.stringify.apply(JSON, lodash.compact([obj, replacer]));
  } catch (err) {
    return callback(err);
  }
  
  callback(null, str);
};
