import api from "./api";

export const fetchCategories = () => api.get("/categories");
export const createCategory = (categoryData) => api.post("/categories", categoryData);