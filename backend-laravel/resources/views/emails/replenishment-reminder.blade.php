<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#fff;border-radius:12px;padding:28px 24px">
      <h1 style="margin:0 0 12px;font-size:20px">Yenileme zamanı gelmiş olabilir</h1>
      <p style="font-size:14px;line-height:1.6">Merhaba {{ $customerName }}, daha önce aldığınız aşağıdaki ürünlerin kullanım süresi dolmaya yaklaşıyor olabilir. İhtiyacınız varsa stok durumunu kontrol edebilirsiniz.</p>
      @foreach ($items as $item)
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin:12px 0">
          <table role="presentation" width="100%"><tr>
            @if (!empty($item['image']))<td width="64"><img src="{{ $item['image'] }}" alt="" width="56" height="56" style="object-fit:cover;border-radius:8px"></td>@endif
            <td><strong style="font-size:14px">{{ $item['name'] }}</strong><br><a href="{{ $item['url'] }}" style="display:inline-block;margin-top:8px;background:#16a34a;color:#fff;text-decoration:none;padding:8px 14px;border-radius:7px;font-size:13px">Ürünü kontrol et</a></td>
          </tr></table>
        </div>
      @endforeach
      <p style="font-size:12px;color:#6b7280;line-height:1.5">Bu bir fiyat veya stok garantisi değildir. Pazarlama e-postası tercihinizi <a href="{{ $accountUrl }}">hesabınızdan</a> değiştirebilirsiniz.</p>
      <p style="font-size:13px;color:#9ca3af">{{ $siteName }} ekibi</p>
    </div>
  </div>
</body>
</html>
