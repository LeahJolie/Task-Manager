import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskDetail from './pages/TaskDetail';
import EditTask from './pages/EditTask';
import CreateTask from './pages/CreateTask';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import About from './pages/About';
import Help from './pages/Help';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import AdminMessages from './pages/AdminMessages';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children, admin = false }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (admin && !currentUser.is_admin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Protected auth route component (for login and register pages)
const ProtectedAuthRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Routes>
        <Route path="/login" element={
          <ProtectedAuthRoute>
            <Login />
          </ProtectedAuthRoute>
        } />
        <Route path="/register" element={
          <ProtectedAuthRoute>
            <Register />
          </ProtectedAuthRoute>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks/create" element={<CreateTask />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="tasks/edit/:id" element={<EditTask />} />
          <Route path="categories" element={<Categories />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute admin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <ProtectedRoute admin={true}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/messages" element={
            <ProtectedRoute admin={true}>
              <AdminMessages />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LocalizationProvider>
  );
}

export default App; 