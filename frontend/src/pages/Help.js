import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Link as MuiLink
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  QuestionAnswer as QuestionIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);

  // FAQ data
  const faqData = [
    {
      question: 'How do I create a new task?',
      answer: 'To create a new task, click on the "New Task" button on the dashboard. Fill out the required fields (title, priority) and any optional fields (description, category, due date) and click "Create Task".'
    },
    {
      question: 'How do I mark a task as complete?',
      answer: 'There are two ways to mark a task as complete: 1) On the dashboard, click the checkbox next to the task. 2) Open the task details page and click the "Mark as Complete" button.'
    },
    {
      question: 'How do I create custom categories?',
      answer: 'Navigate to the "Categories" page by clicking on it in the sidebar menu. Click "Add Category" button, then enter a name and choose a color for your category. Click "Save" to create it.'
    },
    {
      question: 'Can I edit a task after creating it?',
      answer: 'Yes, you can edit a task at any time. From the dashboard, click on the task to view its details, then click the "Edit" button. Alternatively, click the edit icon directly from the task card on the dashboard.'
    },
    {
      question: 'How do I delete a task?',
      answer: 'To delete a task, open the task details page by clicking on it from the dashboard. Click the "Delete" button and confirm the deletion. Note that deleted tasks cannot be recovered.'
    },
    {
      question: 'How do I filter tasks?',
      answer: 'On the dashboard, you can filter tasks using the search bar to find tasks by title or description. You can also use the tabs to filter by status (All, Active, Completed) and the dropdown filters for categories and priorities.'
    },
    {
      question: 'What do the different priorities mean?',
      answer: 'Tasks can have three priority levels: Low (green), Medium (orange), and High (red). These help you identify which tasks need your attention most urgently.'
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to your Profile page by clicking on your username in the top-right corner and selecting "Profile". Then click the "Change Password" button and follow the prompts.'
    },
    {
      question: 'Can I use the application on mobile devices?',
      answer: 'Yes, the Task Manager is fully responsive and works on all devices including smartphones and tablets. Simply access the website from your mobile browser.'
    },
    {
      question: 'What happens when a task is overdue?',
      answer: 'Overdue tasks (those past their due date) will be highlighted in red in the dashboard. You\'ll also see an "Overdue" indicator on these tasks.'
    }
  ];

  // Filter FAQ based on search term
  const filteredFaq = searchTerm
    ? faqData.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/contact', formData);
      
      setSnackbar({
        open: true,
        message: 'Message sent successfully! We will get back to you soon.',
        severity: 'success'
      });

      // Clear form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container>
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Help Center
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Find answers to common questions and get support
        </Typography>
      </Box>

      {/* Search bar */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField
            fullWidth
            placeholder="Search for help topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="standard"
          />
        </Box>
      </Paper>

      {/* Quick links */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <QuestionIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Frequently Asked Questions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find answers to common questions below
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card component={Link} to="/about" sx={{ textDecoration: 'none' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MenuBookIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                About Task Manager
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn more about features and benefits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmailIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Contact Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send us a message for personalized help
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAQ section */}
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HelpIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h4" component="h2">
            Frequently Asked Questions
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {filteredFaq.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No results found for "{searchTerm}". Try a different search term or contact support.
          </Typography>
        ) : (
          filteredFaq.map((faq, index) => (
            <Accordion key={index} disableGutters elevation={0} sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              mb: 1, 
              '&:before': { display: 'none' } 
            }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: 'background.default' }}
              >
                <Typography variant="subtitle1">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Paper>

      {/* Contact Form */}
      <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Have a question that's not answered above? Send us a message and we'll get back to you as soon as possible.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<EmailIcon />}
                disabled={loading}
              >
                Send Message
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Additional resources */}
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Additional Resources
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Email Support
              </Typography>
              <Typography variant="body1">
                <MuiLink href="mailto:support@taskmanager.com">
                  support@taskmanager.com
                </MuiLink>
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Documentation
              </Typography>
              <Typography variant="body1">
                <MuiLink component={Link} to="/about">
                  View User Guide
                </MuiLink>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Help; 