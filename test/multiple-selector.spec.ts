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
})
