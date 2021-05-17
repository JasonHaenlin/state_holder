import { BehaviorSubject, pipe } from "rxjs";
import { scan, shareReplay, map, distinctUntilChanged, filter } from "rxjs/operators";
/**
 * Add a state holder manager to a class
 * Can be a simple state holder using the function `createBasicState` to create an instance of the stateHolder. You can also extend a class to add a state manager behaviour to it  (like service in Angular <(^^)> )
 * @param T interface represeting the state structure
 */
export class StateHolder {
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
    constructor(initValues) {
        this._stateHolderSource = new BehaviorSubject(initValues);
        this._initValue = initValues;
        this._selectorsMap = {};
        this._stateHolder$ = this._stateHolderSource
            .pipe(scan((all, act) => {
            return act[0] ? act[0].action(all, act[1]) : all;
        }, initValues), shareReplay(1));
        if (stateHolderConfig.logger) {
            this.devMode();
        }
    }
    /**
     * Warning : erase all the data and put it back in the original state.
     * Next state value will match the iniValue defined in the constructor.
     */
    get wipe() { return this._initValue; }
    /**
     * Retrieve the state Observable of the model
     */
    get stateHolder$() { return this._stateHolder$; }
    /**
     * Utility function to clear the corresponding keys values
     * @param state the current state
     * @param keys the keys to be reset to the default value
     * @returns the new state
     */
    clear(state, ...keys) {
        const keysCleared = {};
        keys.forEach(k => this._initValue[k] != null ? keysCleared[k] = this._initValue[k] : null);
        return { ...state, ...keysCleared };
    }
    /**
     * Dispatch a new action to update the state
     * @param actionDef `ActionDef<T, S>` dispatch an action created by `createAction()`
     * @param args the arguments to dispatch to the state to update it
     */
    dispatch(actionDef, args) {
        this._lastActionName = actionDef.label;
        this._stateHolderSource.next([actionDef, args]);
    }
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
    select$(selector, args) {
        const cachedObs = this._selectorsMap[selector.name];
        if (cachedObs) {
            return cachedObs;
        }
        if (args) {
            const newObs = this._stateHolder$.pipe(map((state) => selector(state, args)), this.processPipe());
            this._selectorsMap[selector.name] = newObs;
            return newObs;
        }
        const selectorWithoutArgs = selector;
        const newObs = this._stateHolder$.pipe(map((state) => selectorWithoutArgs(state)), this.processPipe());
        this._selectorsMap[selector.name] = newObs;
        return newObs;
    }
    devMode() {
        this._stateHolder$
            .pipe(distinctUntilChanged())
            .subscribe({ next: (state) => console.log({ action: this._lastActionName ? this._lastActionName : 'initial', state: state }) });
    }
    processPipe() {
        return pipe(filter((d) => d !== null && d !== undefined), distinctUntilChanged());
    }
}
export const stateHolderConfig = {
    logger: true
};
/**
 * syntactic sugar to create a new action
 * @param label Name your action, only used in logging mode to have a more explicite name
 * @param action the action to dispatch
 * @returns a new action to use in the dispatch function of the state instance
 */
export const createAction = (label, action) => ({ label, action });
/**
 * syntactic sugar to create a new selector
 * @param selector the select function
 * @returns a new selector to use with the select$ function of the state instance
 */
export const createSelector = (selector) => (selector);
/**
 * syntactic sugar to create a new basic state holder. Usefull if you do not need to add any other behaviour to it, only dispatching and selecting outside the class is usefull to you.
 * @param initValues init value of the state
 * @returns a new basic state holder
 */
export const createBasicState = (initValues) => {
    return new SimpleStateHolder(initValues);
};
export class SimpleStateHolder extends StateHolder {
    constructor(initValues) { super(initValues); }
}
//# sourceMappingURL=index.js.map