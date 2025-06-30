import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useApi from "../hooks/useApi";
import CategoryManager from "./CategoryManager";

const API_BASE_URL = "http://localhost:5000";

const PostForm = ({ editMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", category: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitErrors, setSubmitErrors] = useState([]);
  const [removeImage, setRemoveImage] = useState(false);
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useApi("/api/categories", "get", null, [refreshKey]);
  const { data: post, loading: postLoading } = useApi(editMode && id ? `/api/posts/${id}` : null, "get", null, [id]);

  useEffect(() => {
    if (editMode && post) {
      setForm({
        title: post.title,
        content: post.content,
        category: post.category?._id || ""
      });
      setImagePreview(post.featuredImage ? `${API_BASE_URL}${post.featuredImage}` : null);
      setRemoveImage(false);
    }
  }, [editMode, post]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (submitError) setSubmitError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitErrors([]);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("category", form.category);
      if (imageFile) {
        formData.append("featuredImage", imageFile);
      }
      if (editMode && removeImage) {
        formData.append("removeImage", "true");
      }
      const token = localStorage.getItem('token');
      const headers = { "Content-Type": "multipart/form-data" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (editMode) {
        await axios.put(`${API_BASE_URL}/api/posts/${id}`, formData, { headers });
      } else {
        await axios.post(`${API_BASE_URL}/api/posts`, formData, { headers });
      }
      navigate("/");
    } catch (err) {
      const details = err.response?.data?.details;
      if (Array.isArray(details)) {
        setSubmitErrors(details.map(d => d.msg || d.message || JSON.stringify(d)));
      } else if (typeof details === 'object') {
        setSubmitErrors(Object.values(details).map(d => d.message || JSON.stringify(d)));
      } else {
        setSubmitError(err.response?.data?.error || "Error saving post");
      }
      setIsSubmitting(false);
    }
  };

  const handleCategoryCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (postLoading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading post...</div>;
  }

  const noCategories = !categoriesLoading && (!categories || categories.length === 0);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }} encType="multipart/form-data">
        <h2>{editMode ? "Edit" : "Create"} Post</h2>
        {submitError && (
          <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "4px", border: "1px solid #f5c6cb", marginBottom: "10px" }}>{submitError}</div>
        )}
        {submitErrors.length > 0 && (
          <ul style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "4px", border: "1px solid #f5c6cb", marginBottom: "10px" }}>
            {submitErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter post title"
            required
            minLength={3}
            maxLength={100}
            disabled={isSubmitting}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Enter post content"
            required
            minLength={10}
            rows={6}
            disabled={isSubmitting}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            disabled={isSubmitting || categoriesLoading || noCategories}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="">
              {categoriesLoading ? "Loading categories..." : "Select Category"}
            </option>
            {categories && categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))
            ) : null}
          </select>
          {categoriesError && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              Error loading categories: {categoriesError}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="featuredImage">Featured Image:</label>
          <input
            type="file"
            id="featuredImage"
            name="featuredImage"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting}
            style={{ marginTop: "5px" }}
          />
          {imagePreview && (
            <div style={{ marginTop: "10px" }}>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }} />
              {editMode && (
                <div style={{ marginTop: "8px" }}>
                  <label style={{ color: "#dc3545", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={removeImage}
                      onChange={e => setRemoveImage(e.target.checked)}
                      disabled={isSubmitting}
                      style={{ marginRight: "6px" }}
                    />
                    Remove Image
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || categoriesLoading || noCategories}
          style={{
            padding: "10px",
            backgroundColor: isSubmitting || noCategories ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isSubmitting || noCategories ? "not-allowed" : "pointer"
          }}
        >
          {isSubmitting ? "Saving..." : (editMode ? "Update" : "Create") + " Post"}
        </button>
      </form>
      {/* Show CategoryManager if no categories exist */}
      {noCategories && (
        <CategoryManager onCategoryCreated={handleCategoryCreated} />
      )}
    </div>
  );
};

export default PostForm;