import { BehaviorSubject, Observable, UnaryFunction, pipe } from "rxjs";
import { scan, shareReplay, map, distinctUntilChanged, filter } from "rxjs/operators";

/**
 * Add a state holder manager to a class
 * Can be a simple state holder using the function `createBasicState` to create an instance of the stateHolder. You can also extend a class to add a state manager behaviour to it  (like service in Angular <(^^)> )
 * @param T interface represeting the state structure
 */
export abstract class StateHolder<T> {

    private _stateHolderSource: BehaviorSubject<any>;
    private _stateHolder$: Observable<T>;
    private _lastActionName?: string;
    private _initValue: T;
    private _selectorsMap: Map<any, Observable<any>>;

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
    constructor(initValues: T) {
        this._stateHolderSource = new BehaviorSubject<T>(initValues);
        this._initValue = initValues;
        this._selectorsMap = new Map();
        this._stateHolder$ = this._stateHolderSource
            .pipe(
                scan<[ActionDef<T, any>, any], T>(
                    (all: T, act: [ActionDef<T, any>, any]) => {
                        return act[0] ? act[0].action(all, act[1]) : all
                    }, initValues),
                shareReplay(1)
            );
        if (stateHolderConfig.logger) { this.devMode(); }
    }

    /**
     * Warning : erase all the data and put it back in the original state.
     * Next state value will match the iniValue defined in the constructor.
     */
    public get wipe(): T { return this._initValue; }

    /**
     * Retrieve the state Observable of the model
     */
    public get stateHolder$(): Observable<T> { return this._stateHolder$; }

    /**
     * Utility function to clear the corresponding keys values
     * @param state the current state
     * @param keys the keys to be reset to the default value
     * @returns the new state
     */
    public clear(state: T, ...keys: (keyof T)[]): T {
        const keysCleared = {} as T;
        keys.forEach(k => this._initValue[k] != null ? keysCleared[k] = this._initValue[k] : null);
        return { ...state, ...keysCleared };
    }

    /**
     * Dispatch a new action to update the state
     * @param actionDef `ActionDef<T, S>` dispatch an action created by `createAction()`
     * @param args the arguments to dispatch to the state to update it
     */
    public dispatch<U, S>(actionDef: ActionDef<T, S>, args?: U): void {
        this._lastActionName = actionDef.label;
        this._stateHolderSource.next([actionDef, args]);
    }

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
    public select$<I, O>(selectorDef: SelectorDef<T, O, I>, args?: I): Observable<O> {
        const key = this.makeKey(selectorDef.key, args);
        const cachedObs = this._selectorsMap.get(key)
        if (cachedObs) {
            return cachedObs as Observable<O>;
        }
        if (args) {
            const newObs = this._stateHolder$.pipe(map((state: T) => selectorDef.selector(state, args)), this.processPipe());
            this._selectorsMap.set(key, newObs);
            return newObs;
        }
        const selectorWithoutArgs = selectorDef.selector as ((state: T) => O);
        const newObs = this._stateHolder$.pipe(map((state: T) => selectorWithoutArgs(state)), this.processPipe());
        this._selectorsMap.set(key, newObs);
        return newObs;
    }

    private devMode(): void {
        this._stateHolder$
            .pipe(distinctUntilChanged())
            .subscribe({ next: (state: T) => console.log({ action: this._lastActionName ? this._lastActionName : 'initial', state: state }) });
    }

    private processPipe(): UnaryFunction<Observable<{}>, Observable<any>> {
        return pipe(
            filter((d: any) => d !== null && d !== undefined),
            distinctUntilChanged(),
        );
    }

    private makeKey(key: string, args: any): string {
        if (!args) {
            return key;
        }
        if (isObject(args)) {
            return `${key}${JSON.stringify(args)}`;
        }
        return `${key}${args.toString()}`;
    }
}

export const isObject = (x: any): x is object => {
    return x && x.constructor === Object;
}

export const isArray = (x: any): x is Array<any> => {
    return x && x.constructor === Array;
}

export const stateHolderConfig = {
    logger: true
}

export interface ActionDef<T, I> {
    label: string;
    action: Action<T, I>;
}

export type Action<T, I = any> = ((state: T) => T) | ((state: T, args: I) => T);
/**
 * Create a new action
 * @param label Name your action, only used in logging mode to have a more explicite name
 * @param action the action to dispatch
 * @returns a new action to use in the dispatch function of the state instance
 */
export const createAction = <T, I>(label: string, action: Action<T, I>): ActionDef<T, I> => ({ label, action })

export interface SelectorDef<T, O, I = any> {
    key: string;
    selector: Selector<T, O, I>;
}

export type Selector<T, O, I = any> = ((state: T) => O) | ((state: T, args: I) => O);

/**
 * Create a new selector
 * @param selector the select function
 * @returns a new selector to use with the select$ function of the state instance
 */
export const createSelector = <T, O, I = any>(selector: Selector<T, O, I>, key?: string): SelectorDef<T, O, I> => {
    if (!key) {
        const id = parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(8).toString().replace(".", ""));
        return ({ key: `${id}`, selector });
    }
    return ({ key, selector })
}

/**
 * Create a new basic state holder. Usefull if you do not need to add any other behaviour to it, only dispatching and selecting outside the class is usefull to you.
 * @param initValues init value of the state
 * @returns a new basic state holder
 */
export const createBasicState = <T>(initValues: T): SimpleStateHolder<T> => {
    return new SimpleStateHolder(initValues);
}

export class SimpleStateHolder<T> extends StateHolder<T> {
    constructor(initValues: T) { super(initValues); }
}
