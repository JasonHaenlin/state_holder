import { BehaviorSubject, EMPTY, Observable, pipe, UnaryFunction } from 'rxjs';
import { distinctUntilChanged, filter, map, scan, shareReplay } from 'rxjs/operators';

/**
 * Add a state holder manager to a class (like service in Angular)
 * @param T interface represeting the state structure
 * @param A enum of strings representing the possible Actions
 */
export abstract class StateHolder<T, A extends string> {

    private _stateHolderSource: BehaviorSubject<any>;
    private _stateHolder$: Observable<T>;
    private _actions: ActionFactory<T, A>;
    private _currentAction?: Action<T>;
    private _initValue: T;
    private _lastDispatchAction?: A;

    /**
     * Keep the state of the defined model as `T`
     * The actions are defined by `A` and must be an enum with string association
     * ```ts
     *  enum StateAction {
     *      clear = "clear",
     *      appendValue = "append value",
     *  }
     * ```
     * DevMode is enable in none production and log the model everytime it has been modified
     * @param ActionTypeArray<T, any> define the actions match by enum value
     * @param T initValue the init value of the model
     *
     * ```ts
     *  private _stateHolder = new StateHolder<State, StateAction>({
     *      [StateAction.clear]: {scan : (state) => this._stateHolder.wipe},
     *      [StateAction.appendValue]: {scan : (state, {value}) => ({...state, values: [...state.values, value]})},
     *  }, { value: [], otherValue: '' });
     * ```
     */
    constructor(
        actions: ActionFactory<T, A>,
        initValues: T,
        devMode = true,
    ) {
        this._stateHolderSource = new BehaviorSubject<T>(initValues);
        this._actions = actions;
        this._initValue = initValues;
        this._stateHolder$ = this._stateHolderSource
            .pipe(scan<any, T>(
                (all, curr) =>
                    this._currentAction ? this._currentAction(all, curr) : all,
                initValues),
                shareReplay(1)
            );
        if (devMode) { this.devMode(); }
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
     * @param key `A` value matching an enum value from the enum and must be define in the list of actions
     * @param args the arguments to dispatch to the state to update it
     */
    public dispatch<U>(key: A, args?: U): void {
        if (!key) {
            throw new Error(`Key [${key}] not corresponding to the ActionFactory type`);
        }
        const action = this._actions[key];
        if (!action) {
            throw new Error(`Action not found for the key ${key}`);
        }
        this._lastDispatchAction = key;
        this._currentAction = action;
        this._stateHolderSource.next(args);
    }

    /**
     * Select a value from the state
     * @param prop define a key from the model to retrieve the corresponding value
     * or a method taking in parameters the state and return back the value you wantto retrieve
     * @returns the observable corresponding to your mapping or `EMPTY` Observable if it's not matching a string or function
     */
    public select$<U extends keyof T, P = any>(prop: ((state: T) => P) | U): Observable<P> {
        if (typeof prop === 'string') {
            return this._stateHolder$.pipe(map(state => state[prop]), this.processPipe());
        }
        if (typeof prop === 'function') {
            return this._stateHolder$.pipe(map(state => prop(state), this.processPipe()));
        }
        return EMPTY;
    }

    /**
     * Select a dictionary from the state and return it as an array of the values
     * @param prop define a key from the model to retrieve the corresponding value
     * or a method taking in parameters the state and return back the value you wantto retrieve
     * @returns the observable corresponding to your mapping or `EMPTY` Observable if it's not matching a string or function
     */
    public selectAsList$<U extends keyof T, P = any>(prop: ((state: T) => P) | U): Observable<P> {
        if (typeof prop === 'string') {
            return this._stateHolder$.pipe(map(state => this.mapToList(state[prop])), this.processPipe());
        }
        if (typeof prop === 'function') {
            return this._stateHolder$.pipe(map(state => this.mapToList(prop(state)), this.processPipe()));
        }
        return EMPTY;
    }

    private mapToList(value: any): any {
        if (value instanceof Array) {
            return value;
        }
        if (value instanceof Object) {
            return value instanceof Array ? value : Object.values(value);
        }
        return value;
    }

    private devMode(): void {
        this._stateHolder$
            .pipe(distinctUntilChanged())
            .subscribe({ next: m => console.log({ action: this._lastDispatchAction ?? 'initial', state: m }) });
    }

    private processPipe(): UnaryFunction<Observable<{}>, Observable<any>> {
        return pipe(
            filter(d => d !== null && d !== undefined),
            distinctUntilChanged(),
        );
    }

}

export type Action<T, S = any> = ((state: T, args: S) => T) | ((state: T) => T);

export type ActionFactory<T, A extends string, S = any> = Partial<Record<A, Action<T, S>>>;

export const createActions = <T, A extends string>(actions: ActionFactory<T, A>): ActionFactory<T, A> => actions

export const createSimpleState = <T, A extends string>(actions: ActionFactory<T, A>, initValues: T, devMode = true): SimpleStateHolder<T, A> => {
    return new SimpleStateHolder(actions, initValues, devMode);
}

export class SimpleStateHolder<T, A extends string> extends StateHolder<T, A> {
    constructor(
        actions: ActionFactory<T, A>,
        initValues: T,
        devMode = true,
    ) { super(actions, initValues, devMode); }
}
