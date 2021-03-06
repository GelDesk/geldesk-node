'use strict';
/**
 * The root geldesk namespace.
 * @namespace geldesk
 */
var geldesk = module.exports;
//
// ## <Sub-Namespaces> - ALL sub-namespaces MUST be declared here.
// In some cases, an external but related library forms the base of an entire 
// sub-namespace.
//
geldesk.rpc = {};
geldesk.ui = {};
//
// ## [External Types] - Attach external library types here if the type will be
// commonly used throughout this library (or provided as part of this library).
// This way, we can switch out the implementation in one place.
//
geldesk.Promise = require('bluebird');
//
// ## !(Internal Types) - DO NOT include any internal type-lib scripts which 
// attach things to any namespace defined above. Those are included in the 
// package's root index.js file (since all of the internal type-lib scripts 
// include THIS file.)
//
