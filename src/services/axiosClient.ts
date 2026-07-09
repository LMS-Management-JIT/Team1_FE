import axios from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // ví dụ: http://localhost:8080/api
    //   baseURL: "http://localhost:8080/api",
    headers: {"Content-Type": "application/json"},
});