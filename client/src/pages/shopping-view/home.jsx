import {Button} from "@/components/ui/button";
import {
  Brush,
  ChevronLeftIcon,
  ChevronRightIcon,
  Droplets,
  Flower2,
  FlaskConical,
  Sparkles
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchAllFilteredProducts, fetchProductDetails,} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import {useNavigate} from "react-router-dom";
import {addToCart, fetchCartItems} from "@/store/shop/cart-slice";
import {toast} from "react-toastify";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import {getFeatureImages} from "@/store/common-slice";
import instance from "@/utils/axios.js";

const categoriesWithIcon = [
  {id: "skincare", label: "Yuz parvarishi", note: "Kundalik parvarish", icon: Droplets},
  {id: "makeup", label: "Makiyaj", note: "O'zingizga xos ranglar", icon: Brush},
  {id: "fragrance", label: "Atirlar", note: "Yoqimli taassurot", icon: Flower2},
  {id: "haircare", label: "Soch parvarishi", note: "Sochlar uchun mehr", icon: FlaskConical}
];

const brands = [
  {id: "cerave", label: "CeraVe"},
  {id: "the-ordinary", label: "The Ordinary"},
  {id: "loreal", label: "L'Oréal Paris"},
  {id: "maybelline", label: "Maybelline"},
  {id: "dior", label: "Dior"},
  {id: "fenty-beauty", label: "Fenty Beauty"},
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const {productList, productDetails} = useSelector(
    (state) => state.shopProducts
  );
  const {featureImageList} = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const {user} = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function navigateToListing() {
    sessionStorage.removeItem("filters");
    navigate("/shop/listing");
  }

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
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

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    if (!featureImageList?.length) return undefined;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#fbf8f5] text-[#29241f]">
      <section className="relative isolate min-h-[560px] overflow-hidden bg-[#503d35] md:min-h-[620px]">
        {featureImageList?.length ? featureImageList.map((slide, index) => (
          <img
            src={instance.defaults.baseURL + slide?.image}
            key={slide?._id || index}
            alt=""
            className={`${index === currentSlide ? "opacity-100" : "opacity-0"} absolute inset-0 h-full w-full object-cover transition-opacity duration-1000`}
          />
        )) : (
          <img
            src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=2200&q=85"
            alt="Teri parvarishi uchun mahsulotlar"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#211c18]/80 via-[#211c18]/45 to-transparent"/>
        <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-6 py-16 md:min-h-[620px] md:px-10">
          <div className="max-w-xl text-white">
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d8c5]">
              <Sparkles className="h-4 w-4"/> Har kungi go'zalligingiz uchun
            </p>
            <h1 className="max-w-lg font-serif text-5xl leading-[1.05] md:text-7xl">
              O'zingizga mehr bilan qarang.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/85 md:text-lg">
              Teringiz, kayfiyatingiz va uslubingizga mos go'zallik mahsulotlarini bir joydan toping.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button onClick={navigateToListing} className="h-12 rounded-none bg-[#f4d8c5] px-7 text-sm font-semibold text-[#29241f] hover:bg-white">
                Xaridni boshlash
              </Button>
              <span className="text-sm text-white/80">Sevimli brendlaringiz, ishonchli tanlov</span>
            </div>
          </div>
        </div>
        {featureImageList?.length > 1 && (
          <div className="absolute bottom-6 right-6 flex gap-2 md:bottom-9 md:right-10">
            <Button variant="outline" size="icon" aria-label="Oldingi banner" onClick={() => setCurrentSlide((currentSlide - 1 + featureImageList.length) % featureImageList.length)} className="border-white/60 bg-black/20 text-white hover:bg-white hover:text-black">
              <ChevronLeftIcon className="h-4 w-4"/>
            </Button>
            <Button variant="outline" size="icon" aria-label="Keyingi banner" onClick={() => setCurrentSlide((currentSlide + 1) % featureImageList.length)} className="border-white/60 bg-black/20 text-white hover:bg-white hover:text-black">
              <ChevronRightIcon className="h-4 w-4"/>
            </Button>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#98745f]">O'zingizga mosini tanlang</p>
            <h2 className="font-serif text-3xl md:text-4xl">Go'zallik bo'limlari</h2>
          </div>
          <button onClick={navigateToListing} className="hidden text-sm font-semibold underline underline-offset-4 md:block">Barchasini ko'rish</button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {categoriesWithIcon.map((categoryItem) => (
            <Card
              key={categoryItem.id}
              onClick={() => handleNavigateToListingPage(categoryItem, "category")}
              className="group cursor-pointer rounded-sm border-[#e8dfd7] bg-white transition-colors hover:border-[#a67d65]"
            >
              <CardContent className="flex min-h-40 flex-col justify-between p-5 md:min-h-48 md:p-7">
                <categoryItem.icon className="h-7 w-7 text-[#9b725a] transition-transform group-hover:-translate-y-1" strokeWidth={1.5}/>
                <span>
                  <span className="block font-semibold">{categoryItem.label}</span>
                  <span className="mt-1 block text-xs text-[#82776f]">{categoryItem.note}</span>
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e9e1da] bg-[#f3eee9] py-12 md:py-14">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#98745f]">Tanilgan nomlar</p>
              <h2 className="font-serif text-3xl">Sevimli brendlar</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px border border-[#e2d8cf] bg-[#e2d8cf] sm:grid-cols-3 md:grid-cols-6">
            {brands.map((brand) => (
              <button key={brand.id} onClick={() => handleNavigateToListingPage(brand, "brand")} className="min-h-16 bg-[#fbf8f5] px-2 font-serif text-sm font-semibold transition-colors hover:bg-white md:min-h-20 md:text-base">
                {brand.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#98745f]">Siz uchun saraladik</p>
            <h2 className="font-serif text-3xl md:text-4xl">Ko'p tanlanayotganlar</h2>
          </div>
          <button onClick={navigateToListing} className="text-sm font-semibold underline underline-offset-4">Barcha mahsulotlar</button>
        </div>
        {productList?.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {productList.map((productItem) => (
              <ShoppingProductTile
                key={productItem?._id}
                handleGetProductDetails={handleGetProductDetails}
                product={productItem}
                handleAddtoCart={handleAddtoCart}
              />
            ))}
          </div>
        ) : (
          <p className="border-y border-[#e8dfd7] py-12 text-center text-sm text-[#82776f]">Hozircha mahsulotlar mavjud emas.</p>
        )}
      </section>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;