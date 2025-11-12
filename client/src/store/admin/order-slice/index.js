import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import instance from "@/utils/axios.js";

const initialState = {
  orderList: [],
  orderDetails: null,
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async (_, thunkAPI) => {
    try {
      const response = await instance.get(
        `/admin/orders/get`
      );

      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)    }
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id, thunkAPI) => {
    try {
      const response = await instance.get(
        `/admin/orders/details/${id}`
      );

      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({id, orderStatus}, thunkAPI) => {
    try {
      const response = await instance.put(
        `/admin/orders/update/${id}`,
        {
          orderStatus,
        });
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      console.log("resetOrderDetails");

      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const {resetOrderDetails} = adminOrderSlice.actions;

export default adminOrderSlice.reducer;