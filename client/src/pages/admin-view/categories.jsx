import TaxonomyManager from "@/components/admin-view/taxonomy-manager.jsx";

function AdminCategories() {
  return (
    <TaxonomyManager
      type="category"
      title="Go'zallik bo'limlari"
      subtitle="Kategoriyalarni qo'shing, tahrirlang va tartiblang — o'zgarishlar saytda avtomatik ko'rinadi."
      emptyLabel="Hali bo'lim qo'shilmagan"
    />
  );
}

export default AdminCategories;
