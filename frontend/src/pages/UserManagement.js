import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  PersonOff as PersonOffIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const UserManagement = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    username: ''
  });
  const [adminDialog, setAdminDialog] = useState({
    open: false,
    userId: null,
    username: '',
    makeAdmin: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load users',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search users
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    setPage(0);
  }, [searchTerm, users]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = (userId, username) => {
    setDeleteDialog({
      open: true,
      userId,
      username
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      userId: null,
      username: ''
    });
  };

  // Handle admin dialog
  const handleOpenAdminDialog = (userId, username, makeAdmin) => {
    setAdminDialog({
      open: true,
      userId,
      username,
      makeAdmin
    });
  };

  const handleCloseAdminDialog = () => {
    setAdminDialog({
      open: false,
      userId: null,
      username: '',
      makeAdmin: false
    });
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/api/admin/users/${deleteDialog.userId}`);
      setSnackbar({
        open: true,
        message: `User ${deleteDialog.username} has been deleted`,
        severity: 'success'
      });
      handleCloseDeleteDialog();
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete user',
        severity: 'error'
      });
      handleCloseDeleteDialog();
    }
  };

  // Handle toggle admin status
  const handleToggleAdminStatus = async () => {
    try {
      await axios.put(`/api/admin/users/${adminDialog.userId}`, {
        is_admin: adminDialog.makeAdmin
      });
      setSnackbar({
        open: true,
        message: `${adminDialog.username} is ${adminDialog.makeAdmin ? 'now an admin' : 'no longer an admin'}`,
        severity: 'success'
      });
      handleCloseAdminDialog();
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update user',
        severity: 'error'
      });
      handleCloseAdminDialog();
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading && users.length === 0) {
    return (
      <Container>
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by username or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Tasks</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: user.is_admin ? 'warning.main' : 'primary.main', mr: 2 }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body1">{user.username}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_admin ? 'Admin' : 'User'}
                      color={user.is_admin ? 'warning' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.task_count}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {/* Toggle admin status */}
                      <Tooltip title={user.is_admin ? "Remove admin rights" : "Make admin"}>
                        <IconButton
                          onClick={() => handleOpenAdminDialog(user.id, user.username, !user.is_admin)}
                          color={user.is_admin ? "warning" : "default"}
                          disabled={user.id === currentUser.id}
                        >
                          {user.is_admin ? <PersonOffIcon /> : <AdminIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      {/* Delete user */}
                      <Tooltip title="Delete user">
                        <IconButton
                          onClick={() => handleOpenDeleteDialog(user.id, user.username)}
                          color="error"
                          disabled={user.id === currentUser.id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{deleteDialog.username}"? 
            This will also delete all their tasks and categories.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Status Dialog */}
      <Dialog
        open={adminDialog.open}
        onClose={handleCloseAdminDialog}
      >
        <DialogTitle>
          {adminDialog.makeAdmin ? 'Grant Admin Rights' : 'Remove Admin Rights'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {adminDialog.makeAdmin
              ? `Are you sure you want to make "${adminDialog.username}" an admin? This will give them full access to all users and data.`
              : `Are you sure you want to remove admin rights from "${adminDialog.username}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdminDialog}>Cancel</Button>
          <Button 
            onClick={handleToggleAdminStatus} 
            color={adminDialog.makeAdmin ? "warning" : "primary"}
            variant="contained"
          >
            {adminDialog.makeAdmin ? 'Make Admin' : 'Remove Admin'}
          </Button>
        </DialogActions>
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

export default UserManagement; 