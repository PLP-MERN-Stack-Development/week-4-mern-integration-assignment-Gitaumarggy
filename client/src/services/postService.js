import api from "./api";

export const fetchPosts = (page = 1, limit = 10, search = '', category = '') => {
  let url = `/api/posts?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (category) url += `&category=${category}`;
  return api.get(url);
};
export const fetchPost = (id) => api.get(`/api/posts/${id}`);
export const createPost = (postData) => api.post("/api/posts", postData);
export const updatePost = (id, postData) => api.put(`/api/posts/${id}`, postData);
export const deletePost = (id) => api.delete(`/api/posts/${id}`);
export const fetchComments = (postId) => api.get(`/api/posts/${postId}/comments`);
export const addComment = (postId, text) => api.post(`/api/posts/${postId}/comments`, { text });