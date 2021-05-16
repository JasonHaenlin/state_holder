"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleStateHolder = exports.createBasicState = exports.createSelector = exports.createAction = exports.stateHolderConfig = exports.StateHolder = void 0;
var state_holder_1 = require("./state-holder");
Object.defineProperty(exports, "StateHolder", { enumerable: true, get: function () { return state_holder_1.StateHolder; } });
exports.stateHolderConfig = {
    logger: true
};
/**
 * syntactic sugar to create a new action
 * @param label Name your action, only used in logging mode to have a more explicite name
 * @param action the action to dispatch
 * @returns a new action to use in the dispatch function of the state instance
 */
var createAction = function (label, action) { return ({ label: label, action: action }); };
exports.createAction = createAction;
/**
 * syntactic sugar to create a new selector
 * @param selector the select function
 * @returns a new selector to use with the select$ function of the state instance
 */
var createSelector = function (selector) { return (selector); };
exports.createSelector = createSelector;
/**
 * syntactic sugar to create a new basic state holder. Usefull if you do not need to add any other behaviour to it, only dispatching and selecting outside the class is usefull to you.
 * @param initValues init value of the state
 * @returns a new basic state holder
 */
var createBasicState = function (initValues) {
    return new SimpleStateHolder(initValues);
};
exports.createBasicState = createBasicState;
var SimpleStateHolder = /** @class */ (function (_super) {
    __extends(SimpleStateHolder, _super);
    function SimpleStateHolder(initValues) {
        return _super.call(this, initValues) || this;
    }
    return SimpleStateHolder;
}(state_holder_1.StateHolder));
exports.SimpleStateHolder = SimpleStateHolder;
//# sourceMappingURL=index.js.map