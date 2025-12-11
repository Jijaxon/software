import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import instance from "@/utils/axios.js";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",

  async (formData, thunkAPI) => {
    try {
      const {data} = await instance.post(
        "/auth/register",
        formData,
        {
          withCredentials: true,
        }
      );
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }

  }
);

export const verifyUser = createAsyncThunk(
  "/auth/verifyUser",

  async (formData, thunkAPI) => {
    try {
      const {data} = await instance.post(
        "/auth/verify",
        formData,
        {
          withCredentials: true,
        }
      );
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }

  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",

  async (formData, thunkAPI) => {
    try {
      const {data} = await instance.post(
        "/auth/login",
        formData,
        {
          withCredentials: true,
        }
      );
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  }
);

export const updateUser = createAsyncThunk(
  "/auth/updateUser",

  async (formData, thunkAPI) => {
    try {
      const {data} = await instance.put(
        "/auth/update",
        formData,
        {
          withCredentials: true,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logoutUser",

  async (thunkAPI) => {
    try {
      const {data} = await instance.post(
        "/auth/logoutUser",
        {},
        {
          withCredentials: true,
        }
      );

      window.location.reload()
      return data;

    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",

  async (thunkAPI) => {
    try {
      const {data} = await instance.get(
        "/auth/check-auth",
        {
          withCredentials: true,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(verifyUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const {setUser} = authSlice.actions;
export default authSlice.reducer;