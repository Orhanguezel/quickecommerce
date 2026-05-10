export const ENGIN_ESER_AUTHOR = {
  name: "Engin Eser",
  titleTr: "Sportoonline spor ekipmanlari ve e-ticaret icerik yazari",
  titleEn: "Sportoonline sports equipment and e-commerce content author",
  path: "/yazar/engin-eser",
  image: null as string | null,
  bioTr:
    "Engin Eser, Sportoonline'da spor ekipmanlari, sporcu beslenmesi, kosu, fitness ve online alisveris rehberleri hazirlar. Iceriklerde urun secimi, kullanim senaryolari ve tuketici kararlarini sade, kaynakli ve pratik bir dille aktarmaya odaklanir.",
  bioEn:
    "Engin Eser writes Sportoonline guides on sports equipment, sports nutrition, running, fitness, and online shopping. His content focuses on product selection, usage scenarios, and practical buying decisions.",
  sameAs: [
    "https://sportoonline.com",
    "https://www.linkedin.com/company/sportoonline",
    "https://www.youtube.com/@sportoonline6835",
    "https://www.wikidata.org/wiki/User:Sportoonline",
  ],
} as const;

export function getEnginEserAuthor(locale: string) {
  const isTr = locale === "tr";

  return {
    ...ENGIN_ESER_AUTHOR,
    title: isTr ? ENGIN_ESER_AUTHOR.titleTr : ENGIN_ESER_AUTHOR.titleEn,
    bio: isTr ? ENGIN_ESER_AUTHOR.bioTr : ENGIN_ESER_AUTHOR.bioEn,
    localizedUrl: `https://sportoonline.com/${locale}${ENGIN_ESER_AUTHOR.path}`,
  };
}
