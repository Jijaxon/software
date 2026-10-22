import {Flame, HeartIcon, ImagePlus, MessageCircle, ShieldCheck, ShoppingBag, Sparkles, Timer, X} from "lucide-react";
import {formatPrice} from "@/lib/utils";
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
import {useTaxonomyLabels} from "@/lib/use-taxonomy-labels.js";
import Countdown from "@/components/common/countdown.jsx";
import ShareButtons from "@/components/shopping-view/share-buttons.jsx";
import {useT} from "@/i18n/index.jsx";

const MAX_REVIEW_IMAGES = 3;

function ProductDetailsDialog({ open, setOpen, productDetails, onClose }) {
  const dispatch = useDispatch();
  const {t} = useT();
  const {categoryLabel, brandLabel} = useTaxonomyLabels();

  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewImages, setReviewImages] = useState([]);
  const [heartKey, setHeartKey] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const {wishlistItems} = useSelector(state => state.shopWishlist)
  const lowStockThreshold = useSelector((state) => state.growth.settings.lowStockThreshold) || 5;

  const isInWishlist = Boolean(wishlistItems?.items?.find((el) => el?.productId === productDetails?._id));
  const hasTimedSale = productDetails?.salePrice > 0 && productDetails?.saleEndsAt && new Date(productDetails.saleEndsAt) > new Date();

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
          toast.warning(t("toast.onlyCanAdd", {count: getQuantity}));
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
        toast.success(t("toast.addedToCart"));
      }
    });
  }

  function resetReviewForm() {
    setRating(0);
    setReviewMsg("");
    reviewImages.forEach((item) => URL.revokeObjectURL(item.preview));
    setReviewImages([]);
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    resetReviewForm();
    onClose?.();
  }

  function handlePickImages(event) {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    const room = MAX_REVIEW_IMAGES - reviewImages.length;
    const next = files.slice(0, room).map((file) => ({file, preview: URL.createObjectURL(file)}));
    setReviewImages((prev) => [...prev, ...next]);
    event.target.value = "";
  }

  function removeReviewImage(index) {
    setReviewImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleAddReview() {
    if (!user) {
      toast.error(t("toast.loginToReview"));
      return;
    }
    if (!rating) {
      toast.warning(t("toast.chooseRating"));
      return;
    }

    const body = new FormData();
    body.append("productId", productDetails?._id);
    body.append("reviewMessage", reviewMsg);
    body.append("reviewValue", String(rating));
    reviewImages.forEach((item) => body.append("review_images", item.file));

    dispatch(addReview(body)).then((data) => {
      if (data?.payload?.success) {
        resetReviewForm();
        dispatch(getReviews(productDetails?._id));
        toast.success(t("toast.reviewThanks"));
      } else if (data?.payload?.message) {
        toast.error(data.payload.message);
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
        toast.info(t("toast.wishlistRemoved"))
      })
    } else {
      dispatch(addToWishlist({productId, userId: user?.id})).then(() => {
        dispatch(fetchWishlistItems(user?.id))
        toast.success(t("toast.wishlistAdded"))
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
              {t("product.discount", {value: productDetails?.salePrice})}
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
              {brandLabel(productDetails?.brand)}
              <span className="text-taupe">·</span>
              <span className="text-taupe">{categoryLabel(productDetails?.category)}</span>
            </p>
            <DialogTitle className="mt-3 font-display text-3xl font-semibold leading-tight text-espresso sm:text-4xl">
              {productDetails?.title}
            </DialogTitle>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-0.5">
                <StarRatingComponent rating={averageReview} size="sm" />
              </div>
              <span className="text-xs text-taupe">
                {averageReview.toFixed(1)} · {t("product.reviewsCount", {count: reviews?.length || 0})}
              </span>
              {productDetails?.soldCount > 0 ? (
                <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-mocha">
                  {t("product.sold", {count: productDetails.soldCount})}
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              {productDetails?.salePrice > 0 ? (
                <>
                  <span className="font-display text-4xl font-semibold text-rose-deep">{formatPrice(calculateSale())}</span>
                  <span className="text-lg text-taupe line-through">{formatPrice(productDetails?.price)}</span>
                </>
              ) : (
                <span className="font-display text-4xl font-semibold text-espresso">{formatPrice(productDetails?.price)}</span>
              )}
            </div>

            {hasTimedSale ? (
              <div className="mt-4 flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-deep to-rose px-4 py-2.5 text-white shadow-lg shadow-rose/30">
                <Timer className="h-4 w-4"/>
                <span className="text-xs font-medium">{t("countdown.saleEnds")}</span>
                <Countdown endsAt={productDetails.saleEndsAt} className="font-display text-lg font-semibold"/>
              </div>
            ) : null}

            <DialogDescription className="mt-5 text-[15px] leading-7 text-mocha/90">
              {productDetails?.description}
            </DialogDescription>
          </div>

          <div className="mt-8 flex animate-fade-up items-center gap-3 [animation-delay:120ms]">
            {productDetails?.totalStock === 0 ? (
              <Button disabled className="h-12 flex-1 rounded-full bg-sand text-mocha">
                {t("product.outOfStock")}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (user) {
                    handleAddToCart(productDetails?._id, productDetails?.totalStock)
                  } else {
                    toast.error(t("toast.loginToBuy"))
                  }
                }}
                className="group h-12 flex-1 rounded-full bg-espresso text-sm font-semibold tracking-wide text-ivory transition-all duration-300 hover:bg-mocha hover:shadow-lg hover:shadow-mocha/25"
              >
                <ShoppingBag className="transition-transform duration-300 group-hover:-rotate-12" />
                {t("product.addToCart")}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (user) {
                  toggleWishlist(productDetails?._id)
                } else {
                  toast.error(t("toast.loginToWishlist"))
                }
              }}
              aria-label={t("product.addWishlist")}
              className={`h-12 w-12 shrink-0 rounded-full border-sand bg-white transition-all duration-300 hover:border-petal hover:bg-blush ${isInWishlist ? "text-rose-deep" : "text-mocha"}`}
            >
              <HeartIcon
                key={heartKey}
                className={`!h-5 !w-5 ${heartKey ? "animate-heart" : ""}`}
                fill={isInWishlist ? "currentColor" : "none"}
              />
            </Button>
          </div>

          {productDetails?.totalStock > 0 && productDetails?.totalStock <= lowStockThreshold ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-deep">
              <Flame className="h-3.5 w-3.5 animate-pulse"/>
              {t("product.hurry", {count: productDetails?.totalStock})}
            </p>
          ) : null}

          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-xs text-mocha">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sage"/>
            {t("product.original")}
          </div>

          <div className="mt-5">
            <ShareButtons product={productDetails}/>
          </div>

          <div className="mt-10">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-espresso">
              <MessageCircle className="h-5 w-5 text-rose" strokeWidth={1.6}/>
              {t("product.reviews")}
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
                        {(reviewItem?.userName || reviewItem?.userId?.username || "?").replace(/^\+/, "")[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 gap-1">
                      <h3 className="text-sm font-semibold text-espresso">{reviewItem?.userName || reviewItem?.userId?.username}</h3>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} size="sm" />
                      </div>
                      {reviewItem?.reviewMessage ? (
                        <p className="text-sm leading-6 text-mocha/90">{reviewItem.reviewMessage}</p>
                      ) : null}
                      {reviewItem?.images?.length ? (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {reviewItem.images.map((src) => (
                            <button
                              key={src}
                              onClick={() => setLightbox(instance.defaults.baseURL + src)}
                              className="h-20 w-20 overflow-hidden rounded-xl border border-sand transition-transform hover:scale-105"
                            >
                              <img src={instance.defaults.baseURL + src} alt="" loading="lazy" className="h-full w-full object-cover"/>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-sand px-4 py-6 text-center text-sm text-taupe">
                  {t("product.noReviews")}
                </p>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-sand bg-white p-5">
              <p className="text-sm font-semibold text-espresso">{t("product.leaveReview")}</p>
              <div className="mt-3 flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                  size="lg"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {reviewImages.map((item, index) => (
                  <div key={item.preview} className="relative h-16 w-16 overflow-hidden rounded-xl border border-sand">
                    <img src={item.preview} alt="" className="h-full w-full object-cover"/>
                    <button
                      onClick={() => removeReviewImage(index)}
                      className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-espresso/80 text-white"
                      aria-label="remove"
                    >
                      <X className="h-3 w-3"/>
                    </button>
                  </div>
                ))}
                {reviewImages.length < MAX_REVIEW_IMAGES ? (
                  <label className="flex h-16 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-petal px-3 text-xs text-mocha transition-colors hover:bg-blush/40">
                    <ImagePlus className="h-4 w-4 text-rose-deep"/>
                    <span>
                      {t("product.addPhotos")}
                      <span className="block text-[10px] text-taupe">{t("product.photosHint")}</span>
                    </span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePickImages}/>
                  </label>
                ) : null}
              </div>

              <div className="mt-4 flex gap-2">
                <Input
                  name="reviewMsg"
                  value={reviewMsg}
                  onChange={(event) => setReviewMsg(event.target.value)}
                  placeholder={t("product.reviewPlaceholder")}
                  className="h-11 rounded-full border-sand bg-ivory px-4 focus-visible:ring-rose"
                />
                <Button
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === "" && reviewImages.length === 0}
                  className="h-11 rounded-full bg-espresso px-5 text-ivory hover:bg-mocha"
                >
                  {t("product.send")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {lightbox ? (
          <button
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-espresso/80 p-6 backdrop-blur-sm"
            aria-label={t("common.close")}
          >
            <img src={lightbox} alt="" className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"/>
          </button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
