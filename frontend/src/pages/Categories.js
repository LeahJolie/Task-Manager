import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Paper,
  Snackbar,
  Alert,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .max(50, 'Name must be at most 50 characters'),
    color: Yup.string()
      .required('Color is required')
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      color: '#2196f3'
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        if (editCategory) {
          // Update category
          await axios.put(`/api/categories/${editCategory.id}`, values);
          setSnackbar({
            open: true,
            message: 'Category updated successfully!',
            severity: 'success'
          });
        } else {
          // Create category
          await axios.post('/api/categories', values);
          setSnackbar({
            open: true,
            message: 'Category created successfully!',
            severity: 'success'
          });
        }
        
        // Close dialog and refresh categories
        handleCloseDialog();
        fetchCategories();
      } catch (err) {
        console.error('Failed to save category:', err);
        setSnackbar({
          open: true,
          message: 'Failed to save category',
          severity: 'error'
        });
      }
    }
  });

  // Handle dialog open for create
  const handleCreateCategory = () => {
    setEditCategory(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  // Handle dialog open for edit
  const handleEditCategory = (category) => {
    setEditCategory(category);
    formik.setValues({
      name: category.name,
      color: category.color
    });
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setColorPickerOpen(false);
    setTimeout(() => {
      formik.resetForm();
      setEditCategory(null);
    }, 300); // Wait for dialog animation to finish
  };

  // Handle color change
  const handleColorChange = (color) => {
    formik.setFieldValue('color', color.hex);
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`/api/categories/${categoryId}`);
      setSnackbar({
        open: true,
        message: 'Category deleted successfully!',
        severity: 'success'
      });
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      
      // Special handling for categories with tasks
      if (err.response && err.response.status === 400) {
        setSnackbar({
          open: true,
          message: 'Cannot delete category with assigned tasks',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete category',
          severity: 'error'
        });
      }
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading && categories.length === 0) {
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
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Categories
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCategory}
            >
              New Category
            </Button>
          </Grid>
        </Grid>
      </Box>

      {categories.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No categories found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Create categories to organize your tasks
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCategory}
          >
            Create your first category
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card 
                sx={{ 
                  borderTop: `4px solid ${category.color}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: category.color,
                        mr: 1
                      }}
                    />
                    <Typography variant="h6" component="h2">
                      {category.name}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={`${category.task_count} tasks`} 
                    size="small" 
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleEditCategory(category)}
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={category.task_count > 0}
                    title={category.task_count > 0 ? "Cannot delete category with tasks" : "Delete category"}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Category Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editCategory ? 'Edit Category' : 'Create Category'}
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Category Name"
                  variant="outlined"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              
              <Grid item xs={12}>
                <InputLabel sx={{ mb: 1 }}>Category Color</InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '4px',
                      bgcolor: formik.values.color,
                      mr: 2,
                      cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.12)'
                    }}
                    onClick={() => setColorPickerOpen(!colorPickerOpen)}
                  />
                  <TextField
                    id="color"
                    name="color"
                    value={formik.values.color}
                    onChange={formik.handleChange}
                    error={formik.touched.color && Boolean(formik.errors.color)}
                    helperText={formik.touched.color && formik.errors.color}
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
                
                {colorPickerOpen && (
                  <Box sx={{ mt: 2, position: 'relative', zIndex: 2 }}>
                    <Box
                      sx={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        zIndex: 1
                      }}
                      onClick={() => setColorPickerOpen(false)}
                    />
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <SketchPicker
                        color={formik.values.color}
                        onChange={handleColorChange}
                        disableAlpha
                      />
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              Save
            </Button>
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

export default Categories; 