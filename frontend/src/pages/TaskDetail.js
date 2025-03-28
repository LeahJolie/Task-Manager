import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Card,
  CardContent,
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [note, setNote] = useState('');
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tasks/${id}`);
      setTask(response.data);
    } catch (err) {
      console.error('Failed to fetch task details:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle delete task
  const handleDeleteTask = async () => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setSnackbar({
        open: true,
        message: 'Task deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      // Navigate back to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete task',
        severity: 'error'
      });
      setDeleteDialogOpen(false);
    }
  };

  // Handle complete/uncomplete task
  const handleToggleComplete = async () => {
    try {
      await axios.put(`/api/tasks/${id}`, {
        completed: !task.completed
      });
      setTask({
        ...task,
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null
      });
      setSnackbar({
        open: true,
        message: task.completed ? 'Task marked as incomplete' : 'Task marked as complete',
        severity: 'success'
      });
      setCompleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to update task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update task status',
        severity: 'error'
      });
      setCompleteDialogOpen(false);
    }
  };

  // Handle add/edit note
  const handleSubmitNote = async () => {
    try {
      await axios.put(`/api/tasks/${id}`, {
        notes: note
      });
      setTask({
        ...task,
        notes: note
      });
      setSnackbar({
        open: true,
        message: 'Note updated successfully',
        severity: 'success'
      });
      setNoteDialogOpen(false);
    } catch (err) {
      console.error('Failed to update note:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update note',
        severity: 'error'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/dashboard')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Task Details
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {task.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={task.completed ? 'Completed' : 'Active'} 
                color={task.completed ? 'success' : 'primary'} 
                size="small"
                icon={task.completed ? <CheckCircleIcon /> : <UncheckedIcon />}
              />
              <Chip 
                label={`Priority: ${task.priority}`} 
                color={getPriorityColor(task.priority)} 
                size="small" 
              />
              {task.category && (
                <Chip 
                  label={task.category.name} 
                  size="small"
                  sx={{ bgcolor: task.category.color, color: '#fff' }}
                />
              )}
              {task.due_date && (
                <Chip 
                  label={`Due: ${dayjs(task.due_date).format('MMM D, YYYY')}`} 
                  size="small"
                  icon={<ScheduleIcon />}
                  color={dayjs().isAfter(dayjs(task.due_date)) && !task.completed ? 'error' : 'default'}
                />
              )}
            </Box>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/tasks/edit/${id}`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
              {task.description || 'No description provided.'}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, minHeight: '100px', bgcolor: 'background.default' }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {task.notes || 'No notes added yet.'}
              </Typography>
            </Paper>
            <Button
              variant="outlined"
              onClick={() => {
                setNote(task.notes || '');
                setNoteDialogOpen(true);
              }}
            >
              {task.notes ? 'Edit Notes' : 'Add Notes'}
            </Button>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status
                </Typography>
                <Button
                  variant="contained"
                  color={task.completed ? 'error' : 'success'}
                  fullWidth
                  startIcon={task.completed ? <UncheckedIcon /> : <CheckCircleIcon />}
                  onClick={() => setCompleteDialogOpen(true)}
                  sx={{ mb: 2 }}
                >
                  Mark as {task.completed ? 'Incomplete' : 'Complete'}
                </Button>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created: {dayjs(task.created_at).format('MMM D, YYYY')}
                </Typography>
                
                {task.completed && task.completed_at && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Completed: {dayjs(task.completed_at).format('MMM D, YYYY')}
                  </Typography>
                )}
                
                {task.due_date && (
                  <Typography 
                    variant="body2" 
                    color={dayjs().isAfter(dayjs(task.due_date)) && !task.completed ? 'error' : 'text.secondary'}
                    gutterBottom
                  >
                    Due: {dayjs(task.due_date).format('MMM D, YYYY')} 
                    {!task.completed && dayjs().isAfter(dayjs(task.due_date)) 
                      ? ' (Overdue)' 
                      : !task.completed 
                        ? ` (${dayjs(task.due_date).fromNow()})`
                        : ''}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {dayjs(task.updated_at).format('MMM D, YYYY, h:mm A')}
                </Typography>
              </CardContent>
            </Card>
            
            {task.created_by && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {task.created_by.username}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete/Uncomplete Confirmation Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
      >
        <DialogTitle>
          {task?.completed ? 'Mark Task as Incomplete?' : 'Mark Task as Complete?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {task?.completed 
              ? 'Are you sure you want to mark this task as incomplete?' 
              : 'Are you sure you want to mark this task as complete?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleToggleComplete} 
            color={task?.completed ? 'error' : 'success'} 
            variant="contained"
          >
            {task?.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{task?.notes ? 'Edit Notes' : 'Add Notes'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={6}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Add notes about this task..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitNote} variant="contained">
            Save
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

export default TaskDetail; 