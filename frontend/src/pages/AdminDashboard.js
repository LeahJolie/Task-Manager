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
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Button,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  SupervisorAccount as AdminIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import dayjs from 'dayjs';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: [],
    userCount: 0,
    taskCount: 0,
    categoryCount: 0,
    adminCount: 0,
    latestTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Get all users
        const usersResponse = await axios.get('/api/admin/users');
        const users = usersResponse.data;
        
        // Get stats
        const statsResponse = await axios.get('/api/admin/stats');
        const { status_distribution, user_growth } = statsResponse.data;
        
        // Calculate counts
        const userCount = users.length;
        const adminCount = users.filter(user => user.is_admin).length;
        
        // Get latest tasks
        const tasksResponse = await axios.get('/api/tasks');
        const latestTasks = tasksResponse.data.slice(0, 5); // Get 5 most recent tasks
        
        // Calculate total tasks and categories
        const taskCount = users.reduce((total, user) => total + user.task_count, 0);
        
        // Get categories
        const categoriesResponse = await axios.get('/api/categories');
        const categoryCount = categoriesResponse.data.length;
        
        // Process chart data
        setStatusDistribution(status_distribution);
        setUserGrowth(user_growth);
        
        // Set all stats
        setStats({
          users,
          userCount,
          taskCount,
          categoryCount,
          adminCount,
          latestTasks
        });
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  // Prepare pie chart data for task status distribution
  const pieChartData = {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [
          statusDistribution.find(s => s.status === 0)?.count || 0,
          statusDistribution.find(s => s.status === 1)?.count || 0,
          statusDistribution.find(s => s.status === 2)?.count || 0
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare line chart data for user growth
  const lineChartData = {
    labels: userGrowth.map(item => item.month),
    datasets: [
      {
        label: 'New Users',
        data: userGrowth.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Total Users
                    </Typography>
                    <Typography variant="h5">{stats.userCount}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Total Tasks
                    </Typography>
                    <Typography variant="h5">{stats.taskCount}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CategoryIcon />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Categories
                    </Typography>
                    <Typography variant="h5">{stats.categoryCount}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <AdminIcon />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Admins
                    </Typography>
                    <Typography variant="h5">{stats.adminCount}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Charts and Lists */}
      <Grid container spacing={4}>
        {/* Task Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Task Status Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        
        {/* User Growth Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              User Growth
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line 
                data={lineChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Latest Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Latest Users
              </Typography>
              <Button 
                component={RouterLink}
                to="/admin/users"
                endIcon={<GroupIcon />}
                size="small"
              >
                Manage Users
              </Button>
            </Box>
            <List>
              {stats.users.slice(0, 5).map((user, index) => (
                <React.Fragment key={user.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: user.is_admin ? 'warning.main' : 'primary.main' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={user.username} 
                      secondary={user.email}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                    {user.is_admin && <Chip size="small" label="Admin" color="warning" />}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Latest Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tasks
            </Typography>
            <List>
              {stats.latestTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: task.completed ? 'success.main' : 'primary.main' }}>
                        <AssignmentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={task.title} 
                      secondary={`Created ${dayjs(task.created_at).format('MMM D, YYYY')}`}
                    />
                    <Chip 
                      size="small" 
                      label={task.completed ? 'Completed' : 'Active'} 
                      color={task.completed ? 'success' : 'primary'} 
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 