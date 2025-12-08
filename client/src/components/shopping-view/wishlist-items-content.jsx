import { Minus, Plus, Trash, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {addToCart, deleteCartItem, fetchCartItems, updateCartQuantity} from "@/store/shop/cart-slice";
import { toast } from "react-toastify";
import instance from "@/utils/axios.js";
import {deleteWishlistItem, fetchWishlistItems} from "@/store/shop/wishlist-slice/index.js";

function UserWishlistItemsContent({ wishlistItem }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  function handleAddToCart() {
    dispatch(addToCart({productId: wishlistItem?.productId, userId: user?.id, quantity: 1})).then(() => {
      toast.success("Product added to cart!")
      dispatch(fetchCartItems(user?.id))
    })
  }

  function handleRemoveWishlist() {
    dispatch(deleteWishlistItem({productId: wishlistItem?.productId, userId: user?.id})).then(() => {
      toast.error("Product removed in your wishlist!")
      dispatch(fetchWishlistItems(user?.id))
    })
  }

  return (
    <div className="flex items-center space-x-4">
      <img
        src={instance.defaults.baseURL + wishlistItem?.image}
        alt={wishlistItem?.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{wishlistItem?.title}</h3>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          $
          {(
            (wishlistItem?.price - (Number(wishlistItem?.price) * Number(wishlistItem?.salePrice) / 100))
          ).toFixed(2)}
        </p>
        <Button
          variant={"destructive"}
          className={"text-white"}
          onClick={handleRemoveWishlist}
        >
          <Trash
            className="cursor-pointer mt-1"
            size={20}
          />
        </Button>
        <Button
          className={"mt-1"}
          onClick={handleAddToCart}
        >
          <ShoppingCart
            className={"cursor-pointer mt-1"}
            size={20}
          />
        </Button>
      </div>
    </div>
  );
}

export default UserWishlistItemsContent;
