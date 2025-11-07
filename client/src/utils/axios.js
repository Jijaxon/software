import axios from "axios";
import {toast} from "react-toastify";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    toast.error(error?.response?.data?.error)
    return Promise.reject(error);
  }
);

export default instance;