'use strict';

var geldesk = require('../index.js');

function expandError(err) {
  if (!err || !err.message)
    return err;
  var err2 = new Error(err.message);
  for (var k in err)
    err2[k] = err[k];
  return err2;
}
geldesk.rpc.expandError = expandError;

function flattenError(err) {
  if (!(err instanceof Error))
    return err;
  var err2 = {
    message: err.message
  };
  if (typeof err.stack === 'string' && err.stack.length > 0)
    err2.stack = err.stack;
  for (var k in err)
    err2[k] = err[k];
  return err2;
}
geldesk.rpc.flattenError = flattenError;
