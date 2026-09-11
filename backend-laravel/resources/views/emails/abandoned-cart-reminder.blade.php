<!doctype html>
<html lang="{{ $cart->locale ?? 'tr' }}" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ com_option_get('com_site_title') . ' ' . __('Mail') }}</title>
    <style>
        body { margin:0; padding:0; background:#f4f4f4; font-family: Arial, sans-serif; color:#1f2937; }
        .container { width:100%; padding:40px 0; }
        .box { width:100%; max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08); }
        .header { background:#4F46E5; padding:28px 24px; text-align:center; color:#fff; }
        .header.stage-3 { background: linear-gradient(135deg,#dc2626,#ea580c); }
        .header h1 { margin:8px 0 0; font-size:22px; font-weight:700; letter-spacing:-.01em; }
        .header p { margin:0; font-size:14px; opacity:.9; }
        .body { padding:28px 24px; }
        .body p { line-height:1.55; margin:0 0 14px; font-size:14px; color:#374151; }
        .item { display:flex; gap:12px; padding:12px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:10px; }
        .item img { width:64px; height:64px; border-radius:6px; object-fit:cover; background:#f3f4f6; }
        .item-meta { flex:1; font-size:13px; }
        .item-meta .name { font-weight:600; color:#111827; margin-bottom:4px; }
        .item-meta .qty { color:#6b7280; }
        .totals { margin-top:16px; padding:14px; background:#f9fafb; border-radius:8px; font-size:14px; font-weight:600; display:flex; justify-content:space-between; }
        .coupon-box { margin:20px 0; padding:18px; border:2px dashed #f59e0b; background:#fef3c7; text-align:center; border-radius:8px; }
        .coupon-box .label { font-size:11px; letter-spacing:.1em; color:#92400e; margin-bottom:6px; }
        .coupon-box .code { font-size:22px; font-weight:800; letter-spacing:.08em; color:#78350f; }
        .cta { display:block; width:fit-content; margin:24px auto 0; padding:14px 32px; background:#4F46E5; color:#fff !important; text-decoration:none; border-radius:8px; font-weight:600; font-size:15px; }
        .cta.stage-3 { background:#dc2626; }
        .footer { padding:18px 24px; background:#f9fafb; text-align:center; font-size:12px; color:#6b7280; }
        .footer a { color:#4F46E5; text-decoration:none; }
    </style>
</head>
<body>
<div class="container">
    <div class="box">
        <div class="header stage-{{ $stage }}">
            <h1>
                @if($stage === 1) {{ __('Sepetinizi unuttunuz mu?') }}
                @elseif($stage === 2 && !empty($couponCode)) {{ __('Size özel bir indirim hazırladık!') }}
                @elseif($stage === 2) {{ __('Sepetiniz hâlâ hazır') }}
                @else {{ __('Son şans!') }}
                @endif
            </h1>
            <p>
                @if($stage === 1) {{ __('Seçtiğiniz ürünler hâlâ sepetinizde.') }}
                @elseif($stage === 2 && !empty($couponCode)) {{ __('Kupon kodunuz ile avantajlı fiyata tamamlayın.') }}
                @elseif($stage === 2) {{ __('Ürünlerinize kaldığınız yerden devam edin.') }}
                @else {{ __('Stok durumu değişmeden önce sepetinizi yeniden kontrol edin.') }}
                @endif
            </p>
        </div>

        <div class="body">
            <p>{{ __('Merhaba') }}{{ $cart->email ? ' ' . explode('@', $cart->email)[0] : '' }},</p>
            <p>
                @if($stage === 1)
                    {{ __('Sepetinizde kaldığınız yerden devam edebilirsiniz. Aşağıdaki ürünler sizi bekliyor:') }}
                @elseif($stage === 2 && !empty($couponCode))
                    {{ __('Dün sepetinizdeki ürünleri tamamlamadınız. Sizin için özel bir indirim kuponu hazırladık — aşağıdan kullanabilirsiniz.') }}
                @elseif($stage === 2 && $variant === 'message_b')
                    {{ __('Seçtiğiniz ürünler ve güncel teslimat seçenekleri sepetinizde hazır. Güvenli ödemeyle kaldığınız yerden devam edebilirsiniz.') }}
                @elseif($stage === 2)
                    {{ __('Dün sepetinizdeki ürünleri tamamlamadınız. Fiyat ve stok durumlarını yeniden görmek için sepetinize dönebilirsiniz.') }}
                @else
                    {{ !empty($couponCode)
                        ? __('Ürünler stokta iken siparişinizi tamamlayabilir ve sepet avantajınızı kullanabilirsiniz.')
                        : __('Bu son hatırlatmadır. Ürünlerin güncel stok ve fiyat durumunu sepetinizden kontrol edebilirsiniz.') }}
                @endif
            </p>

            @foreach($items as $item)
                <div class="item">
                    @if(!empty($item['image']))
                        <img src="{{ $item['image'] }}" alt="">
                    @endif
                    <div class="item-meta">
                        <div class="name">{{ $item['name'] ?? __('Ürün') }}</div>
                        <div class="qty">
                            {{ __('Adet') }}: {{ $item['quantity'] ?? 1 }}
                            @if(!empty($item['price']))
                                · {{ number_format((float) $item['price'], 2, ',', '.') }} {{ $cart->currency_code }}
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach

            <div class="totals">
                <span>{{ __('Toplam') }}</span>
                <span>{{ number_format((float) $cart->cart_total, 2, ',', '.') }} {{ $cart->currency_code }}</span>
            </div>

            @if(!empty($couponCode))
                <div class="coupon-box">
                    <div class="label">{{ __('KUPONUNUZ') }}</div>
                    <div class="code">{{ $couponCode }}</div>
                    @if(!empty($couponDiscountPercent))
                        <div style="margin-top:6px; font-size:12px; color:#92400e;">
                            {{ __('Bu kupon ile') }} %{{ $couponDiscountPercent }} {{ __('indirim kazanın') }}
                        </div>
                    @endif
                </div>
            @endif

            <a href="{{ $cartUrl }}" class="cta stage-{{ $stage }}">
                {{ __('Sepetime Dön') }} →
            </a>
        </div>

        <div class="footer">
            <p style="margin:0 0 8px;">
                © {{ date('Y') }} {{ com_option_get('com_site_title') ?: config('app.name') }}
            </p>
            <p style="margin:0;">
                <a href="{{ $unsubscribeUrl }}">{{ __('Bu hatırlatmaları almak istemiyorum') }}</a>
            </p>
        </div>
    </div>
</div>
</body>
</html>
