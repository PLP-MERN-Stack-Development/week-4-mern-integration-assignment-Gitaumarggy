import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchComments, addComment } from '../services/postService';
import { useAuth } from '../context/AuthContext';

export default function Post() {
  const { id } = useParams();
  const { data: post, loading, error } = useApi(`posts/${id}`);
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    fetchComments(id)
      .then(res => setComments(res.data))
      .catch(() => setComments([]));
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    setCommentError(null);
    try {
      await addComment(id, commentText);
      setCommentText("");
      // Refresh comments
      const res = await fetchComments(id);
      setComments(res.data);
    } catch (err) {
      setCommentError(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {post.title}
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        Category: {post.category?.name}
      </Typography>
      <Typography paragraph sx={{ whiteSpace: 'pre-line', my: 3 }}>
        {post.content}
      </Typography>
      <Button 
        component={Link} 
        to={`/posts/${id}/edit`} 
        variant="outlined"
      >
        Edit Post
      </Button>
      {/* Comments Section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>Comments</Typography>
        {comments.length === 0 && <Typography>No comments yet.</Typography>}
        {comments.map((c, idx) => (
          <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
            <Typography variant="subtitle2">{c.user?.username || 'User'} <span style={{ color: '#888', fontSize: 12 }}>on {new Date(c.createdAt).toLocaleString()}</span></Typography>
            <Typography>{c.text}</Typography>
          </Box>
        ))}
        {user && (
          <Box component="form" onSubmit={handleAddComment} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
              placeholder="Add a comment..."
              style={{ padding: 8, fontSize: 16 }}
              disabled={commentLoading}
            />
            <Button type="submit" variant="contained" disabled={commentLoading || !commentText.trim()}>
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </Button>
            {commentError && <Typography color="error">{commentError}</Typography>}
          </Box>
        )}
        {!user && <Typography color="text.secondary" sx={{ mt: 2 }}>Login to add a comment.</Typography>}
      </Box>
    </Box>
  );
}