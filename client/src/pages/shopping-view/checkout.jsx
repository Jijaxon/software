// import Address from "@/components/shopping-view/address";
import {formatPrice} from "@/lib/utils";
// import img from "../../assets/account.jpg";
// import { useDispatch, useSelector } from "react-redux";
// import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { createNewOrder } from "@/store/shop/order-slice";
// import { Navigate } from "react-router-dom";
// import {toast} from "react-toastify";
//
// function ShoppingCheckout() {
//   const { cartItems } = useSelector((state) => state.shopCart);
//   const { user } = useSelector((state) => state.auth);
//   const { approvalURL } = useSelector((state) => state.shopOrder);
//   const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
//   const [isPaymentStart, setIsPaymemntStart] = useState(false);
//   const dispatch = useDispatch();
//
//   console.log(currentSelectedAddress, "cartItems");
//
//   const totalCartAmount =
//     cartItems && cartItems.items && cartItems.items.length > 0
//       ? cartItems.items.reduce(
//         (sum, currentItem) =>
//           sum +
//           (currentItem?.salePrice > 0
//             ? currentItem?.salePrice
//             : currentItem?.price) *
//           currentItem?.quantity,
//         0
//       )
//       : 0;
//
//   function handleInitiatePaypalPayment() {
//     if (cartItems.length === 0) {
//       toast.warning("Your cart is empty. Please add items to proceed");
//
//       return;
//     }
//     if (currentSelectedAddress === null) {
//       toast.warning("Please select one address to proceed.");
//
//       return;
//     }
//
//     const orderData = {
//       userId: user?.id,
//       cartId: cartItems?._id,
//       cartItems: cartItems.items.map((singleCartItem) => ({
//         productId: singleCartItem?.productId,
//         title: singleCartItem?.title,
//         image: singleCartItem?.image,
//         price:
//           singleCartItem?.salePrice > 0
//             ? singleCartItem?.salePrice
//             : singleCartItem?.price,
//         quantity: singleCartItem?.quantity,
//       })),
//       addressInfo: {
//         addressId: currentSelectedAddress?._id,
//         address: currentSelectedAddress?.address,
//         city: currentSelectedAddress?.city,
//         pincode: currentSelectedAddress?.pincode,
//         phone: currentSelectedAddress?.phone,
//         notes: currentSelectedAddress?.notes,
//       },
//       orderStatus: "pending",
//       paymentMethod: "paypal",
//       paymentStatus: "pending",
//       totalAmount: totalCartAmount,
//       orderDate: new Date(),
//       orderUpdateDate: new Date(),
//       paymentId: "",
//       payerId: "",
//     };
//
//     dispatch(createNewOrder(orderData)).then((data) => {
//       if (data?.payload?.success) {
//         setIsPaymemntStart(true);
//       } else {
//         setIsPaymemntStart(false);
//       }
//     });
//   }
//
//   if (approvalURL) {
//     window.location.href = approvalURL;
//   }
//
//   return (
//     <div className="flex flex-col">
//       <div className="relative h-[300px] w-full overflow-hidden">
//         <img src={img} alt={"image"} className="h-full w-full object-cover object-center" />
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
//         <Address
//           selectedId={currentSelectedAddress}
//           setCurrentSelectedAddress={setCurrentSelectedAddress}
//         />
//         <div className="flex flex-col gap-4">
//           {cartItems && cartItems.items && cartItems.items.length > 0
//             ? cartItems.items.map((item) => (
//               <UserCartItemsContent cartItem={item} />
//             ))
//             : null}
//           <div className="mt-8 space-y-4">
//             <div className="flex justify-between">
//               <span className="font-bold">Total</span>
//               <span className="font-bold">${totalCartAmount}</span>
//             </div>
//           </div>
//           <div className="mt-4 w-full">
//             <Button onClick={handleInitiatePaypalPayment} className="w-full">
//               {isPaymentStart
//                 ? "Processing Paypal Payment..."
//                 : "Checkout with Paypal"}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
//
// export default ShoppingCheckout;

import Address from "@/components/shopping-view/address";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import FreeDeliveryProgress from "@/components/shopping-view/free-delivery-progress";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { fetchQuote } from "@/store/shop/growth-slice";
import { toast } from "react-toastify";
import { CheckCircle2, CreditCard, Gem, Loader2, Lock, ShoppingBag, TicketPercent, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useT } from "@/i18n/index.jsx";
import { useDocumentTitle } from "@/lib/use-document-title.js";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [useBonus, setUseBonus] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useT();
  useDocumentTitle(t("checkout.title"));

  // Narx tarkibini serverdan olamiz (savat, promokod yoki bonus o'zgarganda)
  const refreshQuote = useCallback(async (couponCode, withBonus) => {
    setQuoteLoading(true);
    const res = await dispatch(fetchQuote({ couponCode, useBonus: withBonus }));
    setQuoteLoading(false);
    if (res?.payload && !res.error) setQuote(res.payload);
    return res?.payload;
  }, [dispatch]);

  const cartSignature = cartItems?.items?.map((item) => `${item.productId}:${item.quantity}`).join(",") || "";

  useEffect(() => {
    refreshQuote(appliedCoupon, useBonus);
  }, [cartSignature, appliedCoupon, useBonus, refreshQuote]);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const result = await refreshQuote(code, useBonus);
    if (result?.couponError) {
      toast.error(result.couponError);
      return;
    }
    if (result?.coupon) {
      setAppliedCoupon(result.coupon.code);
      toast.success(t("checkout.couponApplied", { code: result.coupon.code }));
    }
  }

  function removeCoupon() {
    setAppliedCoupon("");
    setCouponInput("");
  }

  const handleInitiatePayment = () => {
    if (!cartItems?.items || cartItems.items.length === 0) {
      toast.warning(t("checkout.emptyCart"));
      return;
    }

    if (!currentSelectedAddress) {
      toast.warning(t("checkout.chooseAddress"));
      return;
    }

    // Narx va summa serverda qayta hisoblanadi — bu yerdan faqat tanlovlar yuboriladi
    const orderData = {
      couponCode: appliedCoupon || undefined,
      useBonus,
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        district: currentSelectedAddress?.district,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
    };

    setIsPaymentStart(true);
    dispatch(createNewOrder(orderData)).then((res) => {
      if (res?.payload?.success && res?.payload?.url) {
        window.location.href = res.payload.url;
      } else {
        setIsPaymentStart(false);
        toast.error(res?.payload?.message || t("checkout.failed"));
      }
    });
  };

  const itemCount = cartItems?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = quote?.subtotal ?? 0;
  const total = quote?.total ?? 0;
  const coveredByBonus = quote && quote.total === 0 && quote.subtotal > 0;

  return (
    <div className="bg-ivory pb-20">
      <section className="relative overflow-hidden border-b border-sand bg-cream">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-petal/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-14">
          <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">{t("checkout.eyebrow")}</p>
          <h1 className="mt-3 animate-fade-up font-display text-5xl font-medium text-espresso [animation-delay:100ms]">{t("checkout.title")}</h1>
          <div className="mt-6 flex animate-fade-up items-center gap-3 text-xs font-medium text-taupe [animation-delay:200ms]">
            <span className="flex items-center gap-2 text-espresso"><span className="grid h-6 w-6 place-items-center rounded-full bg-espresso text-[10px] text-ivory">1</span> {t("checkout.stepAddress")}</span>
            <span className="h-px w-8 bg-sand" />
            <span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full border border-taupe/40 text-[10px]">2</span> {t("checkout.stepPayment")}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 pt-10 md:px-10 lg:grid-cols-[1fr_420px]">
        <div className="animate-fade-up">
          <Address
            selectedId={currentSelectedAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
        </div>

        <aside className="h-fit animate-fade-up rounded-3xl border border-sand bg-white p-6 shadow-xl shadow-mocha/5 [animation-delay:150ms] lg:sticky lg:top-24">
          <h2 className="flex items-baseline justify-between font-display text-2xl font-semibold text-espresso">
            {t("checkout.yourOrder")}
            <span className="font-body text-xs font-normal text-taupe">{t("checkout.items", { count: itemCount })}</span>
          </h2>

          {cartItems?.items?.length ? (
            <div className="nafis-scroll mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {cartItems.items.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-sand px-4 py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-rose" strokeWidth={1.4} />
              <p className="mt-3 text-sm text-taupe">{t("cart.empty")}</p>
              <Button
                variant="outline"
                onClick={() => navigate("/shop/listing")}
                className="mt-4 rounded-full border-sand"
              >
                {t("checkout.viewProducts")}
              </Button>
            </div>
          )}

          {cartItems?.items?.length ? (
            <>
              <FreeDeliveryProgress subtotal={subtotal} className="mt-5" />

              {/* Promokod */}
              <div className="mt-5">
                <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">
                  <TicketPercent className="h-3.5 w-3.5 text-rose-deep" /> {t("checkout.coupon")}
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-2xl border border-sage/40 bg-[#eef4ee] px-4 py-3 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-sage">
                      <CheckCircle2 className="h-4 w-4" /> {appliedCoupon}
                    </span>
                    <button onClick={removeCoupon} className="flex items-center gap-1 text-xs text-mocha hover:text-rose-deep">
                      <X className="h-3.5 w-3.5" /> {t("checkout.remove")}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder={t("checkout.couponPlaceholder")}
                      className="h-11 min-w-0 flex-1 rounded-full border border-sand bg-ivory px-4 text-sm uppercase tracking-wider text-espresso outline-none transition-all placeholder:normal-case placeholder:tracking-normal placeholder:text-taupe/70 focus:border-petal focus:ring-4 focus:ring-blush"
                    />
                    <Button
                      onClick={applyCoupon}
                      disabled={!couponInput.trim() || quoteLoading}
                      variant="outline"
                      className="h-11 rounded-full border-espresso/20 px-5 hover:bg-espresso hover:text-ivory"
                    >
                      {t("checkout.apply")}
                    </Button>
                  </div>
                )}
              </div>

              {/* Bonus */}
              {quote?.bonusAvailable > 0 ? (
                <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-sand bg-cream/60 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-espresso">
                    <Gem className="h-4 w-4 text-gold" />
                    <span>
                      {t("checkout.useBonus")}
                      <span className="block text-[11px] text-taupe">
                        {t("checkout.bonusAvailable", { amount: formatPrice(quote.bonusAvailable) })}
                      </span>
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={useBonus}
                    onChange={(e) => setUseBonus(e.target.checked)}
                    className="h-5 w-5 accent-rose-deep"
                  />
                </label>
              ) : null}
            </>
          ) : null}

          <div className={`mt-6 space-y-2 border-t border-sand pt-5 text-sm transition-opacity ${quoteLoading ? "opacity-60" : ""}`}>
            <div className="flex justify-between text-taupe">
              <span>{t("checkout.subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {cartItems?.items?.length ? (
              <div className="flex justify-between text-taupe">
                <span>{t("checkout.delivery")}</span>
                <span className={quote?.deliveryFee === 0 ? "font-semibold text-sage" : ""}>
                  {quote?.deliveryFee === 0 ? t("checkout.free") : formatPrice(quote?.deliveryFee)}
                </span>
              </div>
            ) : null}
            {quote?.discount > 0 ? (
              <div className="flex justify-between text-rose-deep">
                <span>{t("checkout.discount")}</span>
                <span>−{formatPrice(quote.discount)}</span>
              </div>
            ) : null}
            {quote?.bonusUsed > 0 ? (
              <div className="flex justify-between text-gold">
                <span>{t("checkout.bonus")}</span>
                <span>−{formatPrice(quote.bonusUsed)}</span>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between pt-2">
              <span className="font-display text-xl font-semibold text-espresso">{t("checkout.total")}</span>
              <span className="font-display text-3xl font-semibold text-espresso">
                {quoteLoading && !quote ? <Loader2 className="h-5 w-5 animate-spin" /> : formatPrice(total)}
              </span>
            </div>
          </div>

          {!currentSelectedAddress && cartItems?.items?.length ? (
            <p className="mt-4 rounded-xl bg-blush/60 px-4 py-2.5 text-xs text-rose-deep">
              {t("checkout.selectAddress")}
            </p>
          ) : null}

          <Button
            onClick={handleInitiatePayment}
            className="group mt-5 h-13 w-full rounded-full bg-espresso py-4 text-sm font-semibold tracking-wide text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha hover:shadow-lg hover:shadow-mocha/25"
            disabled={isPaymentStart || !quote || quoteLoading}
          >
            {isPaymentStart ? (
              <>
                <Loader2 className="animate-spin" />
                {t("checkout.redirecting")}
              </>
            ) : (
              <>
                {coveredByBonus ? <Gem /> : <CreditCard />}
                {coveredByBonus ? t("checkout.payWithBonus") : t("checkout.pay")}
              </>
            )}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-taupe">
            <Lock className="h-3 w-3" /> {t("checkout.secure")}
          </p>
        </aside>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
