import { createAction, createBasicState, createSelector, SimpleStateHolder, stateHolderConfig } from './../src/index';
import { sample, take } from 'rxjs/operators';

stateHolderConfig.logger = false;

describe('Create simple basic state holder with parameterized selectors', () => {
    interface SampleState {
        samples: string[];
        dict: {};
    }

    const initSampleState: SampleState = {
        samples: ['hello', 'world', '!'],
        dict: { 'first': 1, 'second': 2 }
    }

    let state: SimpleStateHolder<SampleState>;

    beforeAll(() => {
        state = createBasicState(initSampleState);
    });

    test('should be able to select a prop with number parameters', () => {
        const selectSample = createSelector((state: SampleState, id: number) => state.samples[id]);
        state.select$(selectSample, 0).subscribe({ next: s => expect(s).toBe('hello') });
        state.select$(selectSample, 1).subscribe({ next: s => expect(s).toBe('world') });
        state.select$(selectSample, 0).subscribe({ next: s => expect(s).toBe('hello') });
        state.select$(selectSample, 2).subscribe({ next: s => expect(s).toBe('!') });
        state.select$(selectSample, 1).subscribe({ next: s => expect(s).toBe('world') });

        expect(state.select$(selectSample, 0)).toMatchObject(state.select$(selectSample, 0));
        expect(state.select$(selectSample, 1)).toMatchObject(state.select$(selectSample, 1));
        expect(state.select$(selectSample, 2)).toMatchObject(state.select$(selectSample, 2));
        expect(state.select$(selectSample, 0)).not.toMatchObject(state.select$(selectSample, 1));
        expect(state.select$(selectSample, 1)).not.toMatchObject(state.select$(selectSample, 2));
    })

    test('should be able to select a prop with string parameters', () => {
        const selectSample = createSelector((state: SampleState, key: string) => state.dict[key]);
        state.select$(selectSample, 'first').subscribe({ next: s => expect(s).toBe(1) });
        state.select$(selectSample, 'second').subscribe({ next: s => expect(s).toBe(2) });
        state.select$(selectSample, 'first').subscribe({ next: s => expect(s).toBe(1) });

        expect(state.select$(selectSample, 'first')).toMatchObject(state.select$(selectSample, 'first'));
        expect(state.select$(selectSample, 'second')).toMatchObject(state.select$(selectSample, 'second'));
        expect(state.select$(selectSample, 'first')).not.toMatchObject(state.select$(selectSample, 'second'));
    })

    test('should be able to select a prop with array parameters', () => {
        const selectSamples = createSelector((state: SampleState, ids: number[]) => {
            const samples = [];
            for (const id of ids) {
                samples.push(state.samples[id]);
            }
            return samples;
        });
        state.select$(selectSamples, [0]).subscribe({ next: s => expect(s.toString()).toBe('hello') });
        state.select$(selectSamples, [0, 1, 2]).subscribe({ next: s => expect(s.toString()).toBe('hello,world,!') });
        state.select$(selectSamples, [0, 2]).subscribe({ next: s => expect(s.toString()).toBe('hello,!') });
        state.select$(selectSamples, [1, 2]).subscribe({ next: s => expect(s.toString()).toBe('world,!') });

        expect(state.select$(selectSamples, [0])).toMatchObject(state.select$(selectSamples, [0]));
        expect(state.select$(selectSamples, [0, 1])).toMatchObject(state.select$(selectSamples, [0, 1]));
        expect(state.select$(selectSamples, [0, 1, 2])).toMatchObject(state.select$(selectSamples, [0, 1, 2]));
        expect(state.select$(selectSamples, [1, 0])).toMatchObject(state.select$(selectSamples, [1, 0]));
        expect(state.select$(selectSamples, [0])).not.toMatchObject(state.select$(selectSamples, [1, 2]));
        expect(state.select$(selectSamples, [0])).not.toMatchObject(state.select$(selectSamples, [0, 1, 2]));
        expect(state.select$(selectSamples, [0])).not.toMatchObject(state.select$(selectSamples, [2]));
    })

    test('should be able to select a prop with object parameters', () => {
        const selectSamples = createSelector((state: SampleState, { id, key }: { id: number, key: string }) => {
            return {
                id: state.samples[id],
                key: state.dict[key]
            };
        });

        state.select$(selectSamples, { id: 0, key: 'first' }).subscribe({
            next: s => { expect(s.id).toBe('hello'); expect(s.key).toBe(1); }
        });
        state.select$(selectSamples, { id: 2, key: 'second' }).subscribe({
            next: s => { expect(s.id).toBe('!'); expect(s.key).toBe(2); }
        });
        expect(state.select$(selectSamples, { id: 0, key: 'first' })).toMatchObject(state.select$(selectSamples, { id: 0, key: 'first' }));
        expect(state.select$(selectSamples, { id: 0, key: 'first' })).not.toMatchObject(state.select$(selectSamples, { id: 1, key: 'first' }));
        expect(state.select$(selectSamples, { id: 0, key: 'second' })).not.toMatchObject(state.select$(selectSamples, { id: 0, key: 'first' }));
        expect(state.select$(selectSamples, { id: 1, key: 'second' })).not.toMatchObject(state.select$(selectSamples, { id: 0, key: 'first' }));
    })
})
