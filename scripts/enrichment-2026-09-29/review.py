#!/usr/bin/env python3
"""Ajan ciktilarini denetler, uygulanabilir olanlari apply.json'a yazar.

  python3 scripts/enrichment-2026-09-29/review.py
Cikti: review-report.md (insan incelemesi), apply.json (uygulanacaklar).
"""
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ALLOWED_TAGS = {"p", "h3", "ul", "li", "strong", "table", "tr", "th", "td", "thead", "tbody", "br"}

# Saglik/tedavi/performans iddiasi ve pazarlama superlatifleri (kelime koku).
BANNED = [
    r"tedavi", r"iyileştir", r"şifa", r"hastalı", r"ağrıyı (giderir|azaltır|keser)", r"ağrı kesici",
    r"bağışıklı", r"yağ yak", r"kilo ver", r"zayıfla", r"kas (yapar|kazandırır|gelişimini hızlandır)",
    r"performansı? artır", r"enerji verir", r"metabolizmayı hızlandır", r"detoks", r"kanser",
    r"diyabet(?! hastaları için uygun değil)", r"tansiyon", r"romatizma", r"en iyi", r"en ucuz", r"garantili sonuç", r"mucize",
    r"%100 (doğal|etkili|emilim)", r"klinik olarak kanıtlanmış",
]
REQUIRED_MED_NOTE = "hekime veya fizyoterapiste danışın"


class TagCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.bad: set[str] = set()
        self.attrs = False

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED_TAGS:
            self.bad.add(tag)
        if attrs:
            self.attrs = True


def words(text: str) -> int:
    return len(re.sub(r"<[^>]+>", " ", text).split())


def main() -> None:
    inputs = {}
    for f in (ROOT / "input").glob("batch-*.json"):
        for row in json.loads(f.read_text()):
            inputs[row["id"]] = {**row, "batch": f.stem.replace("batch-", "")}

    report, apply = [], []
    for f in sorted((ROOT / "output").glob("*.json")):
        try:
            d = json.loads(f.read_text())
        except json.JSONDecodeError as err:
            report.append(f"## {f.name}\n- ❌ JSON bozuk: {err}\n")
            continue
        pid = int(d.get("id", f.stem))
        src = inputs.get(pid, {})
        issues, warns = [], []
        conf = d.get("match_confidence")
        desc = d.get("description_html") or ""
        specs = d.get("specifications") or []

        if pid not in inputs:
            issues.append("girdi listesinde olmayan id")
        if conf not in ("high", "medium"):
            issues.append(f"match_confidence={conf} → uygulanmaz")
        if not d.get("sources"):
            issues.append("kaynak yok")
        if conf in ("high", "medium") and not desc and not specs:
            issues.append("icerik bos")
        if desc:
            tc = TagCheck()
            tc.feed(desc)
            if tc.bad:
                issues.append(f"izin disi etiket: {sorted(tc.bad)}")
            if tc.attrs:
                warns.append("etiketlerde attribute var (temizlenecek)")
            n = words(desc)
            if n < 80 or n > 450:
                warns.append(f"kelime sayisi {n}")
            plain = html.unescape(re.sub(r"<[^>]+>", " ", desc)).lower()
            hits = [b for b in BANNED if re.search(b, plain)]
            if hits:
                issues.append(f"yasak ifade: {hits}")
            if src.get("batch") == "medikal" and REQUIRED_MED_NOTE not in plain:
                warns.append("medikal uyari notu yok")
        for s in specs:
            if not s.get("name") or not s.get("value"):
                issues.append(f"bos ozellik satiri: {s}")
            elif not s.get("source"):
                warns.append(f"kaynaksiz ozellik: {s['name']}")
            elif re.search("|".join(BANNED), f"{s['name']} {s['value']}".lower()):
                issues.append(f"yasak ifade ozellikte: {s['name']}")
        gtin = (d.get("identity") or {}).get("gtin") or ""
        if gtin and not re.fullmatch(r"\d{8}|\d{12,14}", gtin):
            warns.append(f"gecersiz gtin {gtin!r} (uygulanmaz)")

        status = "❌ UYGULANMAZ" if issues else "✅ UYGULANIR"
        report.append(
            f"## {pid} — {src.get('name', d.get('current_name', ''))}\n"
            f"- {status} · güven: {conf} · grup: {src.get('batch')} · {words(desc)} kelime · {len(specs)} özellik\n"
            f"- Eşleşme: {d.get('match_evidence', '')[:300]}\n"
            f"- Kaynaklar: {', '.join(d.get('sources', [])[:4])}\n"
            + (f"- Sorun: {'; '.join(issues)}\n" if issues else "")
            + (f"- Uyarı: {'; '.join(warns)}\n" if warns else "")
            + (f"- Çelişki: {d['conflicts']}\n" if d.get("conflicts") else "")
            + (f"- Not: {d['notes'][:300]}\n" if d.get("notes") else "")
        )
        if not issues:
            apply.append({
                "id": pid,
                "slug": src.get("slug"),
                "description_html": re.sub(r"<(\w+)\s[^>]*>", r"<\1>", desc) if desc else "",
                "specifications": [{"name": s["name"].strip()[:120], "value": str(s["value"]).strip()[:250]} for s in specs],
                "suggested_brand": d.get("suggested_brand") or (d.get("identity") or {}).get("brand") or "",
            })

    ok = len(apply)
    header = f"# Zenginleştirme denetimi\n\nToplam çıktı: {len(report)} · uygulanabilir: {ok}\n\n"
    (ROOT / "review-report.md").write_text(header + "\n".join(report))
    (ROOT / "apply.json").write_text(json.dumps(apply, ensure_ascii=False, indent=1))
    print(header.strip())


if __name__ == "__main__":
    main()
