<?php

namespace App\Traits;

trait RoundNumericFields
{
    public function roundNumericFields(): array
    {
        $data = [];

        foreach ($this->getAttributes() as $key => $value) {
            if (
                is_numeric($value) &&
                $this->isRoundableField($key) &&
                !in_array($key, $this->excludedFieldsFromRounding ?? [], true)
            ) {
                $data[$key] = round($value); // Default: round to nearest integer
            }
        }

        return $data;
    }

    /**
     * Yuvarlanacak alan mi?
     *
     * DIKKAT: Bu metod eskiden `isFillable()` adiyla Eloquent'in kendi
     * Model::isFillable() metodunu EZIYORDU. Laravel'in surumu
     * static::$unguarded acikken true doner; forceFill() tam olarak boyle
     * calisir (unguarded icinde fill()). Ezilmis surum unguarded durumunu
     * hic bilmedigi icin forceFill() bu modellerde $fillable disindaki her
     * alani SESSIZCE atiyordu - ne hata ne uyari.
     *
     * Somut sonuc (2026-08-29): DispatchReviewRequests maili yolladiktan
     * sonra forceFill(['review_request_sent_at' => now()]) ile isaretliyor;
     * bu alan $fillable'da olmadigi icin hic yazilamadi ve ayni musteriye 30
     * dakikada bir yeniden mail gitti (siparis #194: 2 gunde 14 mail).
     *
     * Trait sadece Order, OrderMaster ve OrderDetail modellerinde kullaniliyor.
     */
    protected function isRoundableField($key): bool
    {
        return in_array($key, $this->getFillable(), true);
    }

    public function applyRoundedFields(): static
    {
        $this->forceFill($this->roundNumericFields());
        return $this;
    }
}

