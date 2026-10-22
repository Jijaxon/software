import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import instance from "@/utils/axios.js";

const initialState = {
  settings: null,
  coupons: [],
  broadcasts: [],
  audience: 0,
  isLoading: false,
};

const thunk = (type, request) =>
  createAsyncThunk(type, async (arg, thunkAPI) => {
    try {
      const {data} = await request(arg, thunkAPI);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || {message: e.message});
    }
  });

// ---- Sozlamalar ----
export const fetchAdminSettings = thunk("marketing/fetchSettings", () => instance.get("/admin/marketing/settings"));
export const saveAdminSettings = thunk("marketing/saveSettings", (patch) => instance.put("/admin/marketing/settings", patch));

// ---- Promokodlar ----
export const fetchCoupons = thunk("marketing/fetchCoupons", () => instance.get("/admin/marketing/coupons"));
export const createCoupon = thunk("marketing/createCoupon", async (body, {dispatch}) => {
  const res = await instance.post("/admin/marketing/coupons", body);
  dispatch(fetchCoupons());
  return res;
});
export const updateCoupon = thunk("marketing/updateCoupon", async ({id, ...body}, {dispatch}) => {
  const res = await instance.put(`/admin/marketing/coupons/${id}`, body);
  dispatch(fetchCoupons());
  return res;
});
export const deleteCoupon = thunk("marketing/deleteCoupon", async (id, {dispatch}) => {
  const res = await instance.delete(`/admin/marketing/coupons/${id}`);
  dispatch(fetchCoupons());
  return res;
});

// ---- Telegram broadcast ----
export const fetchBroadcasts = thunk("marketing/fetchBroadcasts", () => instance.get("/admin/marketing/broadcasts"));
export const sendBroadcast = thunk("marketing/sendBroadcast", async ({message, buttonText, buttonUrl, image}, {dispatch}) => {
  const body = new FormData();
  body.append("message", message);
  if (buttonText) body.append("buttonText", buttonText);
  if (buttonUrl) body.append("buttonUrl", buttonUrl);
  if (image) body.append("broadcast_image", image);
  const res = await instance.post("/admin/marketing/broadcasts", body, {
    headers: {"Content-Type": "multipart/form-data"},
  });
  dispatch(fetchBroadcasts());
  return res;
});

const marketingSlice = createSlice({
  name: "marketing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSettings.fulfilled, (state, {payload}) => {
        state.settings = payload.data;
      })
      .addCase(saveAdminSettings.fulfilled, (state, {payload}) => {
        state.settings = payload.data;
      })
      .addCase(fetchCoupons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCoupons.fulfilled, (state, {payload}) => {
        state.isLoading = false;
        state.coupons = payload.data || [];
      })
      .addCase(fetchCoupons.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchBroadcasts.fulfilled, (state, {payload}) => {
        state.audience = payload.data?.audience || 0;
        state.broadcasts = payload.data?.broadcasts || [];
      });
  },
});

export default marketingSlice.reducer;
