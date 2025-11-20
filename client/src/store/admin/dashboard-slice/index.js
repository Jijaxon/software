import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import instance from "@/utils/axios.js";

const initialState = {
  isLoading: false,
  dashboard: [],
};

export const getDashboard = createAsyncThunk(
  "dashboard/getDashboard",
  async (_, thunkAPI) => {
    try {
      const {data} = await instance.get('/dashboard/')
      return data
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  }
)

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  extraReducers: builder => {
    builder
      .addCase(getDashboard.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getDashboard.fulfilled, (state, {payload}) => {
        state.dashboard = payload
        state.isLoading = false
      })
      .addCase(getDashboard.rejected, (state) => {
        state.isLoading = false
      })
  }
})

export default dashboardSlice.reducer