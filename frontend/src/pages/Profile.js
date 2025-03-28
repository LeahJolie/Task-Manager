import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

const Profile = () => {
  const { currentUser, updateUserData, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    date_joined: '',
    is_admin: false,
    task_count: 0,
    completed_task_count: 0
  });
  
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch user profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/profile');
      setProfileData(response.data);
      setFormData({
        username: response.data.username,
        email: response.data.email
      });
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load profile information',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle form input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    
    // Clear error for this field if it exists
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({
        ...passwordErrors,
        [e.target.name]: null
      });
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }
    
    try {
      await axios.put('/api/users/profile', formData);
      
      // Update auth context with new user data
      updateUserData({
        ...currentUser,
        username: formData.username,
        email: formData.email
      });
      
      setProfileData({
        ...profileData,
        username: formData.username,
        email: formData.email
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      
      // Handle validation errors from server
      if (err.response && err.response.data) {
        setProfileErrors(err.response.data);
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update profile',
          severity: 'error'
        });
      }
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password data
    const errors = {};
    if (!passwordData.current_password) {
      errors.current_password = 'Current password is required';
    }
    if (!passwordData.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    try {
      await axios.put('/api/users/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      setSnackbar({
        open: true,
        message: 'Password changed successfully. Please log in again.',
        severity: 'success'
      });
      
      // Reset password form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      // Close password dialog
      setPasswordDialogOpen(false);
      
      // Log user out after password change
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Failed to change password:', err);
      
      // Handle validation errors from server
      if (err.response && err.response.data) {
        setPasswordErrors(err.response.data);
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to change password',
          severity: 'error'
        });
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ 
                width: 100, 
                height: 100, 
                margin: '0 auto 16px',
                bgcolor: profileData.is_admin ? 'warning.main' : 'primary.main',
                fontSize: '3rem'
              }}
            >
              {profileData.username.charAt(0).toUpperCase()}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {profileData.username}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profileData.email}
            </Typography>
            
            {profileData.is_admin && (
              <Chip 
                label="Admin" 
                color="warning" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Joined {dayjs(profileData.date_joined).format('MMMM D, YYYY')}
            </Typography>
          </Paper>
        </Grid>

        {/* User Profile Form / Stats */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {!editMode ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Account Information</Typography>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Username</Typography>
                    <Typography variant="body1">{profileData.username}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{profileData.email}</Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<KeyIcon />}
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </Box>
              </>
            ) : (
              <form onSubmit={handleProfileSubmit}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Edit Profile</Typography>
                  <Box>
                    <IconButton onClick={() => setEditMode(false)} sx={{ mr: 1 }}>
                      <CancelIcon />
                    </IconButton>
                    <IconButton type="submit" color="primary">
                      <SaveIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      fullWidth
                      error={!!profileErrors.username}
                      helperText={profileErrors.username}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      fullWidth
                      error={!!profileErrors.email}
                      helperText={profileErrors.email}
                      required
                    />
                  </Grid>
                </Grid>
              </form>
            )}
          </Paper>

          {/* Task Statistics */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Tasks</Typography>
                  <Typography variant="h4">{profileData.task_count}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Completed Tasks</Typography>
                  <Typography variant="h4">{profileData.completed_task_count}</Typography>
                  {profileData.task_count > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {Math.round((profileData.completed_task_count / profileData.task_count) * 100)}% completion rate
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={handlePasswordSubmit}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              To change your password, please enter your current password and choose a new one.
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Current Password"
                  name="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                  error={!!passwordErrors.current_password}
                  helperText={passwordErrors.current_password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="New Password"
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                  error={!!passwordErrors.new_password}
                  helperText={passwordErrors.new_password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Confirm New Password"
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                  error={!!passwordErrors.confirm_password}
                  helperText={passwordErrors.confirm_password}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Change Password</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 