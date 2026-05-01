<!doctype html>
<html lang="tr" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $siteName }} — Yeni Sipariş #{{ $order->id }}</title>
    <style>
        body { margin:0; padding:0; background:#f4f4f4; font-family: Arial, sans-serif; color:#1f2937; }
        .container { width:100%; padding:32px 0; }
        .box { width:100%; max-width:640px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08); }
        .header { background:#1d4ed8; padding:24px; color:#fff; }
        .header h1 { margin:0; font-size:20px; font-weight:700; }
        .header p { margin:4px 0 0; font-size:13px; opacity:.92; }
        .body { padding:24px; font-size:14px; color:#374151; }
        .grid { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:18px; }
        .card { flex:1; min-width:240px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px 14px; }
        .card h4 { margin:0 0 6px; font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; }
        .card .v { font-size:14px; color:#111827; font-weight:600; line-height:1.4; }
        .items { border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; margin-bottom:14px; }
        .items table { width:100%; border-collapse:collapse; font-size:13px; }
        .items th { background:#f9fafb; padding:9px 10px; text-align:left; font-weight:600; color:#374151; border-bottom:1px solid #e5e7eb; }
        .items td { padding:9px 10px; border-bottom:1px solid #f3f4f6; }
        .items tr:last-child td { border-bottom:0; }
        .totals { margin-top:8px; font-size:14px; }
        .totals .row { display:flex; justify-content:space-between; padding:4px 0; }
        .totals .row.total { font-weight:700; border-top:1px solid #e5e7eb; padding-top:8px; margin-top:4px; }
        .cta { display:inline-block; margin-top:18px; padding:10px 22px; background:#1d4ed8; color:#fff !important; text-decoration:none; border-radius:8px; font-weight:600; font-size:13px; }
        .footer { padding:14px 24px; background:#f9fafb; text-align:center; font-size:11px; color:#6b7280; }
    </style>
</head>
<body>
<div class="container">
    <div class="box">
        <div class="header">
            <h1>Yeni Sipariş #{{ $order->id }}</h1>
            <p>{{ \Illuminate\Support\Carbon::parse($order->created_at)->format('d.m.Y H:i') }} · {{ $order->store?->name ?? '—' }}</p>
        </div>

        <div class="body">
            <div class="grid">
                <div class="card">
                    <h4>Müşteri</h4>
                    <div class="v">
                        {{ trim((string) ($order->orderMaster?->customer?->first_name ?? '') . ' ' . ($order->orderMaster?->customer?->last_name ?? '')) }}
                    </div>
                    <div style="font-size:12px; color:#6b7280; margin-top:2px;">
                        {{ $order->orderMaster?->customer?->email ?? '—' }}<br>
                        {{ $order->orderMaster?->customer?->phone ?? '' }}
                    </div>
                </div>
                <div class="card">
                    <h4>Mağaza</h4>
                    <div class="v">{{ $order->store?->name ?? '—' }}</div>
                    <div style="font-size:12px; color:#6b7280; margin-top:2px;">ID: {{ $order->store_id }}</div>
                </div>
            </div>

            <div class="items">
                <table>
                    <thead>
                        <tr>
                            <th>Ürün</th>
                            <th>Varyant</th>
                            <th style="text-align:right;">Adet</th>
                            <th style="text-align:right;">Tutar</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($order->orderProduct ?? [] as $item)
                            <tr>
                                <td>{{ $item->product?->name ?? '—' }}</td>
                                <td style="color:#6b7280;">{{ $item->productVariant?->variant_slug ?? '—' }}</td>
                                <td style="text-align:right;">{{ $item->quantity ?? 1 }}</td>
                                <td style="text-align:right;">{{ number_format((float) ($item->total_price ?? $item->price ?? 0), 2, ',', '.') }} ₺</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div class="totals">
                <div class="row total">
                    <span>Toplam</span>
                    <span>{{ number_format((float) ($order->orderMaster?->total_amount ?? $order->total_amount ?? 0), 2, ',', '.') }} ₺</span>
                </div>
            </div>

            @if ($order->orderMaster?->orderAddress)
                <div class="card" style="margin-top:14px;">
                    <h4>Teslimat Adresi</h4>
                    <div style="font-size:13px; color:#374151; line-height:1.55;">
                        <strong>{{ $order->orderMaster->orderAddress->name ?? '' }}</strong>
                        @if ($order->orderMaster->orderAddress->contact_number)
                            · {{ $order->orderMaster->orderAddress->contact_number }}
                        @endif
                        <br>
                        {{ $order->orderMaster->orderAddress->address ?? '' }}<br>
                        {{ $order->orderMaster->orderAddress->district_name ?? '' }} / {{ $order->orderMaster->orderAddress->city_name ?? '' }}
                        @if ($order->orderMaster->orderAddress->postal_code) — {{ $order->orderMaster->orderAddress->postal_code }} @endif
                    </div>
                </div>
            @endif

            <a href="{{ rtrim($adminUrl, '/') }}/tr/admin/orders/{{ $order->order_master_id ?? $order->id }}" class="cta">Adminde Aç</a>
        </div>

        <div class="footer">{{ $siteName }} · Yönetici Bildirimi</div>
    </div>
</div>
</body>
</html>
