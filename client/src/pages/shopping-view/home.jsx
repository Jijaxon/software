import {Button} from "@/components/ui/button";
import {
  ArrowRight,
  Brush,
  ChevronLeftIcon,
  ChevronRightIcon,
  Droplets,
  Flower2,
  Gem,
  Leaf,
  ShieldCheck,
  Sparkles,
  Wind
} from "lucide-react";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchAllFilteredProducts, fetchProductDetails,} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import {useNavigate} from "react-router-dom";
import {addToCart, fetchCartItems} from "@/store/shop/cart-slice";
import {toast} from "react-toastify";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import {getFeatureImages} from "@/store/common-slice";
import {fetchTaxonomy} from "@/store/admin/taxonomy-slice/index.js";
import instance from "@/utils/axios.js";
import Reveal from "@/components/common/reveal.jsx";

const categoriesWithIcon = [
  {
    id: "skincare",
    label: "Yuz parvarishi",
    note: "Kundalik parvarish",
    icon: Droplets,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "makeup",
    label: "Makiyaj",
    note: "O'zingizga xos ranglar",
    icon: Brush,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fragrance",
    label: "Atirlar",
    note: "Yoqimli taassurot",
    icon: Flower2,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "haircare",
    label: "Soch parvarishi",
    note: "Sochlar uchun mehr",
    icon: Wind,
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80",
  }
];

const brands = [
  {id: "cerave", label: "CeraVe"},
  {id: "the-ordinary", label: "The Ordinary"},
  {id: "loreal", label: "L'Oréal Paris"},
  {id: "maybelline", label: "Maybelline"},
  {id: "dior", label: "Dior"},
  {id: "fenty-beauty", label: "Fenty Beauty"},
];

const promises = [
  {icon: ShieldCheck, title: "Original mahsulotlar", text: "Faqat ishonchli brendlar va manbalardan."},
  {icon: Leaf, title: "Ehtiyotkor tanlov", text: "Har bir mahsulot teringizga mehr bilan saralangan."},
  {icon: Gem, title: "Nafis tajriba", text: "Qulay xarid va chiroyli qadoqlash."},
];

const fallbackHero = "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=2200&q=85";

function SectionHeading({eyebrow, title, action}) {
  return (
    <Reveal className="mb-10 flex items-end justify-between gap-4">
      <div>
        <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">
          <span className="h-px w-8 bg-rose"/> {eyebrow}
        </p>
        <h2 className="font-display text-4xl font-medium leading-tight text-espresso md:text-5xl">{title}</h2>
      </div>
      {action}
    </Reveal>
  );
}

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const {productList, productDetails, isLoading} = useSelector(
    (state) => state.shopProducts
  );
  const {featureImageList} = useSelector((state) => state.commonFeature);
  const {categories, brands: brandList} = useSelector((state) => state.taxonomy);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const {user} = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const heroSlides = featureImageList?.length
    ? featureImageList.map((slide) => instance.defaults.baseURL + slide?.image)
    : [fallbackHero];

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
    if (heroSlides.length < 2) return undefined;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

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
    dispatch(fetchTaxonomy({type: "category", activeOnly: true}));
    dispatch(fetchTaxonomy({type: "brand", activeOnly: true}));
  }, [dispatch]);

  const featuredProducts = productList?.slice(0, 8) || [];

  // Kategoriyalarni bazadan quramiz; seed qilinganlar uchun maxsus ikonka/rasm saqlanadi,
  // yangi bo'limlar admin yuklagan rasm va standart ikonka bilan ko'rsatiladi
  const displayCategories = (categories?.length
    ? categories.map((cat) => {
        const meta = categoriesWithIcon.find((c) => c.id === cat.slug);
        return {
          id: cat.slug,
          label: cat.name,
          note: cat.description || meta?.note || "Go'zallik uchun",
          icon: meta?.icon || Sparkles,
          image: cat.image ? instance.defaults.baseURL + cat.image : meta?.image || fallbackHero,
        };
      })
    : categoriesWithIcon);

  const displayBrands = (brandList?.length
    ? brandList.map((b) => ({id: b.slug, label: b.name}))
    : brands);

  return (
    <div className="min-h-screen bg-ivory text-espresso">
      {/* HERO */}
      <section className="px-3 pt-3 md:px-6 md:pt-4">
        <div className="relative isolate min-h-[580px] overflow-hidden rounded-[32px] bg-mocha md:min-h-[660px]">
          {heroSlides.map((src, index) => (
            <div
              key={src + index}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
              <img
                src={src}
                alt=""
                className={`h-full w-full object-cover ${index === currentSlide ? "animate-ken-burns" : ""}`}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/45 to-transparent"/>
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 via-transparent to-transparent"/>

          {/* suzib yuruvchi bezaklar */}
          <div className="pointer-events-none absolute right-[12%] top-[14%] hidden h-40 w-40 animate-float rounded-full bg-petal/25 blur-2xl md:block"/>
          <div className="pointer-events-none absolute bottom-[18%] right-[30%] hidden h-24 w-24 animate-float rounded-full bg-gold/30 blur-2xl [animation-delay:2s] md:block"/>

          <div className="relative mx-auto flex min-h-[580px] max-w-7xl items-center px-7 py-16 md:min-h-[660px] md:px-14">
            <div className="max-w-xl text-white">
              <p className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-blush backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5"/> Har kungi go'zalligingiz uchun
              </p>
              <h1 className="animate-fade-up font-display text-6xl font-medium leading-[0.95] [animation-delay:120ms] md:text-8xl">
                O'zingizga <em className="font-normal text-petal">mehr</em> bilan qarang.
              </h1>
              <p className="mt-7 max-w-md animate-fade-up text-base leading-7 text-white/80 [animation-delay:240ms] md:text-lg">
                Teringiz, kayfiyatingiz va uslubingizga mos go'zallik mahsulotlarini bir joydan toping.
              </p>
              <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-4 [animation-delay:360ms]">
                <Button
                  onClick={navigateToListing}
                  className="group h-14 rounded-full bg-ivory px-8 text-sm font-semibold text-espresso shadow-xl shadow-espresso/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  Xaridni boshlash
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1"/>
                </Button>
                <button
                  onClick={() => navigate("/shop/about")}
                  className="nav-link text-sm font-medium text-white/85 hover:text-white"
                >
                  Biz haqimizda
                </button>
              </div>
            </div>
          </div>

          {heroSlides.length > 1 && (
            <div className="absolute bottom-6 left-7 right-7 flex items-center justify-between md:bottom-10 md:left-14 md:right-14">
              <div className="flex gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`${index + 1}-banner`}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? "w-10 bg-white" : "w-4 bg-white/40 hover:bg-white/70"}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Oldingi banner"
                  onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-espresso"
                >
                  <ChevronLeftIcon className="h-4 w-4"/>
                </button>
                <button
                  aria-label="Keyingi banner"
                  onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-espresso"
                >
                  <ChevronRightIcon className="h-4 w-4"/>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KATEGORIYALAR */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <SectionHeading
          eyebrow="O'zingizga mosini tanlang"
          title="Go'zallik bo'limlari"
          action={
            <button onClick={navigateToListing} className="nav-link hidden text-sm font-semibold text-mocha md:block">
              Barchasini ko'rish
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {displayCategories.map((categoryItem, index) => (
            <Reveal key={categoryItem.id} delay={index * 90}>
              <button
                onClick={() => handleNavigateToListingPage(categoryItem, "category")}
                className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-cream text-left"
              >
                <img
                  src={categoryItem.image}
                  alt={categoryItem.label}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/10 to-transparent transition-opacity duration-500 group-hover:from-espresso/90"/>
                <div className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-rose-deep backdrop-blur transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                  <categoryItem.icon className="h-5 w-5" strokeWidth={1.5}/>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
                  <span className="block font-display text-xl font-medium leading-tight sm:text-2xl md:text-3xl">{categoryItem.label}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-white/75">
                    {categoryItem.note}
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"/>
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BRENDLAR — yuguruvchi lenta */}
      <section className="border-y border-sand bg-cream py-14 md:py-16">
        <Reveal className="mx-auto mb-8 max-w-7xl px-5 text-center md:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Tanilgan nomlar</p>
          <h2 className="mt-3 font-display text-4xl font-medium text-espresso">Sevimli brendlar</h2>
        </Reveal>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
            {[...displayBrands, ...displayBrands].map((brand, index) => (
              <button
                key={brand.id + index}
                onClick={() => handleNavigateToListingPage(brand, "brand")}
                className="min-w-[200px] rounded-full border border-sand bg-ivory px-10 py-5 font-display text-2xl font-medium text-mocha transition-all duration-300 hover:-translate-y-1 hover:border-petal hover:bg-white hover:text-rose-deep hover:shadow-lg hover:shadow-mocha/10"
              >
                {brand.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAHSULOTLAR */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <SectionHeading
          eyebrow="Siz uchun saraladik"
          title="Ko'p tanlanayotganlar"
          action={
            <button onClick={navigateToListing} className="nav-link text-sm font-semibold text-mocha">
              Barcha mahsulotlar
            </button>
          }
        />
        {isLoading && !featuredProducts.length ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({length: 4}).map((_, index) => (
              <div key={index}>
                <div className="shimmer aspect-[4/5] rounded-[22px]"/>
                <div className="shimmer mt-4 h-3 w-1/3 rounded-full"/>
                <div className="shimmer mt-3 h-4 w-3/4 rounded-full"/>
                <div className="shimmer mt-3 h-5 w-1/4 rounded-full"/>
              </div>
            ))}
          </div>
        ) : featuredProducts.length ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((productItem, index) => (
              <Reveal key={productItem?._id} delay={(index % 4) * 90}>
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-sand py-14 text-center text-sm text-taupe">
            Hozircha mahsulotlar mavjud emas.
          </p>
        )}
      </section>

      {/* VA'DALAR */}
      <section className="px-3 pb-20 md:px-6 md:pb-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-blush px-6 py-14 md:px-14 md:py-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 animate-spin-slow rounded-full border border-dashed border-rose/30"/>
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-petal/50 blur-3xl"/>
          <Reveal className="relative mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Nega aynan NAFIS</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-espresso md:text-5xl">
              Go'zallik — <em className="text-rose-deep">ishonch</em> bilan
            </h2>
          </Reveal>
          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
            {promises.map((item, index) => (
              <Reveal key={item.title} delay={index * 120}>
                <div className="group h-full rounded-3xl bg-white/70 p-7 backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:bg-white hover:shadow-xl hover:shadow-rose/10">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-blush text-rose-deep transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110">
                    <item.icon className="h-5 w-5" strokeWidth={1.6}/>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-espresso">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-mocha/80">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
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
