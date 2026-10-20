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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { toast } from "react-toastify";
import { CreditCard, Loader2, Lock, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { checkoutURL } = useSelector((state) => state.shopOrder); // Redux slice bilan mos
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems?.items?.length > 0
      ? cartItems.items.reduce(
        (sum, item) =>
          sum +
          (item?.price - (Number(item?.price) * Number(item?.salePrice) / 100)) * item.quantity,
        0
      )
      : 0;

  const handleInitiatePayment = () => {
    if (!cartItems?.items || cartItems.items.length === 0) {
      toast.warning("Savatingiz bo'sh. Avval mahsulot qo'shing");
      return;
    }

    if (!currentSelectedAddress) {
      toast.warning("Iltimos, yetkazib berish manzilini tanlang");
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: Number(item.price),
        salePrice: item.salePrice,
        quantity: item.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        district: currentSelectedAddress?.district,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((res) => {
      if (res?.payload?.success && res?.payload?.url) {
        setIsPaymentStart(true);
        // to‘lov sahifasiga yo‘naltirish
        window.location.href = res.payload.url;
      } else {
        setIsPaymentStart(false);
        toast.error("To'lovni boshlab bo'lmadi. Qayta urinib ko'ring");
      }
    });
  };

  const itemCount = cartItems?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="bg-ivory pb-20">
      <section className="relative overflow-hidden border-b border-sand bg-cream">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-petal/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-14">
          <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Xaridni yakunlash</p>
          <h1 className="mt-3 animate-fade-up font-display text-5xl font-medium text-espresso [animation-delay:100ms]">Rasmiylashtirish</h1>
          <div className="mt-6 flex animate-fade-up items-center gap-3 text-xs font-medium text-taupe [animation-delay:200ms]">
            <span className="flex items-center gap-2 text-espresso"><span className="grid h-6 w-6 place-items-center rounded-full bg-espresso text-[10px] text-ivory">1</span> Manzil</span>
            <span className="h-px w-8 bg-sand" />
            <span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full border border-taupe/40 text-[10px]">2</span> To'lov</span>
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
            Buyurtmangiz
            <span className="font-body text-xs font-normal text-taupe">{itemCount} ta mahsulot</span>
          </h2>

          {cartItems?.items?.length ? (
            <div className="nafis-scroll mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {cartItems.items.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-sand px-4 py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-rose" strokeWidth={1.4} />
              <p className="mt-3 text-sm text-taupe">Savatingiz bo'sh</p>
              <Button
                variant="outline"
                onClick={() => navigate("/shop/listing")}
                className="mt-4 rounded-full border-sand"
              >
                Mahsulotlarni ko'rish
              </Button>
            </div>
          )}

          <div className="mt-6 space-y-2 border-t border-sand pt-5 text-sm">
            <div className="flex justify-between text-taupe">
              <span>Oraliq summa</span>
              <span>{formatPrice(totalCartAmount)}</span>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <span className="font-display text-xl font-semibold text-espresso">Jami</span>
              <span className="font-display text-3xl font-semibold text-espresso">{formatPrice(totalCartAmount)}</span>
            </div>
          </div>

          {!currentSelectedAddress && cartItems?.items?.length ? (
            <p className="mt-4 rounded-xl bg-blush/60 px-4 py-2.5 text-xs text-rose-deep">
              Davom etish uchun chap tomondan manzilni tanlang
            </p>
          ) : null}

          <Button
            onClick={handleInitiatePayment}
            className="group mt-5 h-13 w-full rounded-full bg-espresso py-4 text-sm font-semibold tracking-wide text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha hover:shadow-lg hover:shadow-mocha/25"
            disabled={isPaymentStart}
          >
            {isPaymentStart ? (
              <>
                <Loader2 className="animate-spin" />
                To'lov sahifasiga o'tilmoqda...
              </>
            ) : (
              <>
                <CreditCard />
                Stripe orqali to'lash
              </>
            )}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-taupe">
            <Lock className="h-3 w-3" /> To'lov xavfsiz ulanish orqali amalga oshiriladi
          </p>
        </aside>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
