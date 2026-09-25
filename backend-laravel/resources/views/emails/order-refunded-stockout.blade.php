<!doctype html>
<html lang="tr" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $siteName }} — Sipariş İadesi #{{ $primaryOrderId ?? '' }}</title>
    <style>
        body { margin:0; padding:0; background:#f4f4f4; font-family: Arial, sans-serif; color:#1f2937; }
        .container { width:100%; padding:32px 0; }
        .box { width:100%; max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08); }
        .header { background:#0ea5e9; padding:28px 24px; text-align:center; color:#fff; }
        .header h1 { margin:8px 0 0; font-size:22px; font-weight:700; }
        .header p { margin:0; font-size:14px; opacity:.92; }
        .body { padding:28px 24px; }
        .body p { line-height:1.55; margin:0 0 14px; font-size:14px; color:#374151; }
        .notice { background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:14px 16px; margin:16px 0; font-size:14px; color:#1e3a8a; }
        .summary { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:14px; margin:16px 0; font-size:14px; }
        .order-head { font-weight:700; color:#111827; font-size:14px; padding:6px 0 8px; border-bottom:1px solid #e5e7eb; margin-bottom:6px; }
        .item { padding:10px 0; border-bottom:1px solid #f3f4f6; font-size:13px; }
        .item:last-child { border-bottom:0; }
        .item .name { font-weight:600; color:#111827; margin-bottom:2px; }
        .item .meta { color:#6b7280; }
        .total { display:flex; justify-content:space-between; font-weight:700; font-size:16px; border-top:1px solid #e5e7eb; padding-top:10px; margin-top:8px; }
        .refund-method { font-size:13px; color:#374151; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 14px; margin:16px 0; }
        .cta { display:block; width:fit-content; margin:22px auto 0; padding:12px 28px; background:#0ea5e9; color:#fff !important; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; }
        .footer { padding:18px 24px; background:#f9fafb; text-align:center; font-size:12px; color:#6b7280; }
        .footer a { color:#0ea5e9; text-decoration:none; }
    </style>
</head>
<body>
<div class="container">
    <div class="box">
        <div class="header">
            <p>Siparişiniz iade edildi</p>
            <h1>#{{ $primaryOrderId ?? $master->id }}</h1>
        </div>

        <div class="body">
            <p>Merhaba {{ optional($master->customer)->first_name }},</p>

            <p>
                {{ $isPartial ? 'Siparişinizdeki bazı ürünler' : 'Sipariş ettiğiniz ürün(ler)' }},
                tedarikçi stoğunda da bulunmadığı için maalesef temin edilemedi. Bu nedenle
                ilgili tutarı <strong>otomatik olarak iade ettik</strong>. Yaşattığımız bu durum
                için özür dileriz.
            </p>

            <div class="notice">
                İade işleminiz tarafımızca başlatılmıştır; herhangi bir işlem yapmanıza gerek yoktur.
            </div>

            <h3 style="margin:18px 0 8px; font-size:15px;">İade Edilen Ürünler</h3>
            <div class="summary">
                @foreach ($refundedOrders as $ro)
                    <div class="order-head">Sipariş #{{ $ro->id }}@if($ro->store) — {{ $ro->store->name }}@endif</div>
                    @foreach ($ro->orderDetail ?? [] as $item)
                        <div class="item">
                            <div class="name">{{ $item->product?->name ?? '—' }}</div>
                            <div class="meta">
                                {{ $item->productVariant?->variant_slug ?? '' }}
                                · Adet: {{ $item->quantity ?? 1 }}
                                · Tutar: {{ number_format((float) ($item->total_price ?? $item->price ?? 0), 2, ',', '.') }} ₺
                            </div>
                        </div>
                    @endforeach
                @endforeach

                <div class="total">
                    <span>İade Edilen Toplam Tutar</span>
                    <span>{{ number_format((float) $refundAmount, 2, ',', '.') }} ₺</span>
                </div>
            </div>

            <div class="refund-method">
                <strong>İade nasıl yapılır?</strong><br>
                İade tutarı, ödemeyi yaptığınız kart/hesaba iade edilir. Bankanıza bağlı olarak
                hesabınıza yansıması genellikle <strong>3-7 iş günü</strong> sürer.
            </div>

            <p>
                Dilerseniz benzer ürünlere göz atabilir veya stok durumu hakkında bilgi almak için
                bizimle iletişime geçebilirsiniz. Anlayışınız için teşekkür ederiz.
            </p>

            <a href="{{ rtrim($frontendUrl, '/') }}/tr/destek" class="cta">Bize Ulaşın</a>

            <p style="margin-top:22px; font-size:13px; color:#6b7280;">
                Bu e-postayı doğrudan yanıtlayarak da bize ulaşabilirsiniz.
            </p>
        </div>

        <div class="footer">
            <p style="margin:0 0 4px;">{{ $siteName }} olarak anlayışınız için teşekkür ederiz.</p>
            <p style="margin:0;">© {{ date('Y') }} {{ $siteName }}</p>
        </div>
    </div>
</div>
</body>
</html>
