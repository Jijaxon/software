import {Fragment, useEffect, useState} from "react";
import ProductImageUpload from "@/components/admin-view/image-upload";
import {Button} from "@/components/ui/button.jsx";
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "@/components/ui/sheet.jsx";
import CommonForm from "@/components/common/form.jsx";
import {addProductFormElements} from "@/config";
import {useDispatch, useSelector} from "react-redux";
import {addNewProduct, deleteProduct, fetchAllProducts, updateProduct} from "@/store/admin/products-slice/index.js";
import {fetchTaxonomy} from "@/store/admin/taxonomy-slice/index.js";
import AdminProductTile from "@/components/admin-view/product-tile.jsx";
import Pagination from "@/components/admin-view/pagination.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Plus, Search} from "lucide-react";
import {fromDateTimeLocal, toDateTimeLocal} from "@/lib/utils";

const PAGE_SIZE = 8;

const initialFormData = {
  title: "", description: "", category: "", brand: "", price: "", salePrice: "", totalStock: "", saleEndsAt: "",
}

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.adminProducts);
  const { categories, brands } = useSelector((state) => state.taxonomy);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchTaxonomy({ type: "category" }));
    dispatch(fetchTaxonomy({ type: "brand" }));
  }, [dispatch]);

  // Kategoriya va brend variantlarini bazadan dinamik olib kelamiz
  const formControls = addProductFormElements.map((control) => {
    if (control.name === "category") {
      return { ...control, options: categories.map((c) => ({ id: c.slug, label: c.name })) };
    }
    if (control.name === "brand") {
      return { ...control, options: brands.map((b) => ({ id: b.slug, label: b.name })) };
    }
    return control;
  });

  // Qidiruv + kategoriya bo'yicha filtr
  const allProducts = productList?.data || [];
  const term = searchTerm.trim().toLowerCase();
  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch =
      !term ||
      [p.title, p.brand, p.category].some((v) => String(v || "").toLowerCase().includes(term));
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function onSubmit(e) {
    e.preventDefault();

    // datetime-local qiymatini ISO ga o'giramiz (server vaqt zonasidan qat'i nazar to'g'ri saqlansin)
    const payload = {...formData, saleEndsAt: fromDateTimeLocal(formData.saleEndsAt) || ""};

    currentEditedId !== null ?
      await dispatch(updateProduct({id: currentEditedId, formData: payload, imageFiles: imageFile}))
      :
      await dispatch(addNewProduct({ formData: payload, imageFiles: imageFile }));

    setFormData(initialFormData);
    setImageFile(null);
    setUploadedImageUrl(null);
    setOpenCreateProductsDialog(false);
  }

  function isFormValid() {
    const { price, salePrice, totalStock } = formData;

    // NARX: musbat son bo'lishi shart
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) return false;

    // CHEGIRMA FOIZI: ixtiyoriy; berilsa 0–99% oralig'ida bo'lishi kerak
    if (salePrice !== "" && salePrice !== null && salePrice !== undefined) {
      const saleNum = Number(salePrice);
      if (isNaN(saleNum) || saleNum < 0 || saleNum >= 100) return false;
    }

    // OMBOR: musbat son bo'lishi shart
    const stockNum = Number(totalStock);
    if (isNaN(stockNum) || stockNum <= 0) return false;

    // Majburiy matn maydonlari (salePrice va averageReview ixtiyoriy)
    const requiredFields = ["title", "description", "category", "brand"];
    return requiredFields.every((key) => String(formData[key] ?? "").trim() !== "");
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct({id: getCurrentProductId}))
  }

  return (
    <Fragment>
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-sand bg-gradient-to-br from-white to-cream/60 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">Mahsulotlar</h1>
          <p className="mt-1 text-sm text-taupe">Mahsulotlarni qo'shing, tahrirlang va boshqaring</p>
        </div>
        <Button
          onClick={() => { setCurrentEditedId(null); setFormData(initialFormData); setOpenCreateProductsDialog(true); }}
          className="h-11 gap-2 rounded-full bg-espresso px-5 text-ivory transition-all hover:-translate-y-0.5 hover:bg-mocha"
        >
          <Plus className="h-4 w-4"/> Yangi mahsulot
        </Button>
      </div>
      {/* Qidiruv va filtr */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe"/>
          <Input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Nomi, brend yoki kategoriya bo'yicha qidirish..."
            className="h-12 rounded-full border-sand bg-white pl-11"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setCategoryFilter("all"); setPage(1); }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              categoryFilter === "all" ? "bg-espresso text-ivory" : "border border-sand bg-white text-mocha hover:bg-cream"
            }`}
          >
            Barchasi
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => { setCategoryFilter(c.slug); setPage(1); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                categoryFilter === c.slug ? "bg-espresso text-ivory" : "border border-sand bg-white text-mocha hover:bg-cream"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {pagedProducts.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {pagedProducts.map((productItem) => (
              <AdminProductTile
                key={productItem?._id}
                setFormData={(product) => setFormData({...product, saleEndsAt: toDateTimeLocal(product.saleEndsAt)})}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))}
          </div>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage}/>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-petal bg-white/70 py-16 text-center text-taupe">
          {allProducts.length === 0 ? "Hali mahsulot qo'shilmagan" : "Qidiruv bo'yicha mahsulot topilmadi"}
        </div>
      )}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => setOpenCreateProductsDialog(false)}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl text-espresso">
              {currentEditedId !== null ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Saqlash" : "Qo'shish"}
              formControls={formControls}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;