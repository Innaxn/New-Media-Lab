import axios from "axios";

const BASE_URL = "http://localhost:8080"; // TODO add vars

export const axiosWithoutInterceptors = () =>
  axios.create({ baseURL: BASE_URL });

export default axiosWithoutInterceptors;
