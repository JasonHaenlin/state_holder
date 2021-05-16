import { StateHolder } from './state-holder.ts';
export { StateHolder } from './state-holder.ts';

const stateHolderConfig = {
  logger: true
};
const createAction = (label, action) => ({label, action});
const createSelector = (selector) => selector;
const createBasicState = (initValues) => {
  return new SimpleStateHolder(initValues);
};
class SimpleStateHolder extends StateHolder {
  constructor(initValues) {
    super(initValues);
  }
}

export { SimpleStateHolder, createAction, createBasicState, createSelector, stateHolderConfig };
//# sourceMappingURL=index.mjs.map
