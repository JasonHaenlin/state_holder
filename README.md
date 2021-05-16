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
}
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
const productSelector = createSelector((state: ProductState): string[] => state.product);
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

# Dependency

`rxjs: ^7.0.1`

# Note
I like to extend my **Angular services** with the **state-holder** when I do need a big Store like **NgRx** in my app.

# Todo
- [x] : Basic implementation
- [ ] : Arguments to selector (eg: to get by id)
- [ ] : ...
