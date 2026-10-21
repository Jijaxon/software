import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import instance from "@/utils/axios.js";

const initialState = {
  isLoading: false,
  categories: [],
  brands: [],
};

// type: "category" | "brand"
const endpoint = (type) => (type === "brand" ? "/brands" : "/categories");
const imageField = (type) => (type === "brand" ? "brand_image" : "category_image");

export const fetchTaxonomy = createAsyncThunk(
  "taxonomy/fetch",
  async ({type, activeOnly = false} = {}, thunkAPI) => {
    try {
      const {data} = await instance.get(endpoint(type), {
        params: activeOnly ? {active: true} : {},
      });
      return {type, data: data.data};
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

function buildFormData({formData, image, type}) {
  const body = new FormData();
  Object.keys(formData || {}).forEach((key) => {
    if (formData[key] !== undefined && formData[key] !== null) {
      body.append(key, formData[key]);
    }
  });
  if (image) body.append(imageField(type), image);
  return body;
}

export const addTaxonomy = createAsyncThunk(
  "taxonomy/add",
  async ({type, formData, image}, thunkAPI) => {
    try {
      const {data} = await instance.post(`${endpoint(type)}/add`, buildFormData({formData, image, type}), {
        headers: {"Content-Type": "multipart/form-data"},
      });
      thunkAPI.dispatch(fetchTaxonomy({type}));
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

export const updateTaxonomy = createAsyncThunk(
  "taxonomy/update",
  async ({type, id, formData, image}, thunkAPI) => {
    try {
      const {data} = await instance.put(`${endpoint(type)}/update/${id}`, buildFormData({formData, image, type}), {
        headers: {"Content-Type": "multipart/form-data"},
      });
      thunkAPI.dispatch(fetchTaxonomy({type}));
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

export const deleteTaxonomy = createAsyncThunk(
  "taxonomy/delete",
  async ({type, id}, thunkAPI) => {
    try {
      const {data} = await instance.delete(`${endpoint(type)}/delete/${id}`);
      thunkAPI.dispatch(fetchTaxonomy({type}));
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message);
    }
  }
);

const taxonomySlice = createSlice({
  name: "taxonomy",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaxonomy.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTaxonomy.fulfilled, (state, {payload}) => {
        state.isLoading = false;
        if (payload.type === "brand") state.brands = payload.data || [];
        else state.categories = payload.data || [];
      })
      .addCase(fetchTaxonomy.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default taxonomySlice.reducer;
