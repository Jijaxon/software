import {useSelector} from "react-redux";
import {brandOptionsMap, categoryOptionsMap} from "@/config";

// Bazadan kelgan kategoriya/brend nomlarini slug bo'yicha qaytaradi;
// topilmasa config'dagi standart xaritaga, u ham bo'lmasa slug'ning o'ziga qaytadi.
export function useTaxonomyLabels() {
  const {categories, brands} = useSelector((state) => state.taxonomy);

  const categoryMap = {...categoryOptionsMap};
  (categories || []).forEach((c) => {
    categoryMap[c.slug] = c.name;
  });

  const brandMap = {...brandOptionsMap};
  (brands || []).forEach((b) => {
    brandMap[b.slug] = b.name;
  });

  return {
    categoryLabel: (slug) => categoryMap[slug] || slug,
    brandLabel: (slug) => brandMap[slug] || slug,
  };
}
