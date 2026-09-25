<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0; background:#f3f4f6; font-family:Arial,Helvetica,sans-serif; color:#1f2937;">
  <div style="max-width:560px; margin:0 auto; padding:24px 16px;">

    <div style="background:#ffffff; border-radius:12px; padding:28px 24px; box-shadow:0 1px 3px rgba(0,0,0,.08);">
      <h1 style="margin:0 0 6px; font-size:20px; color:#111827;">Ürününüz elinize ulaştı! 🎉</h1>
      <p style="margin:0 0 18px; font-size:14px; color:#374151; line-height:1.6;">
        Merhaba {{ $customerName }},<br>
        Siparişiniz teslim edildi. Umarız beğenmişsinizdir! Deneyiminizi merak ediyoruz —
        birkaç saniyenizi ayırıp ürünü değerlendirir misiniz? Yorumunuz hem bizim için hem de
        diğer müşterilerimiz için çok değerli. ⭐
      </p>

      @if (!empty($reward))
        {{-- Puan kampanyasi. Yasal: puan yildiz sayisindan BAGIMSIZ verilir ve
             urun basina bir kez gecerlidir; bu ikisi metinde acikca yazar. --}}
        <div style="border:1px solid #16a34a; background:#f0fdf4; border-radius:10px; padding:14px; margin-bottom:16px;">
          <p style="margin:0 0 6px; font-weight:700; color:#166534;">
            🎁 Değerlendirin, puan kazanın
          </p>
          <p style="margin:0; font-size:14px; color:#374151; line-height:1.5;">
            Fotoğraflı değerlendirmeye <strong>{{ $reward['with_image_value'] }} TL</strong>,
            fotoğrafsız değerlendirmeye <strong>{{ $reward['no_image_value'] }} TL</strong>
            değerinde puan kazanırsınız. {{ $reward['min_redeem_value'] }} TL'ye ulaştığınızda
            indirim çekine dönüştürebilirsiniz.
          </p>
          <p style="margin:8px 0 0; font-size:12px; color:#6b7280; line-height:1.5;">
            Puan, verdiğiniz yıldız sayısından bağımsız olarak verilir ve her ürün için
            bir kez geçerlidir.@if (!empty($reward['hold_days'])) Kazanılan puanlar
            {{ $reward['hold_days'] }} gün bekledikten sonra kullanıma açılır.@endif
          </p>
        </div>
      @endif

      @foreach ($items as $item)
        <div style="border:1px solid #e5e7eb; border-radius:10px; padding:12px; margin-bottom:12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            @if (!empty($item['image']))
              <td width="64" valign="top" style="padding-right:12px;">
                <img src="{{ $item['image'] }}" alt="" width="64" height="64"
                     style="border-radius:8px; object-fit:cover; display:block;">
              </td>
            @endif
            <td valign="middle">
              <p style="margin:0 0 8px; font-size:14px; font-weight:600; color:#111827;">
                {{ $item['name'] }}
              </p>
              <a href="{{ $item['url'] }}"
                 style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none;
                        font-size:13px; font-weight:600; padding:8px 16px; border-radius:8px;">
                ⭐ Bu ürünü değerlendir
              </a>
            </td>
          </tr></table>
        </div>
      @endforeach

      <p style="margin:18px 0 0; font-size:13px; color:#6b7280; line-height:1.6;">
        Yaşadığınız bir sorun mu var? Bu e-postayı yanıtlayarak ya da canlı destek üzerinden
        bize ulaşabilirsiniz; memnuniyetiniz bizim için önemli.
      </p>

      <p style="margin:20px 0 0; font-size:13px; color:#9ca3af;">
        Teşekkürler,<br>{{ $siteName }} ekibi
      </p>
    </div>

    <p style="text-align:center; font-size:11px; color:#9ca3af; margin:16px 0 0;">
      Bu e-posta, {{ $siteName }} üzerinden teslim edilen siparişiniz için gönderilmiştir.
    </p>
  </div>
</body>
</html>
