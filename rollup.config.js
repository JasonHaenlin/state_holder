import dts from 'rollup-plugin-dts';

export default [
    {
        input: 'dist/index.js',
        output: {
            file: 'index.js'
        },
        external: ['rxjs', 'rxjs/operators']
    },
    {
        input: 'dist/index.d.ts',
        output: {
            file: 'index.d.ts'
        },
        plugins: [dts()],
        external: ['rxjs', 'rxjs/operators']
    }
]
