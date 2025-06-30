import { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const CategoryManager = ({ onCategoryCreated }) => {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/api/categories`, form);
      // Optimistic UI update - clear form immediately
      setForm({ name: "", description: "" });
      // Notify parent component to refresh categories
      if (onCategoryCreated) {
        onCategoryCreated();
      }
    } catch (err) {
      console.error('Category creation error:', err);
      setError(err.response?.data?.error || "Error creating category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "5px", marginBottom: "20px" }}>
      <h3>Create a Category</h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <label htmlFor="catName">Category Name:</label>
          <input
            id="catName"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter category name"
            required
            minLength={2}
            maxLength={50}
            disabled={loading}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label htmlFor="catDescription">Description:</label>
          <textarea
            id="catDescription"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter category description"
            required
            minLength={10}
            maxLength={500}
            rows={3}
            disabled={loading}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        {error && (
          <div style={{ 
            backgroundColor: "#f8d7da", 
            color: "#721c24", 
            padding: "10px", 
            borderRadius: "4px", 
            border: "1px solid #f5c6cb" 
          }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: "10px", 
            backgroundColor: loading ? "#6c757d" : "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating..." : "Create Category"}
        </button>
      </form>
    </div>
  );
};

export default CategoryManager; 