'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var stateHolder_ts = require('./state-holder.ts');

const stateHolderConfig = {
  logger: true
};
const createAction = (label, action) => ({label, action});
const createSelector = (selector) => selector;
const createBasicState = (initValues) => {
  return new SimpleStateHolder(initValues);
};
class SimpleStateHolder extends stateHolder_ts.StateHolder {
  constructor(initValues) {
    super(initValues);
  }
}

Object.defineProperty(exports, 'StateHolder', {
    enumerable: true,
    get: function () {
        return stateHolder_ts.StateHolder;
    }
});
exports.SimpleStateHolder = SimpleStateHolder;
exports.createAction = createAction;
exports.createBasicState = createBasicState;
exports.createSelector = createSelector;
exports.stateHolderConfig = stateHolderConfig;
//# sourceMappingURL=index.js.map
