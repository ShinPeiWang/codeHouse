import {
    Ref,
    isRef,
    isShallow,
    isReactive,
    ComputedRef,
    ReactiveEffect,
    DebuggerOptions,
    EffectScheduler
} from '@vue/reactivity';

import {
    isSet,
    isMap,
    isArray,
    isObject,
    isPromise,
    isFunction,
    isPlainObject,
    hasChanged
} from 'commonJs/helper/tool';

type InvalidateCbRegistrator = (cb: () => void) => void

const EMPTY_OBJ: { readonly [key: string]: any } = __DEVELOPMENT__
    ? Object.freeze({})
    : {};
const NOOP = () => { };

type WatchEffect = (onInvalidate: InvalidateCbRegistrator) => void

type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T)

type WatchCallback<V = any, OV = any> = (
    value: V,
    oldValue: OV,
) => any;

type MapSources<T, Immediate> = {
    [K in keyof T]: T[K] extends WatchSource<infer V>
    ? Immediate extends true
    ? V | undefined
    : V
    : T[K] extends object
    ? Immediate extends true
    ? T[K] | undefined
    : T[K]
    : never
};

interface WatchOptions<Immediate = boolean> extends DebuggerOptions {
    immediate?: Immediate
    deep?: boolean
}

type WatchStopHandle = () => void;

// initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {};
const ErrorCodes = {
    WATCH_GETTER: 'watcher getter',
    WATCH_CALLBACK: 'watcher callback',
    WATCH_CLEANUP: 'watcher cleanup function'
};

type MultiWatchSources = (WatchSource<unknown> | object)[]

function callWithErrorHandling(
    fn: Function,
    type: string,
    args?: unknown[]
) {
    let res;
    try {
        res = args ? fn(...args) : fn();
    } catch (err) {
        console.warn(type, err);
    }
    return res;
}

function callWithAsyncErrorHandling(
    fn: Function | Function[],
    type: string,
    args?: unknown[]
): any[] {
    if (isFunction(fn)) {
        const res = callWithErrorHandling(fn, type, args);
        if (res && isPromise(res)) {
            res.catch(err => {
                console.warn(err);
            });
        }
        return res;
    }

    const values = [];
    for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], type, args));
    }
    return values;
}

export function createDisposeBag() {
    return [] as WatchStopHandle[];
}

export function disWatch(disposeBag: WatchStopHandle[]) {
    while (disposeBag.length) {
        disposeBag.pop()!();
    }
}

// overload: array of multiple sources + cb
export function watch<
    T extends MultiWatchSources,
    Immediate extends Readonly<boolean> = false
>(
    sources: [...T],
    cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
    options?: WatchOptions<Immediate>
): WatchStopHandle | ((disposeBag: WatchStopHandle[]) => void);

// overload: multiple sources w/ `as const`
// watch([foo, bar] as const, () => {})
// somehow [...T] breaks when the type is readonly
export function watch<
    T extends Readonly<MultiWatchSources>,
    Immediate extends Readonly<boolean> = false
>(
    source: T,
    cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
    options?: WatchOptions<Immediate>
): WatchStopHandle | ((disposeBag: WatchStopHandle[]) => void);

// overload: single source + cb
export function watch<T, Immediate extends Readonly<boolean> = false>(
    source: WatchSource<T>,
    cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
    options?: WatchOptions<Immediate>
): WatchStopHandle | ((disposeBag: WatchStopHandle[]) => void);

// overload: watching reactive object w/ cb
export function watch<
    T extends object,
    Immediate extends Readonly<boolean> = false
>(
    source: T,
    cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
    options?: WatchOptions<Immediate>
): WatchStopHandle | ((disposeBag: WatchStopHandle[]) => void);

// implementation
export function watch<T = any, Immediate extends Readonly<boolean> = false>(
    source: T | WatchSource<T>,
    cb: any,
    options?: WatchOptions<Immediate>
): WatchStopHandle | ((disposeBag: WatchStopHandle[]) => void) {
    return doWatch(source as any, cb, options);
}

function doWatch(
    source: WatchSource | WatchSource[] | WatchEffect | object,
    cb: WatchCallback,
    { immediate, deep: _deep, onTrack, onTrigger }: WatchOptions = EMPTY_OBJ
): WatchStopHandle | ((disposeBag: WatchStopHandle[]) => void) {
    let deep = _deep;
    const warnInvalidSource = (s: unknown) => {
        console.warn(
            'Invalid watch source: ',
            s,
            'A watch source can only be a getter/effect function, a ref, ' +
            'a reactive object, or an array of these types.'
        );
    };

    let getter: () => any;
    let forceTrigger = false;
    let isMultiSource = false;
    let effect: ReactiveEffect;

    if (isRef(source)) {
        getter = () => source.value;
        forceTrigger = isShallow(source);
    } else if (isReactive(source)) {
        getter = () => source;
        deep = true;
    } else if (isArray(source)) {
        isMultiSource = true;
        forceTrigger = source.some(isReactive);
        getter = () =>
            source.map(s => {
                if (isRef(s)) {
                    return s.value;
                } else if (isReactive(s)) {
                    return traverse(s);
                } else if (isFunction(s)) {
                    return callWithErrorHandling(s, ErrorCodes.WATCH_GETTER);
                } else {
                    __DEVELOPMENT__ && warnInvalidSource(s);
                }
            });
    } else if (isFunction(source)) {
        getter = () =>
            callWithErrorHandling(source, ErrorCodes.WATCH_GETTER);
    } else {
        getter = NOOP;
        __DEVELOPMENT__ && warnInvalidSource(source);
    }

    if (deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }

    let cleanup: () => void;
    let onInvalidate: InvalidateCbRegistrator = (fn: () => void) => {
        cleanup = effect.onStop = () => {
            callWithErrorHandling(fn, ErrorCodes.WATCH_CLEANUP);
        };
    };

    let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
    const job = () => {
        if (!effect.active) {
            return;
        }
        if (cb) {
            // watch(source, cb)
            const newValue = effect.run();
            if (
                deep ||
                forceTrigger ||
                (isMultiSource
                    ? (newValue as any[]).some((v, i) =>
                        hasChanged(v, (oldValue as any[])[i]))
                    : hasChanged(newValue, oldValue)
                )
            ) {
                // cleanup before running cb again
                if (cleanup) {
                    cleanup();
                }
                callWithAsyncErrorHandling(cb, ErrorCodes.WATCH_CALLBACK, [
                    newValue,
                    // pass undefined as the old value when it's changed for the first time
                    oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
                    onInvalidate
                ]);
                oldValue = newValue;
            }
        } else {
            // watchEffect
            effect.run();
        }
    };

    // important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger (#1727)
    job.allowRecurse = !!cb;

    let scheduler: EffectScheduler = job;

    effect = new ReactiveEffect(getter, scheduler);

    if (__DEVELOPMENT__) {
        effect.onTrack = onTrack;
        effect.onTrigger = onTrigger;
    }

    // initial run
    if (immediate) {
        job();
    } else {
        oldValue = effect.run();
    }

    return (disposeBag?: WatchStopHandle[]) => {
        if (disposeBag) {
            disposeBag.push(() => {
                effect.stop();
            });
        } else {
            effect.stop();
        }
    };
}

function traverse(value: unknown, _seen?: Set<unknown>) {
    if (!isObject(value) || (value as any)['__v_skip']) {
        return value;
    }
    const seen = _seen || new Set();
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
    if (isRef(value)) {
        traverse(value.value, seen);
    } else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    } else if (isSet(value) || isMap(value)) {
        value.forEach((v: any) => {
            traverse(v, seen);
        });
    } else if (isPlainObject(value)) {
        Object.keys(value).forEach(key => {
            traverse((value as any)[key], seen);
        });
    }
    return value;
}