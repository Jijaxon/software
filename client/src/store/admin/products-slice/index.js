import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import instance from "@/utils/axios.js";

const initialState = {
  isLoading: false,
  productList: [],
};

export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (_, thunkAPI) => {
    try {
      const {data} = await instance.get('/admin/products/')
      return data
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  }
)

export const addNewProduct = createAsyncThunk(
  "products/addNewProduct",
  async ({formData, imageFiles}, thunkAPI) => {
    try {
      const data = new FormData();

      // ✅ Ko‘p faylni FormData ga qo‘shamiz
      // if (imageFiles && imageFiles.length > 0) {
      //   imageFiles.forEach((file) => {
      //     data.append("product_image", file);
      //   });
      // }

      if (imageFiles) {
        data.append("product_image", imageFiles);
      }

      // Boshqa form fieldlarni qo‘shamiz
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const response = await instance.post(
        "/admin/products/add",
        data,
        {
          headers: {"Content-Type": "multipart/form-data"},
        }
      );
      await thunkAPI.dispatch(fetchAllProducts())
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Server error");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({id, formData, imageFiles}, thunkAPI) => {
    try {
      const data = new FormData();

      if (imageFiles) {
        data.append("product_image", imageFiles);
      }

      // Boshqa form fieldlarni qo‘shamiz
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const response = await instance.put(
        `/admin/products/update/${id}`,
        data,
        {
          headers: {"Content-Type": "multipart/form-data"},
        })
      await thunkAPI.dispatch(fetchAllProducts())
      return response.data.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  }
)

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async ({id}, thunkAPI) => {
    try {
      await instance.delete(`/admin/products/delete/${id}`).then(() => {
        thunkAPI.dispatch(fetchAllProducts())
      })
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  }
)

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: builder => {
    // addNewProduct
    builder
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewProduct.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addNewProduct.rejected, (state) => {
        state.isLoading = false;
      })

    // updateProduct
    builder
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateProduct.rejected, (state) => {
        state.isLoading = false;
      })

    // fetchAllProducts
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, {payload}) => {
        state.productList = payload
        state.isLoading = false;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.isLoading = false;
      })
  },
})

export default AdminProductsSlice.reducer;