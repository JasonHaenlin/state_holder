"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateHolder = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var _1 = require(".");
/**
 * Add a state holder manager to a class
 * Can be a simple state holder using the function `createBasicState` to create an instance of the stateHolder. You can also extend a class to add a state manager behaviour to it  (like service in Angular <(^^)> )
 * @param T interface represeting the state structure
 */
var StateHolder = /** @class */ (function () {
    /**
     * Keep the state of the defined model as `T`
     * DevMode is enable in none production and log the model everytime it has been modified
     * @param T initValue the init value of the model
     *
     * ```ts
     * // structure of the state
     * interface SampleState {
     *     text: string;
     * }
     * // init state (when instantiating the class)
     * const initSampleState: SampleState = {
     *     text: '',
     * }
     * // create an action
     * const setTextAction = createAction(
     *         'Set text',
     *         (state: SampleState, { text }: { text: string }): SampleState => ({ ...state, text })
     * );
     * // create a selector
     * const textSelector = createSelector((state: SampleState): string => state.text);
     * // instiate a new basic state holder
     * const state = createBasicState(initSampleState);
     * // dispatch and select example
     * state.dispatch(setTextAction, { text: 'sample' });
     * state.select$(textSelector).subscribe({next: (v) => console.log(v)});
     * ```
     */
    function StateHolder(initValues) {
        this._stateHolderSource = new rxjs_1.BehaviorSubject(initValues);
        this._initValue = initValues;
        this._selectorsMap = {};
        this._stateHolder$ = this._stateHolderSource
            .pipe(operators_1.scan(function (all, act) {
            return act[0] ? act[0].action(all, act[1]) : all;
        }, initValues), operators_1.shareReplay(1));
        if (_1.stateHolderConfig.logger) {
            this.devMode();
        }
    }
    Object.defineProperty(StateHolder.prototype, "wipe", {
        /**
         * Warning : erase all the data and put it back in the original state.
         * Next state value will match the iniValue defined in the constructor.
         */
        get: function () { return this._initValue; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateHolder.prototype, "stateHolder$", {
        /**
         * Retrieve the state Observable of the model
         */
        get: function () { return this._stateHolder$; },
        enumerable: false,
        configurable: true
    });
    /**
     * Utility function to clear the corresponding keys values
     * @param state the current state
     * @param keys the keys to be reset to the default value
     * @returns the new state
     */
    StateHolder.prototype.clear = function (state) {
        var _this = this;
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        var keysCleared = {};
        keys.forEach(function (k) { return _this._initValue[k] != null ? keysCleared[k] = _this._initValue[k] : null; });
        return __assign(__assign({}, state), keysCleared);
    };
    /**
     * Dispatch a new action to update the state
     * @param actionDef `ActionDef<T, S>` dispatch an action created by `createAction()`
     * @param args the arguments to dispatch to the state to update it
     */
    StateHolder.prototype.dispatch = function (actionDef, args) {
        this._lastActionName = actionDef.label;
        this._stateHolderSource.next([actionDef, args]);
    };
    /**
     * Select a value from the state
     * The select cache the observable created by the createSelector using the name of it.
     *
     * If you change the behaviour of an already selected function with the same name,
     * you will not get a new observable. You must create a new one with a new name.
     *
     * @param selector `Selector<T, O, I>` define the selector function
     * @returns the observable corresponding to your selector function
     */
    StateHolder.prototype.select$ = function (selector, args) {
        var cachedObs = this._selectorsMap[selector.name];
        if (cachedObs) {
            return cachedObs;
        }
        if (args) {
            var newObs_1 = this._stateHolder$.pipe(operators_1.map(function (state) { return selector(state, args); }), this.processPipe());
            this._selectorsMap[selector.name] = newObs_1;
            return newObs_1;
        }
        var selectorWithoutArgs = selector;
        var newObs = this._stateHolder$.pipe(operators_1.map(function (state) { return selectorWithoutArgs(state); }), this.processPipe());
        this._selectorsMap[selector.name] = newObs;
        return newObs;
    };
    StateHolder.prototype.devMode = function () {
        var _this = this;
        this._stateHolder$
            .pipe(operators_1.distinctUntilChanged())
            .subscribe({ next: function (m) { var _a; return console.log({ action: (_a = _this._lastActionName) !== null && _a !== void 0 ? _a : 'initial', state: m }); } });
    };
    StateHolder.prototype.processPipe = function () {
        return rxjs_1.pipe(operators_1.filter(function (d) { return d !== null && d !== undefined; }), operators_1.distinctUntilChanged());
    };
    return StateHolder;
}());
exports.StateHolder = StateHolder;
//# sourceMappingURL=state-holder.js.map