<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ com_option_get('com_site_title') }}</title>
    <style>
        body { margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, Helvetica, sans-serif; }
        .container { width:100%; padding:32px 0; }
        .email-box { width:600px; max-width:100%; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.08); }
        .logo { text-align:center; padding:24px 0 8px; }
        .logo img { max-width:180px; height:auto; display:block; margin:0 auto; }
        .email-body { padding:24px 32px 32px; color:#333333; }
        .email-body h2 { font-size:20px; margin:0 0 16px; color:#111827; }
        .email-body p { font-size:15px; line-height:1.6; margin:0 0 16px; color:#555555; }
        .code { display:block; text-align:center; font-size:34px; letter-spacing:10px; font-weight:bold; color:#111827; background-color:#f3f4f6; border-radius:8px; padding:18px 12px; margin:24px 0; }
        .muted { font-size:13px; color:#888888; }
        .footer { background-color:#f4f4f4; text-align:center; padding:20px; font-size:12px; color:#999999; }
        @media screen and (max-width:600px) {
            .email-body { padding:20px; }
            .code { font-size:26px; letter-spacing:6px; }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="email-box">
        <div class="logo">
            <a href="{{ url('/') }}">
                <img src="{{ com_option_get_id_wise_url(com_option_get('com_site_logo')) }}" alt="{{ com_option_get('com_site_title') }}" width="180">
            </a>
        </div>
        <div class="email-body">
            <h2>Merhaba{{ $name ? ' ' . $name : '' }},</h2>

            @if($isGuest)
                <p>Siparişinizi tamamlayabilmemiz için e-posta adresinizi doğrulamamız gerekiyor. Doğrulama kodunuz:</p>
            @else
                <p>Hesabınızı kullanmaya başlamak için e-posta adresinizi doğrulayın. Doğrulama kodunuz:</p>
            @endif

            <span class="code">{{ $code }}</span>

            <p>Kod {{ $ttlMinutes }} dakika boyunca geçerlidir.</p>
            <p class="muted">Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; hesabınızda herhangi bir değişiklik yapılmaz.</p>
        </div>
        <div class="footer">
            {{ com_get_footer_copyright() }}
        </div>
    </div>
</div>
</body>
</html>
