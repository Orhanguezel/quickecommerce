<!doctype html>
<html lang="tr" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $siteName }} — Sipariş Onayı #{{ $order->id }}</title>
    <style>
        body { margin:0; padding:0; background:#f4f4f4; font-family: Arial, sans-serif; color:#1f2937; }
        .container { width:100%; padding:32px 0; }
        .box { width:100%; max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08); }
        .header { background:#16a34a; padding:28px 24px; text-align:center; color:#fff; }
        .header h1 { margin:8px 0 0; font-size:22px; font-weight:700; }
        .header p { margin:0; font-size:14px; opacity:.92; }
        .body { padding:28px 24px; }
        .body p { line-height:1.55; margin:0 0 14px; font-size:14px; color:#374151; }
        .summary { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:14px; margin:16px 0; font-size:14px; }
        .summary div { display:flex; justify-content:space-between; padding:4px 0; }
        .summary div.total { font-weight:700; font-size:16px; border-top:1px solid #e5e7eb; padding-top:8px; margin-top:4px; }
        .item { padding:10px 0; border-bottom:1px solid #f3f4f6; font-size:13px; }
        .item:last-child { border-bottom:0; }
        .item .name { font-weight:600; color:#111827; margin-bottom:2px; }
        .item .meta { color:#6b7280; }
        .address { background:#f9fafb; border-radius:8px; padding:12px 14px; font-size:13px; color:#374151; line-height:1.5; }
        .cta { display:block; width:fit-content; margin:22px auto 0; padding:12px 28px; background:#16a34a; color:#fff !important; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; }
        .footer { padding:18px 24px; background:#f9fafb; text-align:center; font-size:12px; color:#6b7280; }
        .footer a { color:#16a34a; text-decoration:none; }
    </style>
</head>
<body>
<div class="container">
    <div class="box">
        <div class="header">
            <p>Siparişiniz başarıyla alındı</p>
            <h1>#{{ $order->id }}</h1>
        </div>

        <div class="body">
            <p>Merhaba {{ optional($order->orderMaster?->customer)->first_name }},</p>
            <p>Siparişiniz {{ $siteName }} tarafından alındı ve hazırlanmak üzere işleme konuldu. Aşağıda sipariş detaylarınızı bulabilirsiniz.</p>

            <h3 style="margin:18px 0 8px; font-size:15px;">Sipariş Özeti</h3>
            <div class="summary">
                @foreach ($order->orderDetail ?? [] as $item)
                    <div class="item">
                        <div class="name">{{ $item->product?->name ?? '—' }}</div>
                        <div class="meta">
                            {{ $item->productVariant?->variant_slug ?? '' }}
                            · Adet: {{ $item->quantity ?? 1 }}
                            · Tutar: {{ number_format((float) ($item->total_price ?? $item->price ?? 0), 2, ',', '.') }} ₺
                        </div>
                    </div>
                @endforeach

                <div class="total">
                    <span>Toplam</span>
                    <span>{{ number_format((float) ($order->orderMaster?->total_amount ?? $order->total_amount ?? 0), 2, ',', '.') }} ₺</span>
                </div>
            </div>

            @if ($order->orderMaster?->orderAddress)
                <h3 style="margin:18px 0 8px; font-size:15px;">Teslimat Adresi</h3>
                <div class="address">
                    <strong>{{ $order->orderMaster->orderAddress->name ?? '' }}</strong><br>
                    {{ $order->orderMaster->orderAddress->address ?? '' }}<br>
                    {{ $order->orderMaster->orderAddress->district_name ?? '' }} / {{ $order->orderMaster->orderAddress->city_name ?? '' }}
                    @if ($order->orderMaster->orderAddress->postal_code)
                        — {{ $order->orderMaster->orderAddress->postal_code }}
                    @endif
                    <br>
                    @if ($order->orderMaster->orderAddress->contact_number)
                        Tel: {{ $order->orderMaster->orderAddress->contact_number }}
                    @endif
                </div>
            @endif

            <a href="{{ rtrim($frontendUrl, '/') }}/tr/siparis/{{ $order->id }}" class="cta">Siparişi Görüntüle</a>

            <p style="margin-top:22px; font-size:13px; color:#6b7280;">
                Siparişinizle ilgili bir sorunuz varsa bu e-postayı yanıtlayabilir veya
                <a href="{{ rtrim($frontendUrl, '/') }}/tr/destek" style="color:#16a34a;">destek</a> sayfamızdan bize ulaşabilirsiniz.
            </p>
        </div>

        <div class="footer">
            <p style="margin:0 0 4px;">{{ $siteName }} alışveriş yaptığınız için teşekkür ederiz.</p>
            <p style="margin:0;">© {{ date('Y') }} {{ $siteName }}</p>
        </div>
    </div>
</div>
</body>
</html>
