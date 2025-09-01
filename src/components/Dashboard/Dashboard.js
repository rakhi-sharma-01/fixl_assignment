import React from 'react';
import { useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { teams } = useSelector((state) => state.teams);
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const { notifications } = useSelector((state) => state.notifications);
  const { conversations } = useSelector((state) => state.chat);

  // Calculate statistics
  const totalTeams = teams.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get recent activities
  const recentNotifications = notifications.slice(0, 5);
  const recentTasks = tasks
    .filter(task => task.assignee === user?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

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
      default: return 'default';
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}! 👋
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary">
              {totalTeams}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Teams
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
              Active Projects
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
              Task Completion
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
              Total Tasks
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">My Recent Tasks</Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/projects')}
              >
                View All
              </Button>
            </Box>
            
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

        {/* Recent Notifications */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Notifications</Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/notifications')}
              >
                View All
              </Button>
            </Box>
            
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

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<Group />}
                  onClick={() => navigate('/teams')}
                >
                  Create Team
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/projects')}
                >
                  Create Project
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<Message />}
                  onClick={() => navigate('/chat')}
                >
                  Open Chat
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
