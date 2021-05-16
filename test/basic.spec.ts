import { createAction, createBasicState, createSelector, SimpleStateHolder, stateHolderConfig } from './../src/index';
import { take } from 'rxjs/operators';



stateHolderConfig.logger = false;

describe('Create simple basic state holder', () => {
    interface SampleState {
        text: string;
    }

    const initSampleState: SampleState = {
        text: '',
    }

    let state: SimpleStateHolder<SampleState>;

    beforeAll(() => {
        state = createBasicState(initSampleState);
    });


    test('should exist', () => {
        expect(state).toBeDefined();
    })

    test('should be able to select a prop', () => {
        const textSelector = createSelector((state: SampleState): string => state.text);
        state.select$(textSelector).pipe(take(1)).subscribe({
            next: (v) => {
                expect(v).toBe('');
            }
        });
    })

    test('should be able to dispatch an action and see the new text', () => {
        const setTextAction = createAction(
            'Set text',
            (state: SampleState, { text }: { text: string }): SampleState => ({ ...state, text })
        );
        state.dispatch(setTextAction, { text: 'sample' });
        const textSelector = createSelector((state: SampleState): string => state.text);
        state.select$(textSelector).pipe(take(1)).subscribe({
            next: (v) => {
                expect(v).toBe('sample');
            }
        });
    })
})
