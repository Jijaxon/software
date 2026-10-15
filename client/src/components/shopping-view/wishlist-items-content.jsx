import { ShoppingBag, X } from "lucide-react";
import {formatPrice} from "@/lib/utils";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { toast } from "react-toastify";
import instance from "@/utils/axios.js";
import { deleteWishlistItem, fetchWishlistItems } from "@/store/shop/wishlist-slice/index.js";

function UserWishlistItemsContent({ wishlistItem }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const finalPrice =
    wishlistItem?.price - (Number(wishlistItem?.price) * Number(wishlistItem?.salePrice) / 100);

  function handleAddToCart() {
    dispatch(addToCart({productId: wishlistItem?.productId, userId: user?.id, quantity: 1})).then((data) => {
      if (data?.payload?.success) {
        toast.success("Mahsulot savatga qo'shildi")
        dispatch(fetchCartItems(user?.id))
      }
    })
  }

  function handleRemoveWishlist() {
    dispatch(deleteWishlistItem({productId: wishlistItem?.productId, userId: user?.id})).then(() => {
      toast.info("Mahsulot istaklar ro'yxatidan olib tashlandi")
      dispatch(fetchWishlistItems(user?.id))
    })
  }

  return (
    <div className="group relative flex gap-4 rounded-2xl border border-sand bg-white p-3 transition-all duration-300 hover:border-petal hover:shadow-md hover:shadow-mocha/5">
      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
        <img
          src={instance.defaults.baseURL + wishlistItem?.image}
          alt={wishlistItem?.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-espresso">{wishlistItem?.title}</h3>
          <button
            onClick={handleRemoveWishlist}
            aria-label="Olib tashlash"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-taupe transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-display text-lg font-semibold text-espresso">{formatPrice(finalPrice)}</span>
            {wishlistItem?.salePrice > 0 ? (
              <span className="ml-2 text-[11px] text-taupe line-through">{formatPrice(wishlistItem?.price)}</span>
            ) : null}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="h-8 rounded-full bg-espresso px-3 text-[11px] font-semibold text-ivory hover:bg-mocha"
          >
            <ShoppingBag className="!h-3.5 !w-3.5" />
            Savatga
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserWishlistItemsContent;
