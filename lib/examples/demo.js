'use strict';

var _opentracing = require('opentracing');

var _opentracing2 = _interopRequireDefault(_opentracing);

var _lightstepTracer = require('lightstep-tracer');

var _lightstepTracer2 = _interopRequireDefault(_lightstepTracer);

var _ = require('../..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Ensure the Node line numbers are accurate in stack traces
require('source-map-support');

// Initialize the tracing implementation, in this case LightStep is used.
// Replace '{your_access_token}' with your LightStep access token to send the
// tracing data to your project.
/* eslint-disable no-console */
_opentracing2.default.initGlobalTracer(_lightstepTracer2.default.tracer({
    access_token: '{your_access_token}',
    component_name: 'TracedPromise'
}));

// Set up an initial span to track all the subsequent work
var parent = _opentracing2.default.startSpan('Promises.all');

// Set up the child promises that run in parallel.
// Simply timeouts are being used here. In a real world application, these might
// be any asynchronous operation: file i/o, database transactions, network
// requests, etc.
var p1 = new _2.default(parent, 'p1', function (resolve, reject) {
    setTimeout(resolve, 100, 'one');
});
var p2 = new _2.default(parent, 'p2', function (resolve, reject) {
    setTimeout(resolve, 200, 'two');
});
var p3 = new _2.default(parent, 'p3', function (resolve, reject) {
    setTimeout(resolve, 300, 'three');
});
var p4 = new _2.default(parent, 'p4', function (resolve, reject) {
    setTimeout(resolve, 400, 'four');
});
var p5 = new _2.default(parent, 'p5', function (resolve, reject) {
    setTimeout(reject, 250, 'failure!');
});

// Wait for the child promises to resolve or reject and then handle the result.
_2.default.all(parent, [p1, p2, p3, p4, p5]).then(function (value) {
    console.log('Resolved: ' + value);
}, function (reason) {
    console.log('Rejected: ' + reason);
});

//# sourceMappingURL=demo.js.map