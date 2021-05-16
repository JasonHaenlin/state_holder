import { ActionDef, StateHolder } from "./state-holder";

export { StateHolder }

export const stateHolderConfig = {
    logger: true
}

export type Action<T, I = any> = ((state: T) => T) | ((state: T, args: I) => T);
/**
 * syntactic sugar to create a new action
 * @param label Name your action, only used in logging mode to have a more explicite name
 * @param action the action to dispatch
 * @returns a new action to use in the dispatch function of the state instance
 */
export const createAction = <T, I>(label: string, action: Action<T, I>): ActionDef<T, I> => ({ label, action })

export type Selector<T, O, I = any> = ((state: T) => O) | ((state: T, args: I) => O);
/**
 * syntactic sugar to create a new selector
 * @param selector the select function
 * @returns a new selector to use with the select$ function of the state instance
 */
export const createSelector = <T, O, I = any>(selector: Selector<T, O, I>): Selector<T, O, I> => (selector)

/**
 * syntactic sugar to create a new basic state holder. Usefull if you do not need to add any other behaviour to it, only dispatching and selecting outside the class is usefull to you.
 * @param initValues init value of the state
 * @returns a new basic state holder
 */
export const createBasicState = <T>(initValues: T): SimpleStateHolder<T> => {
    return new SimpleStateHolder(initValues);
}

export class SimpleStateHolder<T> extends StateHolder<T> {
    constructor(initValues: T) { super(initValues); }
}
