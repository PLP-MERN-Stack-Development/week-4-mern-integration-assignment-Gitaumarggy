import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../services/postService";

const API_BASE_URL = "http://localhost:5000";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPosts(page, 5)
      .then(res => {
        setPosts(res.data.posts);
        setTotalPages(res.data.totalPages);
      })
      .catch(err => {
        setError(err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>Loading posts...</div>;
  if (error) return <div style={{ color: "red", padding: "20px" }}>Error: {error.error || error.toString()}</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>All Posts</h2>
      {posts && posts.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {posts.map((post) => (
            <div key={post._id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "5px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
              {post.featuredImage && post.featuredImage !== "no-image.jpg" && (
                <img
                  src={post.featuredImage.startsWith("/uploads/") ? `${API_BASE_URL}${post.featuredImage}` : post.featuredImage}
                  alt="Featured"
                  style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "6px" }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3>
                  <Link to={`/posts/${post._id}`} style={{ color: "#007bff", textDecoration: "none" }}>
                    {post.title}
                  </Link>
                </h3>
                <p style={{ color: "#666", margin: "5px 0" }}>
                  Category: {post.category?.name || "Uncategorized"}
                </p>
                <p style={{ color: "#888", fontSize: "14px" }}>
                  Created: {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No posts found. Create your first post!</p>
      )}
      {/* Pagination Controls */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 24, gap: 16 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default PostList;