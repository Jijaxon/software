import { Button } from "@/components/ui/button";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {Sparkles} from "lucide-react";
import {confirmPayment} from "@/store/shop/order-slice/index.js";
import {clearCartItems, fetchCartItems} from "@/store/shop/cart-slice/index.js";
import {useT} from "@/i18n/index.jsx";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const {t} = useT();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

    if (sessionId && orderId) {
      dispatch(confirmPayment({ sessionId, orderId }))
        .then(() => {
          dispatch(clearCartItems({userId: user?.id}))
        })
        .catch((err) => {
          console.error("Payment confirmation failed:", err);
        });
    } else if (searchParams.get("paid") && user?.id) {
      // Bonus bilan to'langan buyurtma serverda allaqachon yakunlangan — savatni yangilaymiz
      dispatch(fetchCartItems(user.id));
    }
  }, [searchParams, dispatch]);

  return (
    <div className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-ivory px-5 py-20">
      <div className="pointer-events-none absolute left-[15%] top-[20%] h-56 w-56 animate-float rounded-full bg-petal/40 blur-3xl"/>
      <div className="pointer-events-none absolute bottom-[15%] right-[15%] h-64 w-64 animate-float rounded-full bg-gold/25 blur-3xl [animation-delay:2s]"/>

      <div className="relative w-full max-w-lg animate-fade-up rounded-[32px] border border-sand bg-white/80 p-10 text-center shadow-2xl shadow-mocha/10 backdrop-blur md:p-14">
        <div className="relative mx-auto grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-sage/20 [animation-iteration-count:2]"/>
          <span className="absolute inset-0 animate-pop rounded-full bg-[#e6efe6]"/>
          <svg viewBox="0 0 24 24" className="relative h-11 w-11 text-sage" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="48" className="animate-draw"/>
          </svg>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">
          <Sparkles className="h-3.5 w-3.5"/> {t("success.eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium text-espresso md:text-5xl">
          {t("success.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-mocha/80">
          {t("success.text")}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            className="h-12 rounded-full bg-espresso px-7 text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha"
            onClick={() => navigate("/shop/account")}
          >
            {t("success.orders")}
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-full border-sand bg-transparent px-7 hover:bg-blush"
            onClick={() => navigate("/shop/listing")}
          >
            {t("success.continue")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
