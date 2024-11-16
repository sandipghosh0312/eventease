import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  IconButton,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AddIcon from '@mui/icons-material/Add';
import "./ProfileA.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function ProfileA() {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([
    { id: 1, type: 'image', url: '/path/to/event-photo.jpg', title: 'Amazing Concert!', likes: 10, comments: 5 },
    { id: 2, type: 'video', url: '/path/to/event-video.mp4', title: 'Event Highlights', likes: 8, comments: 3 },
  ]);
  const [newPost, setNewPost] = useState({ eventName: '', description: '', media: null });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handlePostSubmit = () => {
    setPosts([...posts, { ...newPost, id: posts.length + 1 }]);
    handleClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
  };

  const handleMediaChange = (e) => {
    setNewPost({ ...newPost, media: e.target.files[0] });
  };

  return (
    <>
      <Header />
      <div className="splitter">
        <Sidebar />
        <div className="profile-page">
          <Paper className="profile-banner" elevation={3}>
            <Avatar className="profile-avatar" src="/path/to/profile-pic.jpg" alt="Profile Picture" />
            <Typography variant="h4" className="profile-name">John Doe</Typography>
            <Button variant="contained" color="primary" className="follow-button">Follow</Button>
          </Paper>

          <Grid container spacing={3} className="profile-details">
            <Grid item xs={12} sm={6} md={4}>
              <Card className="detail-card">
                <CardContent>
                  <Typography variant="h6">Name:</Typography>
                  <Typography variant="body1">John Doe</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className="detail-card">
                <CardContent>
                  <Typography variant="h6">Email:</Typography>
                  <Typography variant="body1">john.doe@example.com</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className="detail-card">
                <CardContent>
                  <Typography variant="h6">Phone:</Typography>
                  <Typography variant="body1">123-456-7890</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className="detail-card">
                <CardContent>
                  <Typography variant="h6">Date of Birth:</Typography>
                  <Typography variant="body1">January 1, 1990</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className="detail-card">
                <CardContent>
                  <Typography variant="h6">Location:</Typography>
                  <Typography variant="body1">New York, USA</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card className="detail-card">
                <CardContent>
                  <Typography variant="h6">Other Info:</Typography>
                  <Typography variant="body1">Additional details here</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card className="add-post-card">
            <CardContent>
              <Button startIcon={<AddIcon />} variant="contained" color="primary" onClick={handleOpen}>Add Post</Button>
            </CardContent>
          </Card>

          <Grid container spacing={2} className="post-container">
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <Card className="post-card">
                  {post.type === 'image' ? (
                    <img src={post.url} alt={post.title} className="post-media" />
                  ) : (
                    <video src={post.url} controls className="post-media"></video>
                  )}
                  <CardContent>
                    <Typography variant="h6">{post.title}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton><FavoriteIcon color="primary" /> {post.likes}</IconButton>
                    <IconButton><CommentIcon color="secondary" /> {post.comments}</IconButton>
                    <IconButton><ShareIcon color="action" /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add Post</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Event Name"
                name="eventName"
                fullWidth
                value={newPost.eventName}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                label="Description"
                name="description"
                multiline
                rows={4}
                fullWidth
                value={newPost.description}
                onChange={handleInputChange}
              />
              <Button variant="contained" component="label">
                Upload Media
                <input type="file" hidden onChange={handleMediaChange} />
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handlePostSubmit}>Post</Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </>
  );
}

export default ProfileA;
