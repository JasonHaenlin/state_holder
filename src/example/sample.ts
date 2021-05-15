import { createActions, createSimpleState } from './../index';
import { StateHolder } from '../index';

interface SampleState {
    text: string;
}

const initSampleState: SampleState = {
    text: '',
}

enum SampleAction {
    setText = 'Set text',
}

const sampleStateAction = createActions<SampleState, SampleAction>({
    [SampleAction.setText]: (state: SampleState, text: string): SampleState => {
        return { ...state, text };
    }
});

const sampleService = createSimpleState(sampleStateAction, initSampleState);

class complexService extends StateHolder<SampleState, SampleAction> {
    constructor() { super(sampleStateAction, initSampleState); }
}
