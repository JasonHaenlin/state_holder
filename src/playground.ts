import { createAction, createBasicState, createSelector, stateHolderConfig } from "./index";

stateHolderConfig.logger = false;

interface SampleState {
    text: string;
    samples: number[];
}

const initSampleState: SampleState = {
    text: '',
    samples: [],
}

const state = createBasicState(initSampleState);

const textSelector = createSelector((state: SampleState): string => state.text);
const samplesSelector = createSelector((state: SampleState): number[] => state.samples);

state.select$(textSelector).subscribe({
    next: (v) => {
        console.log(v);
    }
});
state.select$(samplesSelector).subscribe({
    next: (v) => {
        console.log(v);
    }
});

const setStateAction = createAction(
    'Set state',
    (state: SampleState, { text, samples }: { text: string, samples: number[] }): SampleState => ({ ...state, text, samples })
);
state.dispatch(setStateAction, { text: 'hello world', samples: [1, 2, 3] });
