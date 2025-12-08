import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserWishlistItemsContent from "@/components/shopping-view/wishlist-items-content.jsx";

function UserWishlistWrapper({ wishlistItems, setOpenWishlistSheet }) {
  const navigate = useNavigate();

  return (
    <SheetContent className="sm:max-w-md" key={wishlistItems?._id}>
      <SheetHeader>
        <SheetTitle>Your Wishlist</SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4">
        {wishlistItems && wishlistItems.length > 0
          ? wishlistItems.map((item) => <UserWishlistItemsContent key={item?._id} wishlistItem={item} />)
          : null}
      </div>
    </SheetContent>
  );
}

export default UserWishlistWrapper;