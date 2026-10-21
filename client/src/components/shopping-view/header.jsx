import {HeartIcon, LogOut, Menu, Package, Search, ShoppingBag, Sparkles, UserCog, UserRound} from "lucide-react";
import {Link, useLocation, useNavigate, useSearchParams,} from "react-router-dom";
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "../ui/sheet";
import {Button} from "../ui/button";
import {useDispatch, useSelector} from "react-redux";
import {shoppingViewHeaderMenuItems} from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {Avatar, AvatarFallback} from "../ui/avatar";
import {displayName} from "@/lib/utils";
import {logoutUser} from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import {useEffect, useState} from "react";
import {fetchCartItems} from "@/store/shop/cart-slice";
import {fetchWishlistItems} from "@/store/shop/wishlist-slice/index.js";
import {fetchTaxonomy} from "@/store/admin/taxonomy-slice/index.js";
import UserWishlistWrapper from "@/components/shopping-view/wishlist-wrapper.jsx";

const announcements = [
  "Original mahsulotlar",
  "Sevimli brendlar bir joyda",
  "Yuz va soch parvarishi",
  "Makiyaj va atirlar",
  "O'zingizga mehr bilan qarang",
];

function AnnouncementBar() {
  const items = [...announcements, ...announcements];

  return (
    <div className="overflow-hidden bg-espresso py-2 text-[11px] font-medium uppercase tracking-[0.25em] text-ivory/80">
      <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-10 whitespace-nowrap">
            {item}
            <Sparkles className="h-3 w-3 text-petal"/>
          </span>
        ))}
      </div>
    </div>
  );
}

function MenuItems({onNavigate, variant = "desktop"}) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");
  const isListing = location.pathname.includes("listing");
  const {categories} = useSelector((state) => state.taxonomy);

  useEffect(() => {
    dispatch(fetchTaxonomy({type: "category", activeOnly: true}));
  }, [dispatch]);

  // Statik bo'limlar o'rtasiga bazadan kelgan kategoriyalarni joylaymiz
  const staticHead = shoppingViewHeaderMenuItems.filter((m) => ["home", "all-products"].includes(m.id));
  const staticTail = shoppingViewHeaderMenuItems.filter((m) => ["search", "about_us"].includes(m.id));
  const categoryItems = categories?.length
    ? categories.map((c) => ({id: c.slug, label: c.name, path: "/shop/listing"}))
    : shoppingViewHeaderMenuItems.filter(
        (m) => !["home", "all-products", "search", "about_us"].includes(m.id)
      );
  const menuItems = [...staticHead, ...categoryItems, ...staticTail];

  function isActive(menuItem) {
    if (menuItem.id === "all-products") return isListing && !activeCategory;
    if (menuItem.path === "/shop/listing") return isListing && activeCategory === menuItem.id;
    return location.pathname === menuItem.path;
  }

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "all-products" &&
      getCurrentMenuItem.id !== "about_us" &&
      getCurrentMenuItem.id !== "search"
        ? {
          category: [getCurrentMenuItem.id],
        }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
        new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
      )
      : navigate(getCurrentMenuItem.path);

    onNavigate?.();
  }

  if (variant === "mobile") {
    return (
      <nav className="flex flex-col">
        {menuItems.map((menuItem, index) => (
          <button
            onClick={() => handleNavigate(menuItem)}
            key={menuItem.id}
            style={{animationDelay: `${index * 50}ms`}}
            className={`animate-fade-up border-b border-sand py-4 text-left font-display text-2xl transition-colors hover:text-rose-deep ${isActive(menuItem) ? "text-rose-deep" : "text-espresso"}`}
          >
            {menuItem.label}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-6 xl:gap-8">
      {menuItems
        .filter((menuItem) => !["home", "search", "about_us"].includes(menuItem.id))
        .map((menuItem) => (
          <button
            onClick={() => handleNavigate(menuItem)}
            key={menuItem.id}
            data-active={isActive(menuItem)}
            className={`nav-link whitespace-nowrap text-[13px] font-medium tracking-wide transition-colors hover:text-espresso ${isActive(menuItem) ? "text-espresso" : "text-mocha/80"}`}
          >
            {menuItem.label}
          </button>
        ))}
    </nav>
  );
}

function CountBadge({count}) {
  if (!count) return null;

  return (
    <span
      key={count}
      className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] animate-pop place-items-center rounded-full bg-rose-deep px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-ivory"
    >
      {count}
    </span>
  );
}

const iconButtonClass =
  "relative h-10 w-10 rounded-full text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-blush/70";

function HeaderRightContent() {
  const {user} = useSelector((state) => state.auth);
  const {cartItems} = useSelector((state) => state.shopCart);
  const {wishlistItems} = useSelector(state => state.shopWishlist)
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [openWishlistSheet, setOpenWishlistSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchCartItems(user?.id));
    dispatch(fetchWishlistItems(user?.id))
  }, [dispatch, user?.id]);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        onClick={() => navigate("/shop/search")}
        variant="ghost"
        size="icon"
        title="Qidiruv"
        aria-label="Qidiruv"
        className={`${iconButtonClass} hidden sm:inline-flex`}
      >
        <Search className="!h-[18px] !w-[18px]" strokeWidth={1.7}/>
      </Button>
      <Sheet open={openWishlistSheet} onOpenChange={setOpenWishlistSheet}>
        <Button
          onClick={() => setOpenWishlistSheet(true)}
          variant="ghost"
          size="icon"
          title="Istaklar"
          className={iconButtonClass}
        >
          <HeartIcon className="!h-[18px] !w-[18px]" strokeWidth={1.7}/>
          <CountBadge count={wishlistItems?.items?.length}/>
          <span className="sr-only">Istaklar ro'yxati</span>
        </Button>
        <UserWishlistWrapper
          setOpenWishlistSheet={setOpenWishlistSheet}
          wishlistItems={
            wishlistItems && wishlistItems.items && wishlistItems.items.length > 0
              ? wishlistItems.items
              : []
          }
        />
      </Sheet>
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="ghost"
          size="icon"
          title="Savat"
          className={iconButtonClass}
        >
          <ShoppingBag className="!h-[18px] !w-[18px]" strokeWidth={1.7}/>
          <CountBadge count={cartItems?.items?.length}/>
          <span className="sr-only">Savat</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />
      </Sheet>

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 rounded-full outline-none ring-offset-2 ring-offset-ivory transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-rose">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-petal to-rose text-sm font-semibold text-white">
                  {displayName(user)?.replace(/^\+/, "")?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={10} className="w-60 rounded-2xl border-sand p-2 shadow-xl shadow-mocha/10">
            <DropdownMenuLabel className="px-3 py-2">
              <span className="block text-xs font-normal text-taupe">Xush kelibsiz</span>
              <span className="block truncate font-display text-lg font-semibold text-espresso">{displayName(user)}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sand"/>
            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-blush/60" onClick={() => navigate("/shop/account")}>
              <UserCog className="mr-2 h-4 w-4 text-rose-deep"/>
              Profilim
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-blush/60" onClick={() => navigate("/shop/account")}>
              <Package className="mr-2 h-4 w-4 text-rose-deep"/>
              Buyurtmalarim
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-sand"/>
            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4"/>
              Chiqish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          size="sm"
          className="ml-1 h-10 rounded-full bg-espresso px-5 text-xs font-semibold tracking-wide text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha hover:shadow-lg hover:shadow-mocha/20"
          onClick={() => navigate("/auth/login")}
        >
          <UserRound className="h-4 w-4"/>
          <span className="hidden sm:inline">Kirish</span>
        </Button>
      )}
    </div>
  );
}

function ShoppingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const {user} = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, {passive: true});
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <AnnouncementBar/>
      <header
        className={`sticky top-0 z-40 w-full border-b transition-all duration-500 ${
          isScrolled
            ? "border-sand/80 bg-ivory/80 shadow-[0_10px_30px_-20px_rgba(91,70,63,0.35)] backdrop-blur-xl"
            : "border-transparent bg-ivory"
        }`}
      >
        <div className={`mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 transition-all duration-500 md:px-8 ${isScrolled ? "h-16" : "h-20"}`}>
          <div className="flex items-center gap-2">
            <Sheet open={openMenu} onOpenChange={setOpenMenu}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenMenu(true)}
                className="h-10 w-10 rounded-full hover:bg-blush/70 lg:hidden"
              >
                <Menu className="!h-5 !w-5" strokeWidth={1.7}/>
                <span className="sr-only">Menyuni ochish</span>
              </Button>
              <SheetContent side="left" className="w-full max-w-sm border-sand bg-ivory p-8">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="flex items-center gap-2 font-display text-3xl font-semibold tracking-[0.2em]">
                    <Sparkles className="h-5 w-5 text-rose"/> NAFIS
                  </SheetTitle>
                </SheetHeader>
                <MenuItems variant="mobile" onNavigate={() => setOpenMenu(false)}/>
                {user ? (
                  <button
                    onClick={() => {
                      navigate("/shop/account");
                      setOpenMenu(false);
                    }}
                    className="mt-8 flex items-center gap-2 text-sm font-medium text-mocha"
                  >
                    <UserCog className="h-4 w-4"/> Profilim
                  </button>
                ) : null}
              </SheetContent>
            </Sheet>
            <Link to="/shop/home" className="group flex shrink-0 items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose transition-transform duration-700 group-hover:rotate-180"/>
              <span className="font-display text-[26px] font-semibold leading-none tracking-[0.22em] text-espresso">NAFIS</span>
            </Link>
          </div>

          <div className="hidden flex-1 justify-center lg:flex">
            <MenuItems/>
          </div>

          <HeaderRightContent/>
        </div>
      </header>
    </>
  );
}

export default ShoppingHeader;
