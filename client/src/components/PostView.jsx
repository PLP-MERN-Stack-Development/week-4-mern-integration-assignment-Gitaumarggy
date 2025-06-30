import { useParams, Link, useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { useEffect, useState } from "react";
import { fetchComments, addComment, deletePost } from "../services/postService";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000";

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: post, loading, error } = useApi(`/api/posts/${id}`, "get", null, [id]);
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentError, setCommentError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch comments
  useEffect(() => {
    setCommentsLoading(true);
    fetchComments(id)
      .then(res => setComments(res.data))
      .catch(err => setCommentError(err.response?.data || err.message))
      .finally(() => setCommentsLoading(false));
  }, [id]);

  // Handle add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    setCommentError(null);
    try {
      const res = await addComment(id, commentText);
      setComments(prev => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      setCommentError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete post
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await deletePost(id);
      navigate("/posts");
    } catch (err) {
      alert("Failed to delete post: " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "20px" }}>Loading post...</div>;
  if (error) return <div style={{ color: "red", padding: "20px" }}>Error: {error.error || error.toString()}</div>;
  if (!post) return <div style={{ padding: "20px" }}>Post not found.</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/" style={{ color: "#007bff", textDecoration: "none" }}>
          ← Back to Posts
        </Link>
      </div>
      
      <article style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "5px" }}>
        <h1 style={{ marginBottom: "10px" }}>{post.title}</h1>
        {post.featuredImage && post.featuredImage !== "no-image.jpg" && (
          <div style={{ margin: "20px 0" }}>
            <img
              src={post.featuredImage.startsWith("/uploads/") ? `${API_BASE_URL}${post.featuredImage}` : post.featuredImage}
              alt="Featured"
              style={{ maxWidth: "100%", maxHeight: "350px", borderRadius: "8px", display: "block", margin: "0 auto" }}
            />
          </div>
        )}
        <div style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          <p>Category: {post.category?.name || "Uncategorized"}</p>
          <p>Created: {new Date(post.createdAt).toLocaleDateString()}</p>
          {post.updatedAt && post.updatedAt !== post.createdAt && (
            <p>Updated: {new Date(post.updatedAt).toLocaleDateString()}</p>
          )}
        </div>
        
        <div style={{ lineHeight: "1.6" }}>
          {post.content}
        </div>
      </article>
      {/* Comments Section */}
      <section style={{ marginTop: 40, borderTop: "1px solid #eee", paddingTop: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Comments</h2>
        {commentsLoading ? (
          <div>Loading comments...</div>
        ) : commentError ? (
          <div style={{ color: "red" }}>Error: {commentError}</div>
        ) : comments.length === 0 ? (
          <div>No comments yet. Be the first to comment!</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 24 }}>
            {comments.map((c, idx) => (
              <li key={c._id || idx} style={{ marginBottom: 18, padding: 12, background: "#fafafa", borderRadius: 6, border: "1px solid #eee" }}>
                <div style={{ fontWeight: 500 }}>{c.user?.username || "Anonymous"}</div>
                <div style={{ margin: "6px 0" }}>{c.text}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</div>
              </li>
            ))}
          </ul>
        )}
        {user ? (
          <form onSubmit={handleAddComment} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
              placeholder="Add a comment..."
              style={{ padding: 10, borderRadius: 4, border: "1px solid #ccc", resize: "vertical" }}
              disabled={submitting}
            />
            <button type="submit" disabled={submitting || !commentText.trim()} style={{ alignSelf: "flex-end", background: "#007bff", color: "white", border: "none", padding: "8px 18px", borderRadius: 4, cursor: "pointer" }}>
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <div style={{ color: "#888", marginTop: 12 }}>Login to add a comment.</div>
        )}
      </section>
      <div style={{ marginTop: "20px" }}>
        <Link 
          to={`/edit/${post._id}`} 
          style={{ 
            backgroundColor: "#007bff", 
            color: "white", 
            padding: "10px 20px", 
            textDecoration: "none", 
            borderRadius: "4px",
            marginRight: "10px"
          }}
        >
          Edit Post
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            marginRight: "10px",
            cursor: deleting ? "not-allowed" : "pointer"
          }}
        >
          {deleting ? "Deleting..." : "Delete Post"}
        </button>
        <Link 
          to="/" 
          style={{ 
            backgroundColor: "#6c757d", 
            color: "white", 
            padding: "10px 20px", 
            textDecoration: "none", 
            borderRadius: "4px"
          }}
        >
          Back to List
        </Link>
      </div>
    </div>
  );
};

export default PostView;