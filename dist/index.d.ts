import { Observable } from "rxjs";
/**
 * Add a state holder manager to a class
 * Can be a simple state holder using the function `createBasicState` to create an instance of the stateHolder. You can also extend a class to add a state manager behaviour to it  (like service in Angular <(^^)> )
 * @param T interface represeting the state structure
 */
export declare abstract class StateHolder<T> {
    private _stateHolderSource;
    private _stateHolder$;
    private _lastActionName?;
    private _initValue;
    private _selectorsMap;
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
    constructor(initValues: T);
    /**
     * Warning : erase all the data and put it back in the original state.
     * Next state value will match the iniValue defined in the constructor.
     */
    get wipe(): T;
    /**
     * Retrieve the state Observable of the model
     */
    get stateHolder$(): Observable<T>;
    /**
     * Utility function to clear the corresponding keys values
     * @param state the current state
     * @param keys the keys to be reset to the default value
     * @returns the new state
     */
    clear(state: T, ...keys: (keyof T)[]): T;
    /**
     * Dispatch a new action to update the state
     * @param actionDef `ActionDef<T, S>` dispatch an action created by `createAction()`
     * @param args the arguments to dispatch to the state to update it
     */
    dispatch<U, S>(actionDef: ActionDef<T, S>, args?: U): void;
    /**
     * Select a value from the state
     * The select cache the observable created by the createSelector using the name of it.
     *
     * ONLY Primitive, Array and Object can be cached (for the moment)
     *
     * If you change the behaviour of an already selected function with the same name,
     * you will not get a new observable. You must create a new one with a new name.
     *
     * @param selector `Selector<T, O, I>` define the selector function
     * @returns the observable corresponding to your selector function
     */
    select$<I, O>(selectorDef: SelectorDef<T, O, I>, args?: I): Observable<O>;
    private devMode;
    private processPipe;
    private makeKey;
}
export declare const isObject: (x: any) => x is object;
export declare const isArray: (x: any) => x is any[];
export declare const stateHolderConfig: {
    logger: boolean;
    allowDistinctToPass: boolean;
    allowNullableToPass: boolean;
};
export interface ActionDef<T, I> {
    label: string;
    action: Action<T, I>;
}
export declare type Action<T, I = any> = ((state: T) => T) | ((state: T, args: I) => T);
/**
 * Create a new action
 * @param label Name your action, only used in logging mode to have a more explicite name
 * @param action the action to dispatch
 * @returns a new action to use in the dispatch function of the state instance
 */
export declare const createAction: <T, I>(label: string, action: Action<T, I>) => ActionDef<T, I>;
export interface SelectorDef<T, O, I = any> {
    key: string;
    selector: Selector<T, O, I>;
}
export declare type Selector<T, O, I = any> = ((state: T) => O) | ((state: T, args: I) => O);
/**
 * Create a new selector
 * @param selector the select function
 * @returns a new selector to use with the select$ function of the state instance
 */
export declare const createSelector: <T, O, I = any>(selector: Selector<T, O, I>, key?: string) => SelectorDef<T, O, I>;
/**
 * Create a new basic state holder. Usefull if you do not need to add any other behaviour to it, only dispatching and selecting outside the class is usefull to you.
 * @param initValues init value of the state
 * @returns a new basic state holder
 */
export declare const createBasicState: <T>(initValues: T) => SimpleStateHolder<T>;
export declare class SimpleStateHolder<T> extends StateHolder<T> {
    constructor(initValues: T);
}
