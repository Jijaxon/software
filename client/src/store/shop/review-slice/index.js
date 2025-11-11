import instance from "@/utils/axios.js";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

const initialState = {
  reviews: [],
  isLoading: false,
  error: null,
};

// Async thunk yaratish
export const addReview = createAsyncThunk(
  "review/addReview",
  async (formData, thunkAPI) => {
    try {
      const {data} = await instance.post("/shop/review/add", formData);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

export const getReviews = createAsyncThunk(
  "review/getReviews",
  async (id, thunkAPI) => {
    try {
      const {data} = await instance.get(`/shop/review/${id}`);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);


const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(getReviews.rejected, (state) => {
        state.isLoading = false;
        state.reviews = [];
      });
  },
});

export default reviewSlice.reducer;