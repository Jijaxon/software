import axios from "axios";
import {toast} from "react-toastify";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
  timeout: 20000,
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = error?.response?.data?.error;
    if (message) toast.error(message, {toastId: message});
    return Promise.reject(error);
  }
);

export default instance;