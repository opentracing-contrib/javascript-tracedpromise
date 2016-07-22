'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _opentracing = require('opentracing');

var _opentracing2 = _interopRequireDefault(_opentracing);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * wrapResolve is a helper that takes a standard ES6 Promise resolve callback
 * and returns a * wrapped function that first finishes the given `span` before
 * calling `f`. It is safe to call this function with a null or undefined span.
 */
function wrapResolve(span, f) {
    if (!span) {
        return f;
    }
    return function () {
        span.finish();
        return f.apply(undefined, arguments);
    };
}

/*
 * wrapReject is a helper that takes a standard ES6 Promise resolve callback
 * and returns a * wrapped function that first finishes the given `span` before
 * calling `f`. It is safe to call this function with a null or undefined span.
 */
function wrapReject(span, f) {
    if (!span) {
        return f;
    }
    return function () {
        span.setTag('error', 'true');
        span.finish();
        return f.apply(undefined, arguments);
    };
}

/*
 * chainFinishSpan is a helper that finishes the given `span` when the `promise`
 * either rejects or resolved. It returns a valid Promise that so that chaining
 * can continue.
 */
function chainFinishSpan(promise, span) {
    return promise.then(function (value) {
        span.finish();
        return value;
    }, function (reason) {
        span.setTag('error', 'true');
        span.finish();
        return Promise.reject(reason);
    });
}

/**
 * TracedPromise adds OpenTracing instrumentation to a standard ES6 Promise.
 */

var TracedPromise = function () {
    /**
     * Constructs anew TracedPromise
     *
     * @param {Span} parent - the parent of the span created by this promise.
     *        Pass `null` for a promise that does not have a parent.
     * @param {string} name - name to use for the span created internally by
     *        the TracedPromise.
     * @param {Function} callback - callback to use to resolve the promise. The
     *        signature and behavior should be that of a callback passed to a
     *        standard ES6 Promise.
     */

    function TracedPromise(parent, name, callback) {
        _classCallCheck(this, TracedPromise);

        var span = _opentracing2.default.startSpan(name, { childOf: parent });
        var wrappedCallback = function wrappedCallback(resolve, reject) {
            return callback(wrapResolve(span, resolve), wrapReject(span, reject));
        };
        this._promise = new Promise(wrappedCallback);
        this._span = span;
    }

    /**
     * Has the same behavior as `Promise.then` with the addition that the
     * TracedPromise's internal span will also be finished.
     */


    _createClass(TracedPromise, [{
        key: 'then',
        value: function then(onFulfilled, onRejected) {
            return this._promise.then(wrapResolve(this._span, onFulfilled), wrapReject(this._span, onRejected));
        }

        /**
         * Has the same behavior as `Promise.catch` with the addition that the
         * TracedPromise's internal span will also be finished.
         */

    }, {
        key: 'catch',
        value: function _catch(onRejected) {
            return this._promise.catch(wrapReject(this._span, onRejected));
        }

        /**
         * Has the same behavior as `Promise.all` with the addition that passed in
         * `span` will be finish as soon as the returned Promise resolves or rejects.
         */

    }], [{
        key: 'all',
        value: function all(span, arr) {
            return chainFinishSpan(Promise.all(arr), span);
        }

        /**
         * Has the same behavior as `Promise.race` with the addition that passed in
         * `span` will be finish as soon as the returned Promise resolves or rejects.
         */

    }, {
        key: 'race',
        value: function race(span, arr) {
            return chainFinishSpan(Promise.race(arr), span);
        }

        /**
         * Equivalent to `Promise.reject`.
         */

    }, {
        key: 'reject',
        value: function reject() {
            return Promise.reject.apply(Promise, arguments);
        }

        /**
         * Equivalent to `Promise.resolve`.
         */

    }, {
        key: 'resolve',
        value: function resolve() {
            return Promise.resolved.apply(Promise, arguments);
        }
    }]);

    return TracedPromise;
}();

exports.default = TracedPromise;

//# sourceMappingURL=tracedpromise.js.map