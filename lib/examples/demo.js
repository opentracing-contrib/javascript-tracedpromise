'use strict';

var _opentracing = require('opentracing');

var opentracing = _interopRequireWildcard(_opentracing);

var _lightstepTracer = require('lightstep-tracer');

var _lightstepTracer2 = _interopRequireDefault(_lightstepTracer);

var _ = require('../..');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Ensure the Node line numbers are accurate in stack traces
require('source-map-support');

// Initialize the tracing implementation, in this case LightStep is used.
// Replace '{your_access_token}' with your LightStep access token to send the
// tracing data to your project.
/* eslint-disable no-console */
opentracing.initGlobalTracer(new _lightstepTracer2.default.Tracer({
    access_token: '{your_access_token}',
    component_name: 'TracedPromise'
}));

// Set up an initial span to track all the subsequent work
var parent = opentracing.globalTracer().startSpan('Promises.all');

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
var p6Options = {
    references: [opentracing.followsFrom(parent.context())]
};
var p6 = new _2.default(p6Options, 'p6', function (resolve, reject) {
    setTimeout(resolve, 600, 'six');
});

// Wait for the child promises to resolve or reject and then handle the result.
_2.default.all(parent, [p1, p2, p3, p4, p5, p6]).then(function (value) {
    console.log('Resolved: ' + value);
}, function (reason) {
    console.log('Rejected: ' + reason);
});

//# sourceMappingURL=demo.js.map