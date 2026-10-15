import { useNavigate } from "react-router-dom";
import { HeartIcon } from "lucide-react";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserWishlistItemsContent from "@/components/shopping-view/wishlist-items-content.jsx";

function UserWishlistWrapper({ wishlistItems, setOpenWishlistSheet }) {
  const navigate = useNavigate();

  return (
    <SheetContent className="flex w-full flex-col gap-0 border-sand bg-ivory p-0 sm:max-w-md">
      <SheetHeader className="border-b border-sand px-6 py-5 text-left">
        <SheetTitle className="flex items-baseline gap-2 font-display text-3xl font-semibold text-espresso">
          Istaklar
          {wishlistItems?.length ? (
            <span className="font-body text-sm font-normal text-taupe">({wishlistItems.length})</span>
          ) : null}
        </SheetTitle>
      </SheetHeader>

      {wishlistItems && wishlistItems.length > 0 ? (
        <div className="nafis-scroll flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {wishlistItems.map((item, index) => (
            <div key={item?.productId || item?._id} className="animate-fade-up" style={{animationDelay: `${index * 60}ms`}}>
              <UserWishlistItemsContent wishlistItem={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="grid h-24 w-24 animate-float place-items-center rounded-full bg-blush">
            <HeartIcon className="h-10 w-10 text-rose-deep" strokeWidth={1.4} />
          </div>
          <h3 className="mt-6 font-display text-2xl font-semibold text-espresso">Hali hech narsa yo'q</h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-taupe">
            Yoqqan mahsulotlardagi yurakchani bosing — ular shu yerda saqlanadi.
          </p>
          <Button
            onClick={() => {
              navigate("/shop/listing");
              setOpenWishlistSheet(false);
            }}
            variant="outline"
            className="mt-6 h-11 rounded-full border-espresso/20 bg-transparent px-6 hover:bg-espresso hover:text-ivory"
          >
            Mahsulotlarni ko'rish
          </Button>
        </div>
      )}
    </SheetContent>
  );
}

export default UserWishlistWrapper;
