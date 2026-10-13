import {Card, CardContent, CardFooter} from "../ui/card";
import {Button} from "../ui/button";
import {brandOptionsMap, categoryOptionsMap} from "@/config";
import {Badge} from "../ui/badge";
import instance from "@/utils/axios.js";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import {HeartIcon} from "lucide-react";
import {addToWishlist, deleteWishlistItem, fetchWishlistItems} from "@/store/shop/wishlist-slice/index.js";

function ShoppingProductTile({
                               product,
                               handleGetProductDetails,
                               handleAddtoCart,
                             }) {

  const dispatch = useDispatch()

  const {user} = useSelector(state => state.auth)
  const {wishlistItems, isLoading} = useSelector(state => state.shopWishlist)

  function calculateSale() {
    return (product?.price - (Number(product?.price) * Number(product?.salePrice) / 100)).toFixed(2)
  }

  function toggleWishlist(productId) {
    if (wishlistItems?.items?.find((el) => el?.productId === productId)) {
      dispatch(deleteWishlistItem({productId, userId: user?.id})).then(() => {
        dispatch(fetchWishlistItems(user?.id))
        toast.info("Mahsulot istaklar ro'yxatidan olib tashlandi")
      })
    } else {
      dispatch(addToWishlist({productId, userId: user?.id})).then(() => {
        dispatch(fetchWishlistItems(user?.id))
        toast.success("Mahsulot istaklar ro'yxatiga qo'shildi")
      })
    }
  }

  return (
    <Card className="relative mx-auto w-full max-w-sm overflow-hidden rounded-sm border-[#e8dfd7] bg-white shadow-none">
      <div onClick={() => handleGetProductDetails(product?._id)}>
        <div className="relative">
          <img
            src={instance.defaults.baseURL + product?.image}
            alt={product?.title}
            className="h-[300px] w-full cursor-pointer object-cover"
          />
          {(product?.salePrice > 0 || product?.totalStock < 5) && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {product?.salePrice > 0 && <Badge className="rounded-sm bg-[#8b4f3f] hover:bg-[#8b4f3f]">-{product.salePrice}%</Badge>}
              {product?.totalStock > 0 && product?.totalStock < 5 && <Badge className="rounded-sm bg-white text-[#493f38] hover:bg-white">Faqat {product.totalStock} ta</Badge>}
            </div>
          )}
        </div>
        <CardContent className="p-4 pb-2">
          <h2 className="mb-2 line-clamp-2 min-h-12 cursor-pointer text-base font-semibold text-[#29241f]">{product?.title}</h2>
          <div className="mb-3 flex items-center justify-between gap-2 text-xs text-[#82776f]">
            <span>{categoryOptionsMap[product?.category] || product?.category}</span>
            <span className="truncate text-right">{brandOptionsMap[product?.brand] || product?.brand}</span>
          </div>
          <div className="flex min-h-8 items-center gap-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-sm text-[#82776f]`}
            >
              ${Number(product?.price).toFixed(2)}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-base font-semibold text-[#8b4f3f]">
                ${calculateSale()}
              </span>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter className="gap-2 px-4 pb-4 pt-2">
        {product?.totalStock === 0 ? (
          <Button disabled className="w-full rounded-sm bg-[#d5cec7] text-[#5d554f]">
            Sotuvda yo'q
          </Button>
        ) : (
          <div className="flex w-full items-center gap-2">
            <Button
              onClick={() => {
                if (user) {
                  handleAddtoCart(product?._id, product?.totalStock)
                } else {
                  toast.error("Xarid qilish uchun tizimga kiring")
                }
              }}
              className="h-10 w-full rounded-sm bg-[#493f38] text-white hover:bg-[#68574b]"
            >
              Savatga qo'shish
            </Button>
            <Button
              onClick={() => {
                if (!isLoading) {
                  if (user) {
                    toggleWishlist(product?._id)
                  } else {
                    toast.error("Istaklar ro'yxatiga qo'shish uchun tizimga kiring")
                  }
                }
              }}
              title="Istaklar ro'yxatiga qo'shish"
              aria-label="Istaklar ro'yxatiga qo'shish"
              variant="outline"
              className="h-10 w-11 shrink-0 rounded-sm border-[#d8c9be] text-[#493f38]"
            >
              {wishlistItems?.items?.find((el) => el?.productId === product?._id) ? (
                <HeartIcon className="size-5" fill="currentColor" />
              ) : (
                <HeartIcon className="size-5" />
              )}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;