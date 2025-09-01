import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Group,
  Assignment,
  CheckCircle,
  TrendingUp,
  Notifications,
  Message
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// Main dashboard component
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { teams } = useSelector((state) => state.teams);
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const { notifications } = useSelector((state) => state.notifications);
  
  const [loading, setLoading] = useState(true);

  // Simple loading simulation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Basic stats - keeping it simple
  const totalTeams = teams.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Recent activities
  const recentNotifications = notifications.slice(0, 3);
  const recentTasks = tasks
    .filter(task => task.assignee === user?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // Helper functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in-progress': return 'warning';
      case 'done': return 'success';
      default: return status;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening with your teams and projects.
        </Typography>
      </Box>
      
      {/* Project Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary">
              {totalTeams}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Teams
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" color="secondary">
              {totalProjects}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Projects
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main">
              {completionRate}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Completion
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" color="info.main">
              {totalTasks}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tasks
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent activities - simplified */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tasks
            </Typography>
            
            {recentTasks.length > 0 ? (
              <List>
                {recentTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Assignment />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {task.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={getStatusText(task.status)}
                                color={getStatusColor(task.status)}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={task.priority}
                                color={getPriorityColor(task.priority)}
                                size="small"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No tasks assigned yet
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            
            {recentNotifications.length > 0 ? (
              <List>
                {recentNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.main' }}>
                          <Notifications />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentNotifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                No notifications yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Group />}
              onClick={() => navigate('/teams')}
            >
              Manage Teams
            </Button>
            <Button
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => navigate('/projects')}
            >
              View Projects
            </Button>
            <Button
              variant="outlined"
              startIcon={<Message />}
              onClick={() => navigate('/chat')}
            >
              Open Chat
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
