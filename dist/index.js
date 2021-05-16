"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleStateHolder = exports.createBasicState = exports.createSelector = exports.createAction = exports.stateHolderConfig = void 0;
const state_holder_1 = require("./state-holder");
exports.stateHolderConfig = {
    logger: true
};
/**
 * syntactic sugar to create a new action
 * @param label Name your action, only used in logging mode to have a more explicite name
 * @param action the action to dispatch
 * @returns a new action to use in the dispatch function of the state instance
 */
const createAction = (label, action) => ({ label, action });
exports.createAction = createAction;
/**
 * syntactic sugar to create a new selector
 * @param selector the select function
 * @returns a new selector to use with the select$ function of the state instance
 */
const createSelector = (selector) => (selector);
exports.createSelector = createSelector;
/**
 * syntactic sugar to create a new basic state holder. Usefull if you do not need to add any other behaviour to it, only dispatching and selecting outside the class is usefull to you.
 * @param initValues init value of the state
 * @returns a new basic state holder
 */
const createBasicState = (initValues) => {
    return new SimpleStateHolder(initValues);
};
exports.createBasicState = createBasicState;
class SimpleStateHolder extends state_holder_1.StateHolder {
    constructor(initValues) { super(initValues); }
}
exports.SimpleStateHolder = SimpleStateHolder;
//# sourceMappingURL=index.js.map