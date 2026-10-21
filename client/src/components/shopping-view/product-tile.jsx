import {useState} from "react";
import {formatPrice} from "@/lib/utils";
import {useTaxonomyLabels} from "@/lib/use-taxonomy-labels.js";
import instance from "@/utils/axios.js";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import {Eye, HeartIcon, ShoppingBag} from "lucide-react";
import {addToWishlist, deleteWishlistItem, fetchWishlistItems} from "@/store/shop/wishlist-slice/index.js";

function ShoppingProductTile({
                               product,
                               handleGetProductDetails,
                               handleAddtoCart,
                             }) {

  const dispatch = useDispatch()
  const [heartKey, setHeartKey] = useState(0)
  const {categoryLabel, brandLabel} = useTaxonomyLabels()

  const {user} = useSelector(state => state.auth)
  const {wishlistItems, isLoading} = useSelector(state => state.shopWishlist)

  const isInWishlist = Boolean(wishlistItems?.items?.find((el) => el?.productId === product?._id))
  const isOutOfStock = product?.totalStock === 0

  function calculateSale() {
    return (product?.price - (Number(product?.price) * Number(product?.salePrice) / 100)).toFixed(2)
  }

  function toggleWishlist(productId) {
    setHeartKey((key) => key + 1)
    if (isInWishlist) {
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
    <article className="group relative mx-auto flex w-full max-w-sm flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-cream">
        <img
          src={instance.defaults.baseURL + product?.image}
          alt={product?.title}
          loading="lazy"
          onClick={() => handleGetProductDetails(product?._id)}
          className={`h-full w-full cursor-pointer object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07] ${isOutOfStock ? "grayscale-[60%]" : ""}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"/>

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product?.salePrice > 0 && (
            <span className="rounded-full bg-rose-deep px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
              -{product.salePrice}%
            </span>
          )}
          {product?.totalStock > 0 && product?.totalStock < 5 && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-mocha backdrop-blur">
              Faqat {product.totalStock} ta qoldi
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-espresso/85 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur">
              Sotuvda yo'q
            </span>
          )}
        </div>

        <button
          onClick={() => {
            if (isLoading) return;
            if (user) {
              toggleWishlist(product?._id)
            } else {
              toast.error("Istaklar ro'yxatiga qo'shish uchun tizimga kiring")
            }
          }}
          title="Istaklar ro'yxatiga qo'shish"
          aria-label="Istaklar ro'yxatiga qo'shish"
          aria-pressed={isInWishlist}
          className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white ${isInWishlist ? "text-rose-deep" : "text-mocha"}`}
        >
          <HeartIcon
            key={heartKey}
            className={`h-[18px] w-[18px] ${heartKey ? "animate-heart" : ""}`}
            fill={isInWishlist ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        </button>

        <button
          onClick={() => handleGetProductDetails(product?._id)}
          aria-label="Batafsil ko'rish"
          className="absolute right-3 top-16 grid h-10 w-10 translate-x-3 place-items-center rounded-full bg-white/90 text-mocha opacity-0 shadow-sm backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white group-hover:translate-x-0 group-hover:opacity-100"
        >
          <Eye className="h-[18px] w-[18px]" strokeWidth={1.8}/>
        </button>

        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-y-[calc(100%+16px)] lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
            <button
              onClick={() => {
                if (user) {
                  handleAddtoCart(product?._id, product?.totalStock)
                } else {
                  toast.error("Xarid qilish uchun tizimga kiring")
                }
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/95 text-[13px] font-semibold text-espresso shadow-lg shadow-espresso/10 backdrop-blur transition-colors duration-300 hover:bg-espresso hover:text-ivory"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.8}/>
              Savatga qo'shish
            </button>
          </div>
        )}
      </div>

      <div className="cursor-pointer px-1 pt-4" onClick={() => handleGetProductDetails(product?._id)}>
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-taupe">
          <span className="truncate">{brandLabel(product?.brand)}</span>
          <span className="truncate text-right normal-case tracking-normal">{categoryLabel(product?.category)}</span>
        </div>
        <h2 className="line-clamp-2 min-h-11 text-[15px] font-medium leading-snug text-espresso transition-colors group-hover:text-rose-deep">
          {product?.title}
        </h2>
        <div className="mt-2 flex items-baseline gap-2">
          {product?.salePrice > 0 ? (
            <>
              <span className="font-display text-xl font-semibold text-rose-deep">{formatPrice(calculateSale())}</span>
              <span className="text-sm text-taupe line-through">{formatPrice(product?.price)}</span>
            </>
          ) : (
            <span className="font-display text-xl font-semibold text-espresso">{formatPrice(product?.price)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ShoppingProductTile;
