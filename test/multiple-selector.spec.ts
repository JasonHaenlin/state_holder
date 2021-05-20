import { createAction, createBasicState, createSelector, SimpleStateHolder, stateHolderConfig } from './../src/index';
import { take } from 'rxjs/operators';

stateHolderConfig.logger = false;

describe('Create simple basic state holder with multiple properties', () => {
    interface SampleState {
        text: string;
        samples: number[];
    }

    const initSampleState: SampleState = {
        text: '',
        samples: [],
    }

    let state: SimpleStateHolder<SampleState>;

    beforeAll(() => {
        state = createBasicState(initSampleState);
    });


    test('should exist', () => {
        expect(state).toBeDefined();
    })

    test('should be able to select two props', () => {
        const textSelector = createSelector((state: SampleState): string => state.text);
        const samplesSelector = createSelector((state: SampleState): number[] => state.samples);
        state.select$(textSelector).pipe(take(1)).subscribe({
            next: (v) => {
                expect(v).toBe('');
            }
        });
        state.select$(samplesSelector).pipe(take(1)).subscribe({
            next: (v) => {
                expect(v.length).toBe(0);
            }
        });
    })

    test('should be able to dispatch a more complex action and see the new text and samples', () => {
        const setStateAction = createAction(
            'Set state',
            (state: SampleState, { text, samples }: { text: string, samples: number[] }): SampleState => ({ ...state, text, samples })
        );
        state.dispatch(setStateAction, { text: 'hello world', samples: [1, 2, 3] });

        const textSelector = createSelector((state: SampleState): string => state.text);
        const samplesSelector = createSelector((state: SampleState): number[] => state.samples);

        state.select$(textSelector).pipe(take(1)).subscribe({
            next: (v) => {
                expect(v).toBe('hello world');
            }
        });
        state.select$(samplesSelector).pipe(take(1)).subscribe({
            next: (v) => {
                expect(v.length).toBe(3);
            }
        });
    })

    test('should be able to dispatch a more complex action and see the new text and samples using array as args', () => {
        const setStateAction = createAction(
            'Set state',
            (state: SampleState, { text, samples }: { text: string, samples: number[] }): SampleState => ({ ...state, text, samples })
        );
        state.dispatch(setStateAction, { text: 'hello world', samples: [1, 2, 3, 4, 5] });

        const samplesSelector = createSelector((state: SampleState, ids: number[]): number[] => {
            const samples = [];
            for (const id of ids) {
                samples.push(state.samples[id]);
            }
            return samples;
        });

        state.select$(samplesSelector, [1, 2]).subscribe({
            next: (v) => { expect(v.toString()).toBe('2,3'); }
        });
        state.select$(samplesSelector, [1]).subscribe({
            next: (v) => { expect(v.toString()).toBe('2'); }
        });
        state.select$(samplesSelector, [1]).subscribe({
            next: (v) => { expect(v.toString()).toBe('2'); }
        });
        state.select$(samplesSelector, [3, 4]).subscribe({
            next: (v) => { expect(v.toString()).toBe('4,5'); }
        });
    })

    test('should be able to dispatch a more complex action and see the new text and samples using objects as args', () => {
        const setStateAction = createAction(
            'Set state',
            (state: SampleState, { text, samples }: { text: string, samples: number[] }): SampleState => ({ ...state, text, samples })
        );
        state.dispatch(setStateAction, { text: 'hello world', samples: [1, 2, 3, 4, 5] });

        const samplesIdsSelector = createSelector((state: SampleState, { id1, id2 }): string => {
            return `${state.samples[id1]},${state.samples[id2]}`;
        });

        state.select$(samplesIdsSelector, { id1: 1, id2: 2 }).subscribe({
            next: (v) => { expect(v).toBe('2,3'); }
        });
        state.select$(samplesIdsSelector, { id1: 3, id2: 4 }).subscribe({
            next: (v) => { expect(v).toBe('4,5'); }
        });
    })
})
