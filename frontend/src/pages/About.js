import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
  Dashboard as DashboardIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <Container>
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Task Manager
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          A powerful yet simple application for organizing your tasks and improving productivity
        </Typography>
      </Box>

      {/* Main Features Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 5 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Main Features
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <DashboardIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Dashboard View
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get a comprehensive overview of all your tasks, statistics,
                  and progress at a glance with our intuitive dashboard.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <CategoryIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Custom Categories
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and manage custom categories with color coding
                  to organize your tasks according to your workflow.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <DateRangeIcon color="primary" sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Due Date Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set due dates for your tasks and receive visual cues for
                  upcoming and overdue items to stay on track.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* How It Works Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 5 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          How It Works
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <List>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'primary.main' }}>1</Avatar>
            </ListItemIcon>
            <ListItemText 
              primary="Create an account" 
              secondary="Sign up with a username, email, and password to get started." 
            />
          </ListItem>
          
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'primary.main' }}>2</Avatar>
            </ListItemIcon>
            <ListItemText 
              primary="Set up categories" 
              secondary="Create custom categories with different colors to organize your tasks effectively." 
            />
          </ListItem>
          
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'primary.main' }}>3</Avatar>
            </ListItemIcon>
            <ListItemText 
              primary="Add tasks" 
              secondary="Create new tasks with titles, descriptions, priorities, categories, and due dates." 
            />
          </ListItem>
          
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'primary.main' }}>4</Avatar>
            </ListItemIcon>
            <ListItemText 
              primary="Track and complete" 
              secondary="Monitor your tasks on the dashboard, filter by various criteria, and mark them as complete when done." 
            />
          </ListItem>
          
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'primary.main' }}>5</Avatar>
            </ListItemIcon>
            <ListItemText 
              primary="Analyze your productivity" 
              secondary="Review your task completion statistics and improve your workflow over time." 
            />
          </ListItem>
        </List>
      </Paper>

      {/* Benefits Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 5 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Benefits
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 2, mt: 0.5 }} />
              <Typography variant="body1">
                <strong>Stay organized</strong> with a clear view of all your tasks
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 2, mt: 0.5 }} />
              <Typography variant="body1">
                <strong>Never miss deadlines</strong> with due date tracking
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 2, mt: 0.5 }} />
              <Typography variant="body1">
                <strong>Prioritize effectively</strong> using the priority system
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 2, mt: 0.5 }} />
              <Typography variant="body1">
                <strong>Track your progress</strong> with completion statistics
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 2, mt: 0.5 }} />
              <Typography variant="body1">
                <strong>Customize your workflow</strong> with categories and filters
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 2, mt: 0.5 }} />
              <Typography variant="body1">
                <strong>Access from anywhere</strong> with our responsive web application
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Get Started Section */}
      <Box sx={{ textAlign: 'center', my: 5 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to get started?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Sign up today and start organizing your tasks more effectively!
        </Typography>
        <Box sx={{ '& button': { m: 1 } }}>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/register"
          >
            Sign Up
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            component={Link} 
            to="/login"
          >
            Log In
          </Button>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', py: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Task Manager. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Created with React, Material-UI, and Django.
        </Typography>
      </Box>
    </Container>
  );
};

export default About; 