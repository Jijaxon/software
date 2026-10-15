import { useNavigate } from "react-router-dom";
import {formatPrice} from "@/lib/utils";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
        (sum, currentItem) =>
          sum +
          (currentItem?.price - (Number(currentItem?.price) * Number(currentItem?.salePrice) / 100)) *
          currentItem?.quantity,
        0
      )
      : 0;

  return (
    <SheetContent className="flex w-full flex-col gap-0 border-sand bg-ivory p-0 sm:max-w-md">
      <SheetHeader className="border-b border-sand px-6 py-5 text-left">
        <SheetTitle className="flex items-baseline gap-2 font-display text-3xl font-semibold text-espresso">
          Savatingiz
          {cartItems?.length ? (
            <span className="font-body text-sm font-normal text-taupe">({cartItems.length})</span>
          ) : null}
        </SheetTitle>
      </SheetHeader>

      {cartItems && cartItems.length > 0 ? (
        <>
          <div className="nafis-scroll flex-1 space-y-3 overflow-y-auto px-6 py-5">
            {cartItems.map((item, index) => (
              <div key={item?.productId || item?._id} className="animate-fade-up" style={{animationDelay: `${index * 60}ms`}}>
                <UserCartItemsContent cartItem={item} />
              </div>
            ))}
          </div>
          <div className="border-t border-sand bg-white/70 px-6 py-6 backdrop-blur">
            <div className="flex items-center justify-between text-sm text-taupe">
              <span>Oraliq summa</span>
              <span>{formatPrice(totalCartAmount)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-display text-xl font-semibold text-espresso">Jami</span>
              <span className="font-display text-2xl font-semibold text-espresso">{formatPrice(totalCartAmount)}</span>
            </div>
            <Button
              onClick={() => {
                navigate("/shop/checkout");
                setOpenCartSheet(false);
              }}
              className="group mt-5 h-12 w-full rounded-full bg-espresso text-sm font-semibold tracking-wide text-ivory transition-all duration-300 hover:bg-mocha hover:shadow-lg hover:shadow-mocha/25"
            >
              Rasmiylashtirish
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="grid h-24 w-24 animate-float place-items-center rounded-full bg-blush">
            <ShoppingBag className="h-10 w-10 text-rose-deep" strokeWidth={1.4} />
          </div>
          <h3 className="mt-6 font-display text-2xl font-semibold text-espresso">Savatingiz bo'sh</h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-taupe">
            Sizga yoqqan mahsulotlarni qo'shing — ular shu yerda kutib turadi.
          </p>
          <Button
            onClick={() => {
              navigate("/shop/listing");
              setOpenCartSheet(false);
            }}
            variant="outline"
            className="mt-6 h-11 rounded-full border-espresso/20 bg-transparent px-6 hover:bg-espresso hover:text-ivory"
          >
            Xaridni boshlash
          </Button>
        </div>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;
