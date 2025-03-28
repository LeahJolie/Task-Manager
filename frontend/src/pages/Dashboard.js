import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Divider,
  LinearProgress,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Priority colors
const priorityColors = {
  'Low': '#8bc34a',     // green
  'Medium': '#ff9800',  // orange
  'High': '#f44336'    // red
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Fetch tasks and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch tasks
        const tasksResponse = await axios.get('/api/tasks');
        setTasks(tasksResponse.data);
        
        // Fetch categories
        const categoriesResponse = await axios.get('/api/categories');
        setCategories(categoriesResponse.data);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle task completion toggle
  const handleTaskCompletion = async (taskId, completed) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { completed: !completed });
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      ));
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${taskId}`);
        
        // Remove from local state
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (err) {
        setError('Failed to delete task');
        console.error(err);
      }
    }
  };
  
  // Filter tasks based on search term, tab, category, and priority
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Tab filter (All, Active, Completed)
    const matchesTab = (
      (tabValue === 0) || // All
      (tabValue === 1 && !task.completed) || // Active
      (tabValue === 2 && task.completed) // Completed
    );
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || task.category_id === parseInt(categoryFilter);
    
    // Priority filter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesTab && matchesCategory && matchesPriority;
  });
  
  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Format date for display
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = dayjs(dueDate);
    const isOverdue = !date.isAfter(dayjs()) && date.isBefore(dayjs());
    
    return {
      display: date.format('MMM D, YYYY'),
      relative: date.fromNow(),
      isOverdue
    };
  };
  
  // Render loading state
  if (loading) {
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
              Dashboard
            </Typography>
          </Grid>
          <Grid item>
            <Button
              component={RouterLink}
              to="/tasks/create"
              variant="contained"
              startIcon={<AddIcon />}
            >
              New Task
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Tasks
                </Typography>
                <Typography variant="h4">{totalTasks}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed Tasks
                </Typography>
                <Typography variant="h4">{completedTasks}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completion Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4" sx={{ mr: 1 }}>
                    {completionRate.toFixed(0)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={completionRate}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Tasks"
              variant="outlined"
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
          </Grid>
          <Grid item xs={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          aria-label="task tabs"
        >
          <Tab label="All" />
          <Tab label="Active" />
          <Tab label="Completed" />
        </Tabs>
      </Box>
      
      {/* Display error if exists */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No tasks found
          </Typography>
          <Button
            component={RouterLink}
            to="/tasks/create"
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Create a task
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredTasks.map((task) => {
            const dueDate = formatDueDate(task.due_date);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    opacity: task.completed ? 0.7 : 1,
                    position: 'relative'
                  }}
                >
                  {task.completed && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        zIndex: 1, 
                        transform: 'rotate(30deg)' 
                      }}
                    >
                      <CheckCircleIcon color="success" fontSize="large" />
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label={task.priority}
                        sx={{
                          bgcolor: priorityColors[task.priority],
                          color: 'white'
                        }}
                      />
                      {task.category && (
                        <Chip
                          size="small"
                          label={task.category.name}
                          sx={{
                            bgcolor: task.category.color,
                            color: 'white'
                          }}
                        />
                      )}
                    </Box>
                    
                    <Typography variant="h6" component="h2" gutterBottom>
                      {task.title}
                    </Typography>
                    
                    {task.description && (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}
                    
                    {dueDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon
                          fontSize="small"
                          color={dueDate.isOverdue ? "error" : "action"}
                          sx={{ mr: 1 }}
                        />
                        <Typography
                          variant="body2"
                          color={dueDate.isOverdue ? "error" : "textSecondary"}
                        >
                          {dueDate.display} ({dueDate.relative})
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions>
                    <Button
                      size="small"
                      color={task.completed ? "secondary" : "primary"}
                      onClick={() => handleTaskCompletion(task.id, task.completed)}
                    >
                      {task.completed ? "Reopen" : "Complete"}
                    </Button>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/tasks/${task.id}`}
                    >
                      View
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      component={RouterLink}
                      to={`/tasks/${task.id}`}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard; 