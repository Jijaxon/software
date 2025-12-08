import instance from "@/utils/axios.js";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

const initialState = {
  wishlistItems: [],
  isLoading: false,
};

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({userId, productId, quantity}, thunkAPI) => {
    try {
      const {data} = await instance.post("/shop/wishlist/add", {
        userId,
        productId
      });
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

export const fetchWishlistItems = createAsyncThunk(
  "cart/fetchWishlistItems",
  async (userId, thunkAPI) => {
    if (userId) {
      try {
        const {data} = await instance.get(`/shop/wishlist/get/${userId}`);
        return data;
      } catch (e) {
        return thunkAPI.rejectWithValue(e?.response?.data || e.message);
      }
    }
  }
);


export const deleteWishlistItem = createAsyncThunk(
  "wishlist/deleteWishlistItem",
  async ({userId, productId}, thunkAPI) => {
    try {
      const {data} = await instance.delete(`/shop/wishlist/${userId}/${productId}`);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

export const updateWishlistQuantity = createAsyncThunk(
  "wishlist/updateWishlistQuantity",
  async ({userId, productId, quantity}, thunkAPI) => {
    try {
      const {data} = await instance.put("/shop/wishlist/update-wishlist", {
        userId,
        productId,
        quantity,
      });
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

export const clearWishlistItems = createAsyncThunk(
  "wishlist/clearWishlistItems",
  async ({userId}, thunkAPI) => {
    try {
      const {data} = await instance.delete(`/shop/wishlist/clear/${userId}`);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
)

const shoppingWishlistSlice = createSlice({
  name: "shoppingWishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
      })
      .addCase(addToWishlist.rejected, (state) => {
        state.isLoading = false;
        state.wishlistItems = [];
      })
      .addCase(fetchWishlistItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
      })
      .addCase(fetchWishlistItems.rejected, (state) => {
        state.isLoading = false;
        state.wishlistItems = [];
      })
      .addCase(updateWishlistQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateWishlistQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
      })
      .addCase(updateWishlistQuantity.rejected, (state) => {
        state.isLoading = false;
        state.wishlistItems = [];
      })
      .addCase(deleteWishlistItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteWishlistItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
      })
      .addCase(deleteWishlistItem.rejected, (state) => {
        state.isLoading = false;
        state.wishlistItems = [];
      })
      .addCase(clearWishlistItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearWishlistItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload.data;
      })
      .addCase(clearWishlistItems.rejected, (state) => {
        state.isLoading = false;
        state.wishlistItems = [];
      });
  },
});

export default shoppingWishlistSlice.reducer
