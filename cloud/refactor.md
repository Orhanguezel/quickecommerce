Belirtilen kodu veya modülü refactor et: $ARGUMENTS

## Refactoring Prensipleri

### 1. Önce Anla, Sonra Değiştir

- Mevcut kodu oku ve anla
- Test coverage'ı kontrol et
- Bağımlılıkları haritala
- Refactoring planı oluştur

### 2. Küçük Adımlarla İlerle

- Bir seferde bir değişiklik
- Her adımda çalışır durumda tut
- Sık sık commit at
- Breaking change'lerden kaçın

## Laravel Refactoring Patterns

### Fat Controller → Service Pattern

```php
// ÖNCE: Fat controller
class OrderController extends Controller
{
    public function store(Request $request)
    {
        // 100+ satır business logic
        $order = new Order();
        $order->user_id = auth()->id();
        // ... daha çok kod
        // Notification gönder
        // Email gönder
        // Stock güncelle
        return response()->json($order);
    }
}

// SONRA: Thin controller + Service
class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    public function store(StoreOrderRequest $request)
    {
        $order = $this->orderService->createOrder($request->validated());
        return response()->json([
            'status' => true,
            'data' => $order,
        ], 201);
    }
}

// app/Services/OrderService.php
class OrderService
{
    public function createOrder(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $order = Order::create($data);
            $this->updateStock($order);
            $this->sendNotifications($order);
            return $order;
        });
    }
}
```

### Direct Query → Repository Pattern

```php
// ÖNCE: Direct query in controller
public function index()
{
    $products = Product::where('status', true)
        ->with(['category', 'brand'])
        ->orderBy('created_at', 'desc')
        ->paginate(15);
}

// SONRA: Repository pattern
// app/Repositories/ProductRepository.php
class ProductRepository extends BaseRepository
{
    public function model(): string
    {
        return Product::class;
    }

    public function getActiveProducts(int $perPage = 15)
    {
        return $this->model
            ->where('status', true)
            ->with(['category', 'brand'])
            ->latest()
            ->paginate($perPage);
    }
}

// Controller
public function index(ProductRepository $repository)
{
    return response()->json([
        'status' => true,
        'data' => $repository->getActiveProducts(),
    ]);
}
```

### N+1 Query Fix

```php
// ÖNCE: N+1 problem
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->user->name; // Her order için ayrı query
    echo $order->items->count(); // Her order için ayrı query
}

// SONRA: Eager loading
$orders = Order::with(['user', 'items'])->get();
foreach ($orders as $order) {
    echo $order->user->name; // Önceden yüklendi
    echo $order->items->count(); // Önceden yüklendi
}
```

## Next.js Refactoring Patterns

### Large Component → Smaller Components

```typescript
// ÖNCE: 400+ satır component
export default function ProductListPage() {
    // State, hooks, handlers, render all in one
}

// SONRA: Ayrılmış components
// components/ProductList/ProductListPage.tsx (orchestration)
// components/ProductList/ProductTable.tsx
// components/ProductList/ProductFilters.tsx
// components/ProductList/ProductActions.tsx
// hooks/useProductList.ts
```

### Repeated API Calls → Custom Hook

```typescript
// ÖNCE: Her component'te tekrar
function Component1() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getProductList().then(setData).finally(() => setLoading(false));
    }, []);
}

// SONRA: Custom hook with Tanstack Query
// hooks/useProducts.ts
export function useProductList(params?: QueryParams) {
    return useQuery({
        queryKey: ['products', 'list', params],
        queryFn: () => getProductList(params),
    });
}

// Component
function Component1() {
    const { data, isLoading } = useProductList();
}
```

### Inline Styles → Tailwind Classes

```tsx
// ÖNCE
<div style={{ display: 'flex', gap: '16px', padding: '20px' }}>

// SONRA
<div className="flex gap-4 p-5">
```

## Refactoring Kontrol Listesi

### Başlamadan Önce
- [ ] Mevcut davranış anlaşıldı
- [ ] Test var mı? Yoksa önce yaz
- [ ] Bağımlılıklar belirlendi
- [ ] Git branch oluşturuldu

### Refactoring Sırasında
- [ ] Küçük adımlarla ilerle
- [ ] Her adımda build çalışıyor
- [ ] TypeScript/PHP hataları yok
- [ ] Var olan testler geçiyor

### Bitirdikten Sonra
- [ ] Kod daha okunabilir mi?
- [ ] Tekrar azaldı mı?
- [ ] Performans etkilenmedi mi?
- [ ] Breaking change var mı?

## Kaçınılması Gerekenler

- Refactoring + feature aynı commit'te
- Testler olmadan büyük refactoring
- Her şeyi bir seferde değiştirmek
- Public API'yi bozmak
- Premature optimization
