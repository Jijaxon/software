// import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
// import instance from "@/utils/axios.js";
//
// const initialState = {
//   approvalURL: null,
//   isLoading: false,
//   orderId: null,
//   orderList: [],
//   orderDetails: null,
// };
//
// export const createNewOrder = createAsyncThunk(
//   "/order/createNewOrder",
//   async (orderData, thunkAPI) => {
//     try {
//       const {data} = await instance.post("/shop/order/create", orderData);
//       return data;
//     } catch (e) {
//       return thunkAPI.rejectWithValue(e?.response?.data || e.message);
//     }
//   }
// );
//
//
// export const capturePayment = createAsyncThunk(
//   "/order/capturePayment",
//   async ({paymentId, payerId, orderId}, thunkAPI) => {
//     try {
//       const {data} = await instance.post(
//         "/shop/order/capture",
//         {
//           paymentId,
//           payerId,
//           orderId
//         });
//       return data;
//     } catch (e) {
//       return thunkAPI.rejectWithValue(e?.response?.data || e.message);
//     }
//   }
// );
//
// export const getAllOrdersByUserId = createAsyncThunk(
//   "/order/getAllOrdersByUserId",
//   async (userId, thunkAPI) => {
//     try {
//       const { data } = await instance.get(`/order/list/${userId}`);
//       return data;
//     } catch (e) {
//       return thunkAPI.rejectWithValue(e?.response?.data || e.message);
//     }
//   }
// );
//
// export const getOrderDetails = createAsyncThunk(
//   "/order/getOrderDetails",
//   async (id,thunkAPI) => {
//     try{
//       const {data} = await instance.get(
//         `/shop/order/details/${id}`
//       );
//       return data;
//     }catch (e) {
//       return thunkAPI.rejectWithValue(e?.response?.data || e.message);
//     }
//   }
// );
//
// const shoppingOrderSlice = createSlice({
//   name: "shoppingOrderSlice",
//   initialState,
//   reducers: {
//     resetOrderDetails: (state) => {
//       state.orderDetails = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(createNewOrder.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(createNewOrder.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.approvalURL = action.payload.approvalURL;
//         state.orderId = action.payload.orderId;
//         sessionStorage.setItem(
//           "currentOrderId",
//           JSON.stringify(action.payload.orderId)
//         );
//       })
//       .addCase(createNewOrder.rejected, (state) => {
//         state.isLoading = false;
//         state.approvalURL = null;
//         state.orderId = null;
//       })
//       .addCase(getAllOrdersByUserId.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.orderList = action.payload.data;
//       })
//       .addCase(getAllOrdersByUserId.rejected, (state) => {
//         state.isLoading = false;
//         state.orderList = [];
//       })
//       .addCase(getOrderDetails.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(getOrderDetails.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.orderDetails = action.payload.data;
//       })
//       .addCase(getOrderDetails.rejected, (state) => {
//         state.isLoading = false;
//         state.orderDetails = null;
//       });
//   },
// });
//
// export const {resetOrderDetails} = shoppingOrderSlice.actions;
//
// export default shoppingOrderSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import instance from "@/utils/axios.js";

const initialState = {
  checkoutURL: null, // Stripe uchun approvalURL o‘rniga
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
};

// 🧾 1. Yangi Stripe order yaratish
export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData, thunkAPI) => {
    try {
      const { data } = await instance.post("/shop/order/create", orderData);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

// 💳 2. Stripe to‘lovini tasdiqlash (success sahifasidan)
export const confirmPayment = createAsyncThunk(
  "/order/confirmPayment",
  async ({ sessionId, orderId }, thunkAPI) => {
    try {
      const { data } = await instance.post("/shop/order/confirm-payment", {
        sessionId,
        orderId,
      });
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

// 📦 3. Foydalanuvchi buyurtmalari
export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId, thunkAPI) => {
    try {
      const { data } = await instance.get(`/shop/order/list/${userId}`);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

// 🔍 4. Buyurtma tafsilotlari
export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id, thunkAPI) => {
    try {
      const { data } = await instance.get(`/shop/order/details/${id}`);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🧾 createNewOrder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkoutURL = action.payload.url; // Stripe’da “url” qaytadi
        state.orderId = action.payload.orderId;

        // orderId’ni sessiyaga saqlaymiz
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId)
        );
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.checkoutURL = null;
        state.orderId = null;
      })

      // 💳 confirmPayment
      .addCase(confirmPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(confirmPayment.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(confirmPayment.rejected, (state) => {
        state.isLoading = false;
      })

      // 📦 getAllOrdersByUserId
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })

      // 🔍 getOrderDetails
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
