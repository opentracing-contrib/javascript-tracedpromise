/* eslint-disable no-console */
import * as opentracing from 'opentracing';
import lightstep from 'lightstep-tracer';
import TracedPromise from '../..';

// Ensure the Node line numbers are accurate in stack traces
require('source-map-support');

// Initialize the tracing implementation, in this case LightStep is used.
// Replace '{your_access_token}' with your LightStep access token to send the
// tracing data to your project.
opentracing.initGlobalTracer(new lightstep.Tracer({
    access_token   : '{your_access_token}',
    component_name : 'TracedPromise',
}));

// Set up an initial span to track all the subsequent work
let parent = opentracing.globalTracer().startSpan('Promises.all');

// Set up the child promises that run in parallel.
// Simply timeouts are being used here. In a real world application, these might
// be any asynchronous operation: file i/o, database transactions, network
// requests, etc.
let p1 = new TracedPromise(parent, 'p1', (resolve, reject) => {
    setTimeout(resolve, 100, 'one');
});
let p2 = new TracedPromise(parent, 'p2', (resolve, reject) => {
    setTimeout(resolve, 200, 'two');
});
let p3 = new TracedPromise(parent, 'p3', (resolve, reject) => {
    setTimeout(resolve, 300, 'three');
});
let p4 = new TracedPromise(parent, 'p4', (resolve, reject) => {
    setTimeout(resolve, 400, 'four');
});
let p5 = new TracedPromise(parent, 'p5', (resolve, reject) => {
    setTimeout(reject, 250, 'failure!');
});
let p6Options = {
    references : [ opentracing.followsFrom(parent.context()) ],
};
let p6 = new TracedPromise(p6Options, 'p6', (resolve, reject) => {
    setTimeout(resolve, 600, 'six');
});

// Wait for the child promises to resolve or reject and then handle the result.
TracedPromise.all(parent, [p1, p2, p3, p4, p5, p6]).then(value => {
    console.log(`Resolved: ${value}`);
}, reason => {
    console.log(`Rejected: ${reason}`);
});
