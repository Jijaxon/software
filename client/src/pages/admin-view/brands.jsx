import TaxonomyManager from "@/components/admin-view/taxonomy-manager.jsx";

function AdminBrands() {
  return (
    <TaxonomyManager
      type="brand"
      title="Brendlar"
      subtitle="Brendlarni boshqaring — mahsulot formasi va saralash filtrlari avtomatik yangilanadi."
      emptyLabel="Hali brend qo'shilmagan"
    />
  );
}

export default AdminBrands;
