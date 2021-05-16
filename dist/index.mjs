import { BehaviorSubject, pipe } from 'rxjs';
import { scan, shareReplay, map, distinctUntilChanged, filter } from 'rxjs/operators';

class StateHolder {
  constructor(initValues) {
    this._stateHolderSource = new BehaviorSubject(initValues);
    this._initValue = initValues;
    this._selectorsMap = {};
    this._stateHolder$ = this._stateHolderSource.pipe(scan((all, act) => {
      return act[0] ? act[0].action(all, act[1]) : all;
    }, initValues), shareReplay(1));
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
      const newObs2 = this._stateHolder$.pipe(map((state) => selector(state, args)), this.processPipe());
      this._selectorsMap[selector.name] = newObs2;
      return newObs2;
    }
    const selectorWithoutArgs = selector;
    const newObs = this._stateHolder$.pipe(map((state) => selectorWithoutArgs(state)), this.processPipe());
    this._selectorsMap[selector.name] = newObs;
    return newObs;
  }
  devMode() {
    this._stateHolder$.pipe(distinctUntilChanged()).subscribe({next: (state) => console.log({action: this._lastActionName ?? "initial", state})});
  }
  processPipe() {
    return pipe(filter((d) => d !== null && d !== void 0), distinctUntilChanged());
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

export { SimpleStateHolder, StateHolder, createAction, createBasicState, createSelector, stateHolderConfig };
//# sourceMappingURL=index.mjs.map
