import {formatPrice} from "@/lib/utils";
import {Button} from "@/components/ui/button.jsx";
import instance from "@/utils/axios.js";
import {Badge} from "@/components/ui/badge.jsx";
import {Pencil, Trash2} from "lucide-react";

const AdminProductTile = ({product, setFormData, setOpenCreateProductsDialog, setCurrentEditedId, handleDelete}) => {
  function calculateSale() {
    return product?.price - (Number(product?.price) * Number(product?.salePrice) / 100);
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-sand bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blush/40">
      <div className="relative overflow-hidden">
        <img
          src={instance.defaults.baseURL + product?.image}
          alt={product?.title}
          className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <Badge className="border-0 bg-espresso/85 text-ivory backdrop-blur">
            {product?.totalStock} dona
          </Badge>
          {product?.salePrice > 0 && (
            <Badge className="border-0 bg-rose-deep text-ivory">
              -{product?.salePrice}%
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5">
        <h2 className="mb-2 truncate font-display text-lg font-semibold text-espresso">{product?.title}</h2>
        <div className="mb-4 flex items-center gap-2">
          <span className={`font-semibold ${product?.salePrice > 0 ? "text-sm text-taupe line-through" : "text-lg text-espresso"}`}>
            {formatPrice(product?.price)}
          </span>
          {product?.salePrice > 0 ? (
            <span className="text-lg font-bold text-rose-deep">{formatPrice(calculateSale())}</span>
          ) : null}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
            className="h-10 flex-1 gap-1.5 rounded-full bg-espresso text-ivory hover:bg-mocha"
          >
            <Pencil className="h-3.5 w-3.5"/> Tahrir
          </Button>
          <Button
            onClick={() => handleDelete(product?._id)}
            variant="outline"
            className="h-10 gap-1.5 rounded-full border-petal text-rose-deep hover:bg-blush/50"
          >
            <Trash2 className="h-3.5 w-3.5"/>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductTile;
