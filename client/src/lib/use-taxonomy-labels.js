import {useSelector} from "react-redux";
import {brandOptionsMap, categoryOptionsMap} from "@/config";
import {useT} from "@/i18n/index.jsx";

// Bazadan kelgan kategoriya/brend nomini joriy tilda qaytaradi (ruscha bo'lmasa — o'zbekcha);
// topilmasa config'dagi standart xaritaga, u ham bo'lmasa slug'ning o'ziga qaytadi.
export function localizedName(item, lang) {
  return (lang === "ru" && item?.nameRu) || item?.name || "";
}

export function useTaxonomyLabels() {
  const {categories, brands} = useSelector((state) => state.taxonomy);
  const {lang} = useT();

  const categoryMap = {...categoryOptionsMap};
  (categories || []).forEach((c) => {
    categoryMap[c.slug] = localizedName(c, lang);
  });

  const brandMap = {...brandOptionsMap};
  (brands || []).forEach((b) => {
    brandMap[b.slug] = localizedName(b, lang);
  });

  return {
    categoryLabel: (slug) => categoryMap[slug] || slug,
    brandLabel: (slug) => brandMap[slug] || slug,
  };
}
