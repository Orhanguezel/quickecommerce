# Form + JSON (DF) Checklist — KİLİTLİ

Bu dosya **tek kaynak**tır. DF + JSON i18n form yapan her dosya **bu sırayla** uygulanır.

---

## 0) Kapsam

- DF + JSON scaffold kullanan **tüm formlar**.
- Amaç: deterministik init, tek kaynak, drift olmadan submit.



fhfgh

---

## 1) Import Kuralları (Sadece Bunlar)

- `useFormI18nScaffold`
- `makeRHFSetValueAny`, `safeObject`
- `AdminI18nJsonPanel`
- `initI18nFlatFormFromEntity`
- `normalizeTranslationsMap` (gerekirse)
- `applyI18nJsonToFlatForm`, `buildI18nJsonFromFlatValues` (yalnızca ortak helper/scaffold içinde)

YASAK:
- Form içinde custom `normalize/build/watch/adapter`
- Form içinde JSON parse/stringify
- Form içinde whole‑form watch

---

## 2) Zod + DF Kontratı

- Her i18n alan için `_df` alanı **zorunlu** (schema + defaultValues).
- DF alanı **UI’da görünmez**, **hidden register** ile formda bulunur.

Örnek:
```tsx
<input type="hidden" {...register("title_df")} />
```

---

## 3) Dil Kuralları

- `languages` kaynağı: `multiLang.json`
- `excludeLangIds: ["df"]`
- `uiLangs = languages.filter(...)`
- `firstUILangId = uiLangs[0].id`
- Tabs listesi **sadece** `uiLangs`

YASAK:
- default dil için özel tab
- `df` için tab
- hardcoded `"tr"` / `"en"`

---

## 4) RHF Setup (Tek Tip)

```ts
const form = useForm({ resolver: zodResolver(schema), defaultValues });
const setValueAny = makeRHFSetValueAny(setValue);
```

YASAK:
- `setValue("name_tr" as any, ...)`
- `as keyof FormData`

---

## 5) useFormI18nScaffold (Zorunlu)

```ts
useFormI18nScaffold({
  languages,
  excludeLangIds: ["df"],
  fields: I18N_FIELDS,
  control,
  getValues,
  setValueAny,
  keyOf: (f, lang) => `${f}_${lang}`,
  dfSync: {
    enabled: true,
    pairs: [
      { dfField: "title_df", srcField: (l) => `title_${l}`, validate: true }
    ]
  },
  extraWatchNames: [/* sadece global alanlar */]
})
```

YASAK:
- formdan JSON üretmek
- `useEffect` ile sürekli rebuild

---

## 6) Tabs (Controlled)

```ts
const [activeLangId, setActiveLangId] = useState(firstUILangId);
<Tabs value={activeLangId} onValueChange={setActiveLangId} />
```

- `uiLangs` değişirse `activeLangId` valid mi kontrol edilir.
- `defaultValue` kullanılmaz.

---

## 7) Unmount Olan Alanlar (Zorunlu Register)

Tabs unmount ettiği için alanlar **programatik register** edilir:

```ts
useEffect(() => {
  uiLangs.forEach((l) => register(`name_${l.id}` as any));
}, [uiLangs, register]);
```

---

## 8) View Mode (Form | JSON)

```ts
const [viewMode, setViewMode] = useState<"form" | "json">("form");
useEffect(() => { if (viewMode === "json") rebuildJsonNow(); }, [viewMode]);
```

---

## 9) Edit Init (Deterministic)

- `editData = data?.data ?? data?.entity ?? data`
- Global alanlar: `reset` / `setValueAny` (**shouldDirty:false**)
- i18n init:
```ts
initI18nFlatFormFromEntity({
  editData,
  firstUILangId,
  uiLangs,
  i18nFields,
  setValueAny,
  after: rebuildJsonNow
});
```

---

## 10) JSON Panel (Tek Kapı)

```tsx
<AdminI18nJsonPanel
  value={translationsJson}
  onChange={handleTranslationsJsonChange}
  perLanguage
  showAllTab
/>
```

Kural:
- JSON → Form sync **sadece handler**
- Form → JSON sync **sadece scaffold**

---

## 11) Watch Politikası

✅ Sadece gereken alanlar:
```ts
useWatch({ name: COLOR_FIELDS })
```

YASAK:
- `useWatch()` (boş)
- `watch()` / `watch(formState)`

---

## 12) Submit Payload Standardı

- Root alanlar DF’den:
```ts
root = safeStr(values.title_df) || safeStr(values[`title_${firstUILangId}`])
```

- `translations[]`: **JSON snapshot** üzerinden (tek kaynak)
  - `language_code` zorunlu
  - object map gelirse array’e normalize et

- `translations_json`: **her zaman** gönder

---

## 13) Kırmızı Liste (PR RED)

- Tabs `defaultValue`
- JSON’u formdan otomatik rebuild
- JSON state olmadan submit
- JSON varken form overwrite
- whole‑form watch

---

## 14) PR Kontrol Soruları

> “JSON tek kaynak mı?”  
> “Form JSON’u overwrite edebilir mi?”  
> “Unmount alanlar register edildi mi?”

Bir tanesi bile “evet” ise form hatalıdır.

