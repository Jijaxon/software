import {Fragment, useEffect, useState} from "react";
import ProductImageUpload from "@/components/admin-view/image-upload";
import {Button} from "@/components/ui/button.jsx";
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "@/components/ui/sheet.jsx";
import CommonForm from "@/components/common/form.jsx";
import {addProductFormElements} from "@/config";
import {useDispatch, useSelector} from "react-redux";
import {addNewProduct, deleteProduct, fetchAllProducts, updateProduct} from "@/store/admin/products-slice/index.js";
import AdminProductTile from "@/components/admin-view/product-tile.jsx";

const initialFormData = {
  title: "", description: "", category: "", brand: "", price: "", salePrice: "", totalStock: "",
}

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.adminProducts);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  async function onSubmit(e) {
    e.preventDefault();

    currentEditedId !== null ?
      await dispatch(updateProduct({id: currentEditedId, formData, imageFiles: imageFile}))
      :
      await dispatch(addNewProduct({ formData, imageFiles: imageFile }));

    setFormData(initialFormData);
    setImageFile(null);
    setUploadedImageUrl(null);
    setOpenCreateProductsDialog(false);
  }

  function isFormValid() {
    const { price, salePrice, totalStock } = formData;

    // PRICE tekshiruv
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) return false;  // ❌ harf, ❌ manfiy, ❌ 0

    // SALE PRICE tekshiruv
    if (salePrice !== "") {
      const saleNum = Number(salePrice);
      if (isNaN(saleNum) || saleNum < 0) return false;   // ❌ manfiy, ❌ harf
      if (saleNum >= priceNum) return false;             // ❌ salePrice > price bo'lmasin
    }

    // TOTAL STOCK tekshiruv
    const stockNum = Number(totalStock);
    if (isNaN(stockNum) || stockNum <= 0) return false;  // ❌ harf, ❌ manfiy, ❌ 0

    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct({id: getCurrentProductId}))
  }

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>Add New Product</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList?.data?.length > 0
          ? productList?.data?.map((productItem) => (
            <AdminProductTile
              key={productItem?._id}
              setFormData={setFormData}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
              product={productItem}
              handleDelete={handleDelete}
            />
          ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => setOpenCreateProductsDialog(false)}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Add New Product</SheetTitle>
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
              buttonText="Add"
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;