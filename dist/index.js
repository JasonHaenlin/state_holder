import { StateHolder } from "./state-holder";
export { StateHolder };
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