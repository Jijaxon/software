import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { toast } from "react-toastify";
import instance from "@/utils/axios.js";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();

  const unitPrice =
    cartItem?.price - (Number(cartItem?.price) * Number(cartItem?.salePrice) / 100);

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction === "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock = productList[getCurrentProductIndex]?.totalStock;

        if (indexOfCurrentCartItem > -1 && getTotalStock !== undefined) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast.warning(
              `Bu mahsulotdan faqat ${getQuantity} ta qo'shish mumkin`
            );
            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast.success("Savat yangilandi");
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        toast.info("Mahsulot savatdan olib tashlandi");
      }
    });
  }

  return (
    <div className="group flex gap-4 rounded-2xl border border-sand bg-white p-3 transition-all duration-300 hover:border-petal hover:shadow-md hover:shadow-mocha/5">
      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
        <img
          src={instance.defaults.baseURL + cartItem?.image}
          alt={cartItem?.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-espresso">{cartItem?.title}</h3>
          <button
            onClick={() => handleCartItemDelete(cartItem)}
            aria-label="O'chirish"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-taupe transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center rounded-full border border-sand bg-ivory">
            <button
              className="grid h-8 w-8 place-items-center rounded-full text-mocha transition-colors hover:bg-blush disabled:pointer-events-none disabled:opacity-40"
              disabled={cartItem?.quantity === 1}
              onClick={() => handleUpdateQuantity(cartItem, "minus")}
            >
              <Minus className="h-3.5 w-3.5" />
              <span className="sr-only">Kamaytirish</span>
            </button>
            <span key={cartItem?.quantity} className="w-6 animate-pop text-center text-sm font-semibold">
              {cartItem?.quantity}
            </span>
            <button
              className="grid h-8 w-8 place-items-center rounded-full text-mocha transition-colors hover:bg-blush"
              onClick={() => handleUpdateQuantity(cartItem, "plus")}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only">Ko'paytirish</span>
            </button>
          </div>
          <div className="text-right">
            <p className="font-display text-lg font-semibold text-espresso">
              ${(unitPrice * cartItem?.quantity).toFixed(2)}
            </p>
            {cartItem?.salePrice > 0 ? (
              <p className="text-[11px] text-taupe line-through">
                ${(Number(cartItem?.price) * cartItem?.quantity).toFixed(2)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
