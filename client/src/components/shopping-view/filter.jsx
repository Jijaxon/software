import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterOptions } from "@/config";
import { Checkbox } from "../ui/checkbox";
import { SlidersHorizontal } from "lucide-react";
import { fetchTaxonomy } from "@/store/admin/taxonomy-slice/index.js";

const sectionLabels = {
  category: "Kategoriya",
  brand: "Brend",
};

function ProductFilter({ filters, handleFilter }) {
  const dispatch = useDispatch();
  const { categories, brands } = useSelector((state) => state.taxonomy);

  useEffect(() => {
    dispatch(fetchTaxonomy({ type: "category", activeOnly: true }));
    dispatch(fetchTaxonomy({ type: "brand", activeOnly: true }));
  }, [dispatch]);

  // Bazadan kelgan kategoriya/brendlar; bo'sh bo'lsa config'dagi standart ro'yxatga qaytamiz
  const dynamicOptions = {
    category: categories?.length
      ? categories.map((c) => ({ id: c.slug, label: c.name }))
      : filterOptions.category,
    brand: brands?.length
      ? brands.map((b) => ({ id: b.slug, label: b.name }))
      : filterOptions.brand,
  };

  const activeCount = Object.values(filters || {}).reduce(
    (sum, values) => sum + (Array.isArray(values) ? values.length : 0),
    0
  );

  return (
    <aside className="h-fit rounded-3xl border border-sand bg-white p-6 md:sticky md:top-24">
      <div className="flex items-center justify-between border-b border-sand pb-4">
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-espresso">
          <SlidersHorizontal className="h-4 w-4 text-rose-deep" />
          Saralash
        </h2>
        {activeCount > 0 ? (
          <span key={activeCount} className="grid h-6 min-w-6 animate-pop place-items-center rounded-full bg-rose-deep px-1.5 text-[11px] font-semibold text-white">
            {activeCount}
          </span>
        ) : null}
      </div>
      <div className="mt-5 space-y-7">
        {Object.keys(dynamicOptions).map((keyItem) => (
          <div key={keyItem}>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-taupe">
              {sectionLabels[keyItem] || keyItem}
            </h3>
            <div className="grid gap-1">
              {dynamicOptions[keyItem].map((option) => {
                const isChecked = Boolean(
                  filters &&
                  Object.keys(filters).length > 0 &&
                  filters[keyItem] &&
                  filters[keyItem].indexOf(option.id) > -1
                );

                return (
                  <label
                    key={option?.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-300 hover:bg-cream ${
                      isChecked ? "bg-blush/60 font-semibold text-espresso" : "text-mocha"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                      className="h-[18px] w-[18px] rounded-md border-petal data-[state=checked]:border-rose-deep data-[state=checked]:bg-rose-deep [&_svg]:h-3 [&_svg]:w-3"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default ProductFilter;
