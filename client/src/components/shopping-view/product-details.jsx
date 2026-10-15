import {HeartIcon, MessageCircle, ShieldCheck, ShoppingBag, Sparkles} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { setProductDetails } from "@/store/shop/products-slice";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import  {toast} from "react-toastify";
import instance from "@/utils/axios.js";
import {addToWishlist, deleteWishlistItem, fetchWishlistItems} from "@/store/shop/wishlist-slice/index.js";
import {brandOptionsMap, categoryOptionsMap} from "@/config";


function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const dispatch = useDispatch();

  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [heartKey, setHeartKey] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const {wishlistItems} = useSelector(state => state.shopWishlist)

  const isInWishlist = Boolean(wishlistItems?.items?.find((el) => el?.productId === productDetails?._id));

  function calculateSale() {
    return (productDetails?.price - (Number(productDetails?.price) * Number(productDetails?.salePrice) / 100)).toFixed(2)
  }

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast.warning(`Bu mahsulotdan faqat ${getQuantity} ta qo'shish mumkin`);

          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast.success("Mahsulot savatga qo'shildi");
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    if (!user) {
      toast.error("Fikr qoldirish uchun tizimga kiring");
      return;
    }
    if (!rating) {
      toast.warning("Iltimos, baho tanlang");
      return;
    }

    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast.success("Fikringiz uchun rahmat!");
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
      reviews.length
      : 0;

  function toggleWishlist(productId) {
    setHeartKey((key) => key + 1);
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
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-h-[92vh] w-[94vw] max-w-5xl gap-0 overflow-hidden rounded-[28px] border-sand bg-ivory p-0 sm:rounded-[28px] md:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-cream md:block">
          <img
            src={instance.defaults.baseURL + productDetails?.image}
            alt={productDetails?.title}
            className="h-full max-h-[92vh] w-full animate-ken-burns object-cover"
          />
          {productDetails?.salePrice > 0 ? (
            <span className="absolute left-5 top-5 animate-pop rounded-full bg-rose-deep px-3 py-1.5 text-xs font-semibold text-white shadow">
              -{productDetails?.salePrice}% chegirma
            </span>
          ) : null}
        </div>

        <div className="nafis-scroll max-h-[92vh] overflow-y-auto p-6 sm:p-10">
          <div className="mb-5 overflow-hidden rounded-2xl bg-cream md:hidden">
            <img
              src={instance.defaults.baseURL + productDetails?.image}
              alt={productDetails?.title}
              className="aspect-square w-full object-cover"
            />
          </div>

          <div className="animate-fade-up">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-deep">
              <Sparkles className="h-3.5 w-3.5"/>
              {brandOptionsMap[productDetails?.brand] || productDetails?.brand}
              <span className="text-taupe">·</span>
              <span className="text-taupe">{categoryOptionsMap[productDetails?.category] || productDetails?.category}</span>
            </p>
            <DialogTitle className="mt-3 font-display text-3xl font-semibold leading-tight text-espresso sm:text-4xl">
              {productDetails?.title}
            </DialogTitle>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <StarRatingComponent rating={averageReview} size="sm" />
              </div>
              <span className="text-xs text-taupe">
                {averageReview.toFixed(1)} · {reviews?.length || 0} ta fikr
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              {productDetails?.salePrice > 0 ? (
                <>
                  <span className="font-display text-4xl font-semibold text-rose-deep">${calculateSale()}</span>
                  <span className="text-lg text-taupe line-through">${Number(productDetails?.price).toFixed(2)}</span>
                </>
              ) : (
                <span className="font-display text-4xl font-semibold text-espresso">${Number(productDetails?.price || 0).toFixed(2)}</span>
              )}
            </div>

            <DialogDescription className="mt-5 text-[15px] leading-7 text-mocha/90">
              {productDetails?.description}
            </DialogDescription>
          </div>

          <div className="mt-8 flex animate-fade-up items-center gap-3 [animation-delay:120ms]">
            {productDetails?.totalStock === 0 ? (
              <Button disabled className="h-12 flex-1 rounded-full bg-sand text-mocha">
                Sotuvda yo'q
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (user) {
                    handleAddToCart(productDetails?._id, productDetails?.totalStock)
                  } else {
                    toast.error("Xarid qilish uchun tizimga kiring")
                  }
                }}
                className="group h-12 flex-1 rounded-full bg-espresso text-sm font-semibold tracking-wide text-ivory transition-all duration-300 hover:bg-mocha hover:shadow-lg hover:shadow-mocha/25"
              >
                <ShoppingBag className="transition-transform duration-300 group-hover:-rotate-12" />
                Savatga qo'shish
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (user) {
                  toggleWishlist(productDetails?._id)
                } else {
                  toast.error("Istaklar ro'yxatiga qo'shish uchun tizimga kiring")
                }
              }}
              aria-label="Istaklar ro'yxati"
              className={`h-12 w-12 shrink-0 rounded-full border-sand bg-white transition-all duration-300 hover:border-petal hover:bg-blush ${isInWishlist ? "text-rose-deep" : "text-mocha"}`}
            >
              <HeartIcon
                key={heartKey}
                className={`!h-5 !w-5 ${heartKey ? "animate-heart" : ""}`}
                fill={isInWishlist ? "currentColor" : "none"}
              />
            </Button>
          </div>

          {productDetails?.totalStock > 0 && productDetails?.totalStock < 5 ? (
            <p className="mt-3 text-xs font-medium text-rose-deep">Shoshiling — omborda faqat {productDetails?.totalStock} ta qoldi</p>
          ) : null}

          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-xs text-mocha">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sage"/>
            Original mahsulot, ishonchli brenddan
          </div>

          <div className="mt-10">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-espresso">
              <MessageCircle className="h-5 w-5 text-rose" strokeWidth={1.6}/>
              Mijozlar fikri
            </h2>
            <div className="mt-5 grid gap-4">
              {reviews && reviews.length > 0 ? (
                reviews?.map((reviewItem, index) => (
                  <div
                    className="flex animate-fade-up gap-3 rounded-2xl border border-sand bg-white p-4"
                    style={{animationDelay: `${index * 60}ms`}}
                    key={reviewItem?._id}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blush text-sm font-semibold text-rose-deep">
                        {(reviewItem?.userName || reviewItem?.userId?.username || "?")[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 gap-1">
                      <h3 className="text-sm font-semibold text-espresso">{reviewItem?.userName || reviewItem?.userId?.username}</h3>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} size="sm" />
                      </div>
                      <p className="text-sm leading-6 text-mocha/90">
                        {reviewItem?.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-sand px-4 py-6 text-center text-sm text-taupe">
                  Hali fikr qoldirilmagan. Birinchi bo'ling!
                </p>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-sand bg-white p-5">
              <p className="text-sm font-semibold text-espresso">Fikr qoldiring</p>
              <div className="mt-3 flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                  size="lg"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  name="reviewMsg"
                  value={reviewMsg}
                  onChange={(event) => setReviewMsg(event.target.value)}
                  placeholder="Mahsulot haqida fikringiz..."
                  className="h-11 rounded-full border-sand bg-ivory px-4 focus-visible:ring-rose"
                />
                <Button
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === ""}
                  className="h-11 rounded-full bg-espresso px-5 text-ivory hover:bg-mocha"
                >
                  Yuborish
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
