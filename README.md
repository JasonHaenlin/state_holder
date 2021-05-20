# State Holder
state holder is a "mini store like" using RxJs

# Install

```sh
npm install @jeiraon/state-holder
```

# Example

## Basic

Creating a new basic state holder
```ts
// structure of the state
interface SampleState {
    text: string;
}
// init state (when instantiating the class)
const initSampleState: SampleState = {
    text: '',
}
// create an action
const setTextAction = createAction(
        'Set text',
        (state: SampleState, { text }: { text: string }): SampleState => ({ ...state, text })
);
// create a selector
const textSelector = createSelector((state: SampleState): string => state.text);
// instiate a new basic state holder
const state = createBasicState(initSampleState);
// dispatch and select example
state.dispatch(setTextAction, { text: 'sample' });
state.select$(textSelector).subscribe({next: (v) => console.log(v)})
```
Using the state holder anywhere you need to change or select a specific state
```ts
// dispatch and select example
state.dispatch(setTextAction, { text: 'sample' });
state.select$(textSelector).subscribe({next: (v) => console.log(v)})
```

## Using angular Service for more complexe behaviours

```ts
// structure of the state
interface ProductState {
    products: string[];
}
// init state (when instantiating the class)
const initProductState: ProductState = {
    products: [],
};
// create an action
const addProductAction = createAction(
        'Add product',
        (state: ProductState, { product }: { product: string }): ProductState => ({
            ...state,
            products: [
                ...state.products,
                product
            ]
        })
);
// create a selector
const productSelector = createSelector((state: ProductState): string[] => state.products);
```

In a service
```ts
@Injectable({
  providedIn: 'root',
})
class ProductService extends StateHolder<ProductState> {
    constructor(http: HttpClient){
        super(initProductState);
    }

    public getProductById(id: string): void {
        this.http.get<string>(`localhost:3000/product/${id}`)
            .pipe(take(1))
            .subscribe((product:string) => {
                this.dispatch(addProductAction, { product });
            })
    }
}
```

In a component
```ts
@Component({
  templateUrl: './productList.component.html',
  styleUrls: ['./productList.component.scss']
})
export class ProductListComponent implements OnInit {
    // use `async` pipe in html to subscribe to it and use the data
    public products$: Observable<string[]> = this.productService.select$(productSelector);

    constructor(public productService: ProductService) {}

    ngOnInit(): void {}
}
```

## Parameterized Selector

```ts
// Primitive (number, string)
const selectSample = createSelector((state: SampleState, id: number) => state.samples[id]);
state.select$(selectSample, 0).subscribe({ next: s => console.log(s) });

// Array
const selectSamples = createSelector((state: SampleState, ids: number[]) => {
    const samples = [];
    for (const id of ids) {
        samples.push(state.samples[id]);
    }
    return samples;
});

state.select$(selectSamples, [0, 2]).subscribe({ next: s => console.log(s)});

// Object
const selectSamples = createSelector((state: SampleState, { id, key }: { id: number, key: string }) => {
    return {
        id: state.samples[id],
        key: state.dict[key]
    };
});

state.select$(selectSamples, { id: 0, key: 'first' }).subscribe({next: s => console.log(s)});
```

# Dependency

`rxjs: ^6.6.0`

# Note
I like to extend my **Angular services** with the **state-holder** when I do need a big Store like **NgRx** in my app.

# Todo
- [x] : Basic implementation
- [x] : Arguments to selector (eg: to get by id)
- [ ] : ...
