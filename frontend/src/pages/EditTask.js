import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  Grid,
  Paper,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required').max(100, 'Title must be less than 100 characters'),
    description: Yup.string().max(500, 'Description must be less than 500 characters'),
    priority: Yup.string().required('Priority is required').oneOf(['Low', 'Medium', 'High'], 'Invalid priority'),
    category_id: Yup.number().nullable(),
    due_date: Yup.date().nullable().min(dayjs().subtract(1, 'day').toDate(), 'Due date cannot be in the past')
  });

  // Fetch task and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch task details
        const taskResponse = await axios.get(`/api/tasks/${id}`);
        setTask(taskResponse.data);
        
        // Fetch categories
        const categoriesResponse = await axios.get('/api/categories');
        setCategories(categoriesResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load task data. The task may not exist or you may not have permission to edit it.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Format the due date if it exists
      const formattedValues = {
        ...values,
        due_date: values.due_date ? dayjs(values.due_date).format('YYYY-MM-DD') : null
      };
      
      await axios.put(`/api/tasks/${id}`, formattedValues);
      
      setSnackbar({
        open: true,
        message: 'Task updated successfully',
        severity: 'success'
      });
      
      // Navigate to task detail page after short delay
      setTimeout(() => {
        navigate(`/tasks/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to update task:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update task',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
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

  // Prepare initial values from task data
  const initialValues = {
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    category_id: task.category ? task.category.id : '',
    due_date: task.due_date ? dayjs(task.due_date) : null
  };

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(`/tasks/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Edit Task
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="title"
                    name="title"
                    label="Task Title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    multiline
                    rows={4}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.priority && Boolean(errors.priority)}>
                    <InputLabel id="priority-label">Priority</InputLabel>
                    <Select
                      labelId="priority-label"
                      id="priority"
                      name="priority"
                      value={values.priority}
                      label="Priority"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                    </Select>
                    {touched.priority && errors.priority && (
                      <FormHelperText>{errors.priority}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.category_id && Boolean(errors.category_id)}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category_id"
                      name="category_id"
                      value={values.category_id}
                      label="Category"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem 
                          key={category.id} 
                          value={category.id}
                          sx={{ 
                            '&.MuiMenuItem-root': { 
                              '&::before': {
                                content: '""',
                                display: 'block',
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: category.color,
                                marginRight: 1
                              }
                            }
                          }}
                        >
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.category_id && errors.category_id && (
                      <FormHelperText>{errors.category_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      value={values.due_date}
                      onChange={(date) => setFieldValue('due_date', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.due_date && Boolean(errors.due_date),
                          helperText: touched.due_date && errors.due_date
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button 
                      variant="outlined"
                      onClick={() => navigate(`/tasks/${id}`)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>

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

export default EditTask; 