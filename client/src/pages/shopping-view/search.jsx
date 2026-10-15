import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import {toast} from "react-toastify";
import {addToCart, fetchCartItems} from "@/store/shop/cart-slice";
import {fetchProductDetails} from "@/store/shop/products-slice";
import {getSearchResults, resetSearchResults,} from "@/store/shop/search-slice";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useSearchParams} from "react-router-dom";
import {Search, SearchX, X} from "lucide-react";
import Reveal from "@/components/common/reveal.jsx";

const suggestions = ["Krem", "Serum", "Tush", "Pomada", "Atir", "Shampun"];

function SearchProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const {searchResults, isLoading} = useSelector((state) => state.shopSearch);
  const {productDetails} = useSelector((state) => state.shopProducts);

  const {user} = useSelector((state) => state.auth);

  const {cartItems} = useSelector((state) => state.shopCart);
  const hasKeyword = keyword.trim() !== "";

  useEffect(() => {
    if (hasKeyword) {
      const timer = setTimeout(() => {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(getSearchResults(keyword));
      }, 500);
      return () => clearTimeout(timer);
    }

    setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
    dispatch(resetSearchResults());
    return undefined;
  }, [keyword, dispatch]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast.warning(
            `Bu mahsulotdan faqat ${getQuantity} ta qo'shish mumkin`,
          );

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

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <div className="bg-ivory">
      <section className="relative overflow-hidden border-b border-sand bg-cream">
        <div className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-petal/40 blur-3xl"/>
        <div className="pointer-events-none absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-gold/20 blur-3xl"/>
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center md:py-20">
          <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Qidiruv</p>
          <h1 className="mt-3 animate-fade-up font-display text-5xl font-medium text-espresso [animation-delay:100ms] md:text-6xl">
            Nimani izlayapsiz?
          </h1>
          <div className="group relative mt-8 animate-fade-up [animation-delay:200ms]">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-taupe transition-colors group-focus-within:text-rose-deep"/>
            <input
              value={keyword}
              name="keyword"
              autoFocus
              onChange={(event) => setKeyword(event.target.value)}
              className="h-16 w-full rounded-full border border-sand bg-white pl-14 pr-14 text-base text-espresso shadow-lg shadow-mocha/5 outline-none transition-all duration-300 placeholder:text-taupe/80 focus:border-petal focus:shadow-xl focus:shadow-rose/10"
              placeholder="Mahsulot yoki brend nomi..."
            />
            {hasKeyword ? (
              <button
                onClick={() => setKeyword("")}
                aria-label="Tozalash"
                className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 animate-pop place-items-center rounded-full text-taupe transition-colors hover:bg-cream hover:text-espresso"
              >
                <X className="h-4 w-4"/>
              </button>
            ) : null}
          </div>
          <div className="mt-5 flex animate-fade-up flex-wrap justify-center gap-2 [animation-delay:300ms]">
            {suggestions.map((item) => (
              <button
                key={item}
                onClick={() => setKeyword(item)}
                className="rounded-full border border-sand bg-white/70 px-4 py-1.5 text-xs font-medium text-mocha transition-all duration-300 hover:-translate-y-0.5 hover:border-petal hover:bg-blush"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-10">
        {hasKeyword && (isLoading || searchParams.get("keyword") !== keyword) ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({length: 4}).map((_, index) => (
              <div key={index}>
                <div className="shimmer aspect-[4/5] rounded-[22px]"/>
                <div className="shimmer mt-4 h-4 w-3/4 rounded-full"/>
              </div>
            ))}
          </div>
        ) : searchResults.length ? (
          <>
            <p className="mb-8 text-sm text-taupe">
              <span className="font-semibold text-espresso">{searchResults.length}</span> ta natija topildi
            </p>
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {searchResults.map((item, index) => (
                <Reveal key={item?._id} delay={(index % 4) * 90}>
                  <ShoppingProductTile
                    handleAddtoCart={handleAddtoCart}
                    product={item}
                    handleGetProductDetails={handleGetProductDetails}
                  />
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="grid h-20 w-20 animate-float place-items-center rounded-full bg-blush">
              {hasKeyword ? (
                <SearchX className="h-8 w-8 text-rose-deep" strokeWidth={1.4}/>
              ) : (
                <Search className="h-8 w-8 text-rose-deep" strokeWidth={1.4}/>
              )}
            </div>
            <h3 className="mt-6 font-display text-3xl font-medium text-espresso">
              {hasKeyword ? "Hech narsa topilmadi" : "Qidirishni boshlang"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-taupe">
              {hasKeyword
                ? "Boshqa so'z bilan urinib ko'ring yoki yuqoridagi takliflardan birini tanlang."
                : "Mahsulot nomi yoki brendini yozing — natijalar shu yerda paydo bo'ladi."}
            </p>
          </div>
        )}
      </div>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default SearchProducts;
