import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person,
  Email,
  AdminPanelSettings,
  Group,
  Assignment,
  CheckCircle,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { updateUser } from '../../store/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isAdmin } = useSelector((state) => state.auth);
  const { teams } = useSelector((state) => state.teams);
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateUser(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate user statistics
  const userTeams = teams.filter(team => 
    team.members.some(member => member.id === user?.id)
  );
  
  const userProjects = projects.filter(project => 
    project.members.includes(user?.id)
  );
  
  const userTasks = tasks.filter(task => 
    task.assignee === user?.id || task.createdBy === user?.id
  );
  
  const completedTasks = userTasks.filter(task => task.status === 'done').length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                fontSize: '3rem'
              }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <Person />
              )}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {user?.email}
            </Typography>
            
            <Chip
              label={isAdmin ? 'Admin' : 'Member'}
              color={isAdmin ? 'error' : 'primary'}
              icon={isAdmin ? <AdminPanelSettings /> : <Person />}
              sx={{ mt: 1 }}
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
                disabled={isEditing}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Profile Information</Typography>
              {isEditing && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            {/* User Statistics */}
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary.contrastText">
                    {userTeams.length}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    Teams
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="secondary.contrastText">
                    {userProjects.length}
                  </Typography>
                  <Typography variant="body2" color="secondary.contrastText">
                    Projects
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="info.contrastText">
                    {userTasks.length}
                  </Typography>
                  <Typography variant="body2" color="info.contrastText">
                    Total Tasks
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="success.contrastText">
                    {completedTasks}
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    Completed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Recent Activity */}
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Group color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Joined Development Team"
                  secondary="2 days ago"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Assignment color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Completed task: Design Homepage Layout"
                  secondary="1 week ago"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Task status updated to In Progress"
                  secondary="2 weeks ago"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
