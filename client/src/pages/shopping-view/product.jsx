import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate, useParams} from "react-router-dom";
import {Loader2} from "lucide-react";
import {fetchProductDetails} from "@/store/shop/products-slice";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import {useDocumentTitle} from "@/lib/use-document-title.js";

// Ulashilgan havola (/shop/product/:id) — mahsulot oynasini darhol ochadi
function ShoppingProductPage() {
  const {id} = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {productDetails} = useSelector((state) => state.shopProducts);
  const [open, setOpen] = useState(false);

  useDocumentTitle(productDetails?.title, productDetails?.description?.slice(0, 160));

  useEffect(() => {
    dispatch(fetchProductDetails(id)).then((res) => {
      if (res?.payload?.success) setOpen(true);
      else navigate("/shop/listing", {replace: true});
    });
  }, [dispatch, id, navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-ivory">
      {!open ? <Loader2 className="h-6 w-6 animate-spin text-rose"/> : null}
      <ProductDetailsDialog
        open={open}
        setOpen={setOpen}
        productDetails={productDetails}
        onClose={() => navigate("/shop/listing")}
      />
    </div>
  );
}

export default ShoppingProductPage;
