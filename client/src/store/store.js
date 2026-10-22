import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminOrderSlice from "./admin/order-slice";

import shopProductsSlice from "./shop/products-slice";
import shopCartSlice from "./shop/cart-slice";
import shopWishlistSlice from "./shop/wishlist-slice"
import shopReviewSlice from "./shop/review-slice";
import shopOrderSlice from "./shop/order-slice";
import shopAddressSlice from "./shop/address-slice";

import shopSearchSlice from "./shop/search-slice";
import commonFeatureSlice from "./common-slice";
import dashboardSlice from "@/store/admin/dashboard-slice/index.js";
import taxonomySlice from "@/store/admin/taxonomy-slice/index.js";
import growthSlice from "@/store/shop/growth-slice/index.js";
import marketingSlice from "@/store/admin/marketing-slice/index.js";

const store = configureStore({
  reducer: {
    auth: authReducer,

    dashboard: dashboardSlice,
    taxonomy: taxonomySlice,
    marketing: marketingSlice,
    adminProducts: adminProductsSlice,
    adminOrder: adminOrderSlice,

    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopWishlist: shopWishlistSlice,
    shopReview: shopReviewSlice,
    shopOrder: shopOrderSlice,
    shopAddress: shopAddressSlice,

    shopSearch: shopSearchSlice,
    commonFeature: commonFeatureSlice,
    growth: growthSlice,

  },
});

export default store;