import React, { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  MarkEmailRead as MarkEmailReadIcon
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/messages');
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Handle marking message as read
  const handleMarkRead = async (messageId) => {
    try {
      await axios.put(`/api/admin/messages/${messageId}/read`);
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  // Handle opening message dialog
  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
    setDialogOpen(true);
    if (!message.is_read) {
      handleMarkRead(message.id);
    }
  };

  // Handle closing message dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
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

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          Contact Messages
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell>
                  <Chip
                    size="small"
                    label={message.is_read ? "Read" : "Unread"}
                    color={message.is_read ? "default" : "primary"}
                  />
                </TableCell>
                <TableCell>
                  {dayjs(message.created_at).format('MMM D, YYYY HH:mm')}
                </TableCell>
                <TableCell>{message.name}</TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell>{message.subject}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenMessage(message)}
                    title="View Message"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {!message.is_read && (
                    <IconButton
                      onClick={() => handleMarkRead(message.id)}
                      title="Mark as Read"
                    >
                      <MarkEmailReadIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Message Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              Message from {selectedMessage.name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  From: {selectedMessage.name} ({selectedMessage.email})
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Date: {dayjs(selectedMessage.created_at).format('MMMM D, YYYY HH:mm')}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Subject: {selectedMessage.subject}
                </Typography>
              </Box>
              <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminMessages; 