import Cookies from "js-cookie";
import axios from "axios";
import config from "../Config/Config";

axios.defaults.timeout = 25000;
let setIsLoading = () => {};
let setTimeOutModal = () => {};

export const setLoaderCallback = (callback) => {
  setIsLoading = callback;
};

export const setTimeoutModalCallback = (callback) => {
  setTimeOutModal = callback;
};

const api = axios.create({
  baseURL: config.BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("PRT_token");
    setIsLoading(true);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    setIsLoading(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    setIsLoading(false);
    return response;
  },
  (error) => {
    setIsLoading(false);
    if (error.code === "ECONNABORTED") {
      setTimeOutModal(true);
    }
    return Promise.reject(error);
  }
);

export default api;
