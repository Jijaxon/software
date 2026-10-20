import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import instance from "@/utils/axios.js";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

// Barcha auth so'rovlari bir xil tuzilishda: javob payload sifatida qaytadi
function createAuthThunk(type, request) {
  return createAsyncThunk(type, async (formData, thunkAPI) => {
    try {
      const {data} = await request(formData);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  });
}

export const registerUser = createAuthThunk(
  "/auth/register",
  (formData) => instance.post("/auth/register", formData)
);

export const verifyUser = createAuthThunk(
  "/auth/verifyUser",
  (formData) => instance.post("/auth/verify", formData)
);

export const resendVerificationCode = createAuthThunk(
  "/auth/resendVerificationCode",
  (formData) => instance.post("/auth/resend-verification", formData)
);

export const getVerificationStatus = createAuthThunk(
  "/auth/getVerificationStatus",
  (token) => instance.get(`/auth/verification-status/${token}`)
);

export const getTelegramInfo = createAuthThunk(
  "/auth/getTelegramInfo",
  () => instance.get("/auth/telegram-info")
);

export const loginUser = createAuthThunk(
  "/auth/login",
  (formData) => instance.post("/auth/login", formData)
);

export const requestTelegramLogin = createAuthThunk(
  "/auth/requestTelegramLogin",
  (formData) => instance.post("/auth/telegram-login/request", formData)
);

export const verifyTelegramLogin = createAuthThunk(
  "/auth/verifyTelegramLogin",
  (formData) => instance.post("/auth/telegram-login/verify", formData)
);

export const requestPasswordReset = createAuthThunk(
  "/auth/requestPasswordReset",
  (formData) => instance.post("/auth/forgot-password/request", formData)
);

export const verifyPasswordResetCode = createAuthThunk(
  "/auth/verifyPasswordResetCode",
  (formData) => instance.post("/auth/forgot-password/verify", formData)
);

export const resetPassword = createAuthThunk(
  "/auth/resetPassword",
  (formData) => instance.post("/auth/forgot-password/reset", formData)
);

export const updateUser = createAuthThunk(
  "/auth/updateUser",
  (formData) => instance.put("/auth/update", formData, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  })
);

export const logoutUser = createAsyncThunk(
  "/auth/logoutUser",

  async (_, thunkAPI) => {
    try {
      const {data} = await instance.post("/auth/logoutUser", {});

      window.location.reload()
      return data;

    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data || e.message)
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",

  async (_, thunkAPI) => {
    try {
      const {data} = await instance.get(
        "/auth/check-auth",
        {
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

// Muvaffaqiyatli kirishdan so'ng foydalanuvchini saqlash
function applyLogin(state, action) {
  if (action.payload?.success && action.payload?.user) {
    state.user = action.payload.user;
    state.isAuthenticated = true;
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Eslatma: isLoading faqat ilova ochilgandagi checkAuth uchun —
    // aks holda har bir so'rovda butun sahifa yuklanish ekraniga almashadi
    builder
      .addCase(verifyUser.fulfilled, applyLogin)
      .addCase(loginUser.fulfilled, applyLogin)
      .addCase(verifyTelegramLogin.fulfilled, applyLogin)
      .addCase(resetPassword.fulfilled, applyLogin)
      .addCase(updateUser.fulfilled, (state, action) => {
        if (action.payload?.success && action.payload?.user) {
          state.user = {...state.user, ...action.payload.user};
        }
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const {setUser} = authSlice.actions;
export default authSlice.reducer;
