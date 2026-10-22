import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details.jsx";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {sortOptions} from "@/config";
import {useTaxonomyLabels} from "@/lib/use-taxonomy-labels.js";
import {toast} from "react-toastify";
import {addToCart, fetchCartItems} from "@/store/shop/cart-slice";
import {fetchAllFilteredProducts, fetchProductDetails,} from "@/store/shop/products-slice";
import {ArrowUpDownIcon, PackageSearch} from "lucide-react";
import Reveal from "@/components/common/reveal.jsx";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useSearchParams} from "react-router-dom";
import {useT} from "@/i18n/index.jsx";
import {useDocumentTitle} from "@/lib/use-document-title.js";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");

      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const {productList, productDetails, isLoading} = useSelector(
    (state) => state.shopProducts
  );
  const {cartItems} = useSelector((state) => state.shopCart);
  const {user} = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const {categoryLabel} = useTaxonomyLabels();
  const {t} = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);


  const categorySearchParam = searchParams.get("category");

  function handleSort(value) {
    setSort(value);
  }

  function handleFilter(getSectionId, getCurrentOption) {
    let cpyFilters = {...filters};
    const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);

    if (indexOfCurrentSection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption],
      };
    } else {
      const indexOfCurrentOption =
        cpyFilters[getSectionId].indexOf(getCurrentOption);

      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems?.items

    if (getCartItems?.length) {
      const indexOfCurrentItem = getCartItems?.findIndex(
        (item) => item?.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem]?.quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast.warning(t("toast.onlyCanAdd", {count: getQuantity}));

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
        toast.success(t("toast.addedToCart"));
      }
    });
  }

  useEffect(() => {
    setSort("popular");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [categorySearchParam]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters]);

  useEffect(() => {
    if (filters !== null && sort !== null)
      dispatch(
        fetchAllFilteredProducts({filterParams: filters, sortParams: sort})
      );
  }, [dispatch, sort, filters]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  const activeSortLabel = sort ? t(`sort.${sort}`) : null;
  const activeCategory = filters?.category?.length === 1 ? categoryLabel(filters.category[0]) : null;
  useDocumentTitle(activeCategory || t("menu.all-products"));

  return (
    <div className="bg-ivory">
      <section className="relative overflow-hidden border-b border-sand bg-cream">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-petal/40 blur-3xl"/>
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-gold/20 blur-3xl"/>
        <div className="relative mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-16">
          <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">
            {t("listing.eyebrow")}
          </p>
          <h1 className="mt-3 animate-fade-up font-display text-5xl font-medium text-espresso [animation-delay:100ms] md:text-6xl">
            {activeCategory || t("menu.all-products")}
          </h1>
          <p className="mt-3 max-w-lg animate-fade-up text-sm leading-6 text-mocha/80 [animation-delay:200ms]">
            {t("listing.subtitle")}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 md:grid-cols-[250px_1fr] md:px-10">
        <ProductFilter filters={filters} handleFilter={handleFilter}/>
        <div className="w-full">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-taupe">
              <span className="font-semibold text-espresso">{productList?.length || 0}</span> {t("listing.count")}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 gap-2 rounded-full border-sand bg-white px-4 text-xs font-medium text-mocha hover:border-petal hover:bg-blush/50"
                >
                  <ArrowUpDownIcon className="h-4 w-4"/>
                  <span>{activeSortLabel || t("listing.sort")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px] rounded-2xl border-sand p-2 shadow-xl shadow-mocha/10">
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions?.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                      className="cursor-pointer rounded-xl py-2.5 focus:bg-blush/60"
                    >
                      {t(`sort.${sortItem.id}`)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isLoading && !productList?.length ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({length: 6}).map((_, index) => (
                <div key={index}>
                  <div className="shimmer aspect-[4/5] rounded-[22px]"/>
                  <div className="shimmer mt-4 h-3 w-1/3 rounded-full"/>
                  <div className="shimmer mt-3 h-4 w-3/4 rounded-full"/>
                </div>
              ))}
            </div>
          ) : productList && productList.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {productList.map((productItem, index) => (
                <Reveal key={productItem?._id} delay={(index % 3) * 90}>
                  <ShoppingProductTile
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-sand px-6 py-20 text-center">
              <div className="grid h-20 w-20 animate-float place-items-center rounded-full bg-blush">
                <PackageSearch className="h-8 w-8 text-rose-deep" strokeWidth={1.4}/>
              </div>
              <h3 className="mt-6 font-display text-3xl font-medium text-espresso">{t("listing.empty")}</h3>
              <p className="mt-2 max-w-sm text-sm text-taupe">{t("listing.emptyText")}</p>
            </div>
          )}
        </div>
      </div>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingListing;
