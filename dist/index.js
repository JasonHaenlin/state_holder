'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rxjs = require('rxjs');
var operators = require('rxjs/operators');

class StateHolder {
  constructor(initValues) {
    this._stateHolderSource = new rxjs.BehaviorSubject(initValues);
    this._initValue = initValues;
    this._selectorsMap = {};
    this._stateHolder$ = this._stateHolderSource.pipe(operators.scan((all, act) => {
      return act[0] ? act[0].action(all, act[1]) : all;
    }, initValues), operators.shareReplay(1));
    if (stateHolderConfig.logger) {
      this.devMode();
    }
  }
  get wipe() {
    return this._initValue;
  }
  get stateHolder$() {
    return this._stateHolder$;
  }
  clear(state, ...keys) {
    const keysCleared = {};
    keys.forEach((k) => this._initValue[k] != null ? keysCleared[k] = this._initValue[k] : null);
    return {...state, ...keysCleared};
  }
  dispatch(actionDef, args) {
    this._lastActionName = actionDef.label;
    this._stateHolderSource.next([actionDef, args]);
  }
  select$(selector, args) {
    const cachedObs = this._selectorsMap[selector.name];
    if (cachedObs) {
      return cachedObs;
    }
    if (args) {
      const newObs2 = this._stateHolder$.pipe(operators.map((state) => selector(state, args)), this.processPipe());
      this._selectorsMap[selector.name] = newObs2;
      return newObs2;
    }
    const selectorWithoutArgs = selector;
    const newObs = this._stateHolder$.pipe(operators.map((state) => selectorWithoutArgs(state)), this.processPipe());
    this._selectorsMap[selector.name] = newObs;
    return newObs;
  }
  devMode() {
    this._stateHolder$.pipe(operators.distinctUntilChanged()).subscribe({next: (state) => console.log({action: this._lastActionName ?? "initial", state})});
  }
  processPipe() {
    return rxjs.pipe(operators.filter((d) => d !== null && d !== void 0), operators.distinctUntilChanged());
  }
}
const stateHolderConfig = {
  logger: true
};
const createAction = (label, action) => ({label, action});
const createSelector = (selector) => selector;
const createBasicState = (initValues) => {
  return new SimpleStateHolder(initValues);
};
class SimpleStateHolder extends StateHolder {
  constructor(initValues) {
    super(initValues);
  }
}

exports.SimpleStateHolder = SimpleStateHolder;
exports.StateHolder = StateHolder;
exports.createAction = createAction;
exports.createBasicState = createBasicState;
exports.createSelector = createSelector;
exports.stateHolderConfig = stateHolderConfig;
//# sourceMappingURL=index.js.map
