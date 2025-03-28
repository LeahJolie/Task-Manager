import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Snackbar,
  Alert,
  IconButton,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { 
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';

const CreateTask = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load categories',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Form validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .max(100, 'Title must be at most 100 characters'),
    description: Yup.string()
      .max(1000, 'Description must be at most 1000 characters'),
    priority: Yup.number()
      .required('Priority is required'),
    category_id: Yup.number()
      .required('Category is required'),
    due_date: Yup.date()
      .nullable()
      .min(new Date(), 'Due date cannot be in the past')
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      priority: 2, // Default to Medium
      category_id: '',
      due_date: null
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        // Convert date to ISO string if it exists
        const formattedValues = {
          ...values,
          due_date: values.due_date ? dayjs(values.due_date).toISOString() : null
        };
        
        // Submit the task
        await axios.post('/api/tasks', formattedValues);
        
        setSnackbar({
          open: true,
          message: 'Task created successfully!',
          severity: 'success'
        });
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err) {
        console.error('Failed to create task:', err);
        setSnackbar({
          open: true,
          message: 'Failed to create task',
          severity: 'error'
        });
      }
    }
  });
  
  // Handle date change
  const handleDateChange = (date) => {
    formik.setFieldValue('due_date', date);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Handle create category
  const handleCreateCategory = () => {
    navigate('/categories');
  };
  
  return (
    <Container maxWidth="md">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
            <IconButton
              sx={{ mr: 2 }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              Create New Task
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Task Title"
                  variant="outlined"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.priority && Boolean(formik.errors.priority)}>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    label="Priority"
                  >
                    <MenuItem value={1}>Low</MenuItem>
                    <MenuItem value={2}>Medium</MenuItem>
                    <MenuItem value={3}>High</MenuItem>
                  </Select>
                  {formik.touched.priority && formik.errors.priority && (
                    <FormHelperText>{formik.errors.priority}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.category_id && Boolean(formik.errors.category_id)}
                    sx={{ mr: 1 }}
                  >
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category_id"
                      name="category_id"
                      value={formik.values.category_id}
                      onChange={formik.handleChange}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem 
                          key={category.id} 
                          value={category.id}
                          sx={{ 
                            '&::before': { 
                              content: '""',
                              display: 'block',
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              backgroundColor: category.color,
                              marginRight: 1
                            }
                          }}
                        >
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.category_id && formik.errors.category_id && (
                      <FormHelperText>{formik.errors.category_id}</FormHelperText>
                    )}
                  </FormControl>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleCreateCategory}
                    sx={{ mt: 1 }}
                  >
                    New
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <DateTimePicker
                  label="Due Date (Optional)"
                  value={formik.values.due_date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.due_date && Boolean(formik.errors.due_date),
                      helperText: formik.touched.due_date && formik.errors.due_date
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={formik.isSubmitting}
                  >
                    Create Task
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}
      
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

export default CreateTask; 