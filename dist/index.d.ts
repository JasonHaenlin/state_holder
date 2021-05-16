import { ActionDef, StateHolder } from './state-holder.ts';
export { StateHolder } from './state-holder.ts';

declare const stateHolderConfig: {
    logger: boolean;
};
declare type Action<T, I = any> = ((state: T) => T) | ((state: T, args: I) => T);
/**
 * syntactic sugar to create a new action
 * @param label Name your action, only used in logging mode to have a more explicite name
 * @param action the action to dispatch
 * @returns a new action to use in the dispatch function of the state instance
 */
declare const createAction: <T, I>(label: string, action: Action<T, I>) => ActionDef<T, I>;
declare type Selector<T, O, I = any> = ((state: T) => O) | ((state: T, args: I) => O);
/**
 * syntactic sugar to create a new selector
 * @param selector the select function
 * @returns a new selector to use with the select$ function of the state instance
 */
declare const createSelector: <T, O, I = any>(selector: Selector<T, O, I>) => Selector<T, O, I>;
/**
 * syntactic sugar to create a new basic state holder. Usefull if you do not need to add any other behaviour to it, only dispatching and selecting outside the class is usefull to you.
 * @param initValues init value of the state
 * @returns a new basic state holder
 */
declare const createBasicState: <T>(initValues: T) => SimpleStateHolder<T>;
declare class SimpleStateHolder<T> extends StateHolder<T> {
    constructor(initValues: T);
}

export { Action, Selector, SimpleStateHolder, createAction, createBasicState, createSelector, stateHolderConfig };
