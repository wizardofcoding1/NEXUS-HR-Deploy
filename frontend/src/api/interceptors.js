import api from "./axios";

api.interceptors.request.use((config) => {
    console.log("API BASE URL ->", api.defaults.baseURL);
    return config;
});

export default api;