import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import instance from "@/utils/axios.js";

const initialState = {
  settings: {
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
    referralBonus: 0,
    lowStockThreshold: 5,
    flashSale: null,
  },
  settingsLoaded: false,
  referral: null,
  referralLoading: false,
};

export const fetchPublicSettings = createAsyncThunk("growth/settings", async (_, thunkAPI) => {
  try {
    const {data} = await instance.get("/shop/growth/settings");
    return data.data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data || e.message);
  }
});

export const fetchReferral = createAsyncThunk("growth/referral", async (_, thunkAPI) => {
  try {
    const {data} = await instance.get("/shop/growth/referral");
    return data.data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data || e.message);
  }
});

// Chekout narx tarkibi — natija komponent ichida ishlatiladi (store'da saqlanmaydi)
export const fetchQuote = createAsyncThunk("growth/quote", async ({couponCode, useBonus}, thunkAPI) => {
  try {
    const {data} = await instance.post("/shop/order/quote", {couponCode, useBonus});
    return data.data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data || e.message);
  }
});

const growthSlice = createSlice({
  name: "growth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSettings.fulfilled, (state, {payload}) => {
        state.settings = {...state.settings, ...payload};
        state.settingsLoaded = true;
      })
      .addCase(fetchReferral.pending, (state) => {
        state.referralLoading = true;
      })
      .addCase(fetchReferral.fulfilled, (state, {payload}) => {
        state.referralLoading = false;
        state.referral = payload;
      })
      .addCase(fetchReferral.rejected, (state) => {
        state.referralLoading = false;
      });
  },
});

export default growthSlice.reducer;
