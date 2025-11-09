import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import AdminProductsSlice from './admin/products-slice'
import AdminOrdersSlice from './admin/order-slice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: AdminProductsSlice,
    adminOrder: AdminOrdersSlice,
  },
});

export default store;
