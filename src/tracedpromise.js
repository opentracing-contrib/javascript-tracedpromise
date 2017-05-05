import * as opentracing from 'opentracing';

/*
 * wrapResolve is a helper that takes a standard ES6 Promise resolve callback
 * and returns a * wrapped function that first finishes the given `span` before
 * calling `f`. It is safe to call this function with a null or undefined span.
 */
function wrapResolve(span, f) {
    if (!span) {
        return f;
    }
    return function (...args) {
        span.finish();
        return f(...args);
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
    return function (...args) {
        span.setTag('error', true);
        span.finish();
        return f(...args);
    };
}

/*
 * chainFinishSpan is a helper that finishes the given `span` when the `promise`
 * either rejects or resolved. It returns a valid Promise that so that chaining
 * can continue.
 */
function chainFinishSpan(promise, span) {
    return promise.then((value) => {
        span.finish();
        return value;
    }, (reason) => {
        span.setTag('error', true);
        span.finish();
        return Promise.reject(reason);
    });
}

/**
 * TracedPromise adds OpenTracing instrumentation to a standard ES6 Promise.
 */
export default class TracedPromise {
    /**
     * Constructs anew TracedPromise
     *
     * @param {Object} options - the options to used to create the span for this
     *        promise or the parent span.  Pass `null` for a promise that does
     *        not have a parent.
     * @param {string} name - name to use for the span created internally by
     *        the TracedPromise.
     * @param {Function} callback - callback to use to resolve the promise. The
     *        signature and behavior should be that of a callback passed to a
     *        standard ES6 Promise.
     */
    constructor(options, name, callback) {
        let opts = options;
        if (options instanceof opentracing.Span) {
            opts = { childOf : options };
        }
        let span = opentracing.globalTracer()
                              .startSpan(name, opts);
        let wrappedCallback = (resolve, reject) => callback(
            wrapResolve(span, resolve),
            wrapReject(span, reject)
        );
        this._promise = new Promise(wrappedCallback);
        this._span = span;
    }

    /**
     * Has the same behavior as `Promise.then` with the addition that the
     * TracedPromise's internal span will also be finished.
     */
    then(onFulfilled, onRejected) {
        return this._promise.then(
            wrapResolve(this._span, onFulfilled),
            wrapReject(this._span, onRejected)
        );
    }

    /**
     * Has the same behavior as `Promise.catch` with the addition that the
     * TracedPromise's internal span will also be finished.
     */
    catch(onRejected) {
        return this._promise.catch(wrapReject(this._span, onRejected));
    }

    /**
     * Has the same behavior as `Promise.all` with the addition that passed in
     * `span` will be finish as soon as the returned Promise resolves or rejects.
     */
    static all(span, arr) {
        return chainFinishSpan(Promise.all(arr), span);
    }

    /**
     * Has the same behavior as `Promise.race` with the addition that passed in
     * `span` will be finish as soon as the returned Promise resolves or rejects.
     */
    static race(span, arr) {
        return chainFinishSpan(Promise.race(arr), span);
    }

    /**
     * Equivalent to `Promise.reject`.
     */
    static reject(...args) {
        return Promise.reject(...args);
    }

    /**
     * Equivalent to `Promise.resolve`.
     */
    static resolve(...args) {
        return Promise.resolved(...args);
    }
}
