import PostList from '../components/PostList';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Posts() {
  return (
    <>
      <Button 
        component={Link} 
        to="/new-post" 
        variant="contained" 
        sx={{ mb: 3 }}
      >
        New Post
      </Button>
      <PostList />
    </>
  );
}