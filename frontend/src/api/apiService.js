import Cookies from "js-cookie";
import api from "../Interceptors/Interceptor";
import toast from "react-hot-toast";

export async function callApi(
  url,
  method,
  data = null,
  headers = {},
  responseType = "json"
) {
  const token = Cookies.get("CableToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    url,
    headers,
    responseType,
    ...(data && { data }),
  };

  try {
    const response = await api.request(config);
    if (
      responseType === "arraybuffer" &&
      response.data instanceof ArrayBuffer
    ) {
      return response.data;
    }

    if (responseType === "json" && typeof response.data === "object") {
      const responseData = response.data;

      if (method === "DELETE") {
        toast.error(responseData.message || "An error occurred");
      } else if (method !== "GET") {
        // successnotify(responseData.message || "Login Successfull");
      }

      return responseData;
    }

    throw new Error("Unexpected response type");
  } catch (error) {
    const axiosError = error;
    const apiError = {
      status: axiosError.response?.status ?? 0,
      message: axiosError.response?.data?.message ?? "An error occurred",
      errors: axiosError.response?.data?.errors,
    };
    throw apiError;
  }
}
