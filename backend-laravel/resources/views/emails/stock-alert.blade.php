<!doctype html>
<html lang="tr">
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
  @if ($kind === 'confirm')
    <h1>Stok bildirimini doğrulayın</h1>
    <p>{{ $productName }} stoğa geldiğinde size bir kez e-posta gönderebilmemiz için adresinizi doğrulayın.</p>
    <p><a href="{{ $primaryUrl }}">E-posta adresimi doğrula</a></p>
    <p>Bağlantı 24 saat geçerlidir. Bu talebi siz oluşturmadıysanız e-postayı yok sayın.</p>
  @else
    <h1>Beklediğiniz ürün yeniden stokta</h1>
    <p>{{ $productName }} yeniden satışta.</p>
    <p><a href="{{ $primaryUrl }}">Ürünü incele</a></p>
    <p>Bu ürün için başka e-posta gönderilmeyecek. <a href="{{ $unsubscribeUrl }}">Bildirimi kaldır</a></p>
  @endif
</body>
</html>
