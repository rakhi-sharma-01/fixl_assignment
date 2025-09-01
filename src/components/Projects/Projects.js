import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ViewKanban,
  Assignment,
  Group,
  CalendarToday,
  Person
} from '@mui/icons-material';
import { createProject, updateProject, deleteProject } from '../../store/slices/projectSlice';
import { formatDistanceToNow } from 'date-fns';

const Projects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAdmin } = useSelector((state) => state.auth);
  const { teams } = useSelector((state) => state.teams);
  const { projects, loading } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamId: '',
    dueDate: ''
  });

  const handleCreateProject = async () => {
    try {
      await dispatch(createProject({
        ...formData,
        createdBy: user.id
      })).unwrap();
      
      setCreateProjectOpen(false);
      setFormData({ name: '', description: '', teamId: '', dueDate: '' });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleEditProject = async () => {
    try {
      await dispatch(updateProject({
        projectId: selectedProject.id,
        updates: formData
      })).unwrap();
      
      setEditProjectOpen(false);
      setSelectedProject(null);
      setFormData({ name: '', description: '', teamId: '', dueDate: '' });
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const openEditDialog = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      teamId: project.teamId,
      dueDate: project.dueDate ? project.dueDate.split('T')[0] : ''
    });
    setEditProjectOpen(true);
  };

  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'on-hold': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateProjectOpen(true)}
          >
            Create Project
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => {
          const progress = getProjectProgress(project.id);
          const teamName = getTeamName(project.teamId);
          const isOverdue = new Date(project.dueDate) < new Date() && project.status === 'active';
          
          return (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {project.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Team: {teamName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Due: {new Date(project.dueDate).toLocaleDateString()}
                      {isOverdue && (
                        <Chip
                          label="Overdue"
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2" color="primary">
                        {progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Project Members:
                  </Typography>
                  
                  <List dense>
                    {project.members.slice(0, 3).map((memberId) => (
                      <ListItem key={memberId} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={`User ${memberId}`} />
                      </ListItem>
                    ))}
                    {project.members.length > 3 && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary={`+${project.members.length - 3} more members`}
                          sx={{ fontStyle: 'italic' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ViewKanban />}
                    onClick={() => navigate(`/kanban/${project.id}`)}
                  >
                    Open Board
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => openEditDialog(project)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Project Dialog */}
      <Dialog open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Team</InputLabel>
            <Select
              value={formData.teamId}
              label="Team"
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            >
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editProjectOpen} onClose={() => setEditProjectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Team</InputLabel>
            <Select
              value={formData.teamId}
              label="Team"
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            >
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProjectOpen(false)}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained">
            Update Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {isAdmin && (
        <Tooltip title="Create Project">
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16, display: { md: 'none' } }}
            onClick={() => setCreateProjectOpen(true)}
          >
            <Add />
          </Fab>
        </Tooltip>
      )}
    </Box>
  );
};

export default Projects;
