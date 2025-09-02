import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  ArrowBack
} from '@mui/icons-material';
import { createTask, updateTask, deleteTask, addComment } from '../../store/slices/taskSlice';

// Kanban board component
const KanbanPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user, isAdmin } = useSelector((state) => state.auth);
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  
  // Basic state management
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: ''
  });
  const [commentText, setCommentText] = useState('');

  // Get project and tasks
  const project = projects.find(p => p.id === projectId);
  const projectTasks = tasks.filter(task => task.projectId === projectId);

  // Simple column setup
  const columns = [
    { id: 'todo', title: 'To Do', color: '#e3f2fd' },
    { id: 'in-progress', title: 'In Progress', color: '#fff3e0' },
    { id: 'done', title: 'Done', color: '#e8f5e8' }
  ];

  const getTasksByStatus = (status) => {
    return projectTasks.filter(task => task.status === status);
  };

  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      dispatch(updateTask({
        taskId: draggableId,
        updates: { status: destination.droppableId }
      }));
    }
  };

  // Create task
  const handleCreateTask = async () => {
    try {
      await dispatch(createTask({
        ...formData,
        projectId,
        teamId: project.teamId,
        createdBy: user.id,
        status: 'todo'
      })).unwrap();
      
      setCreateTaskOpen(false);
      setFormData({ title: '', description: '', priority: 'medium', assignee: '' });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Edit task
  const handleEditTask = async () => {
    try {
      await dispatch(updateTask({
        taskId: selectedTask.id,
        updates: formData
      })).unwrap();
      
      setEditTaskOpen(false);
      setSelectedTask(null);
      setFormData({ title: '', description: '', priority: 'medium', assignee: '' });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTask) return;
    
    try {
      await dispatch(addComment({
        taskId: selectedTask.id,
        commentData: {
          text: commentText,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar
        }
      })).unwrap();
      
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Open edit dialog
  const openEditDialog = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assignee || ''
    });
    setEditTaskOpen(true);
  };

  // Open task details
  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  // Helper functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getAssigneeName = (assigneeId) => {
    return assigneeId === '1' ? 'Admin User' : 'Team Member';
  };

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Project not found
        </Typography>
        <Button onClick={() => navigate('/projects')} variant="contained">
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button onClick={() => navigate('/projects')} startIcon={<ArrowBack />}>
            Back
          </Button>
          <Box>
            <Typography variant="h4" gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {project.description}
            </Typography>
          </Box>
        </Box>
        
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateTaskOpen(true)}
          >
            Add Task
          </Button>
        )}
      </Box>

      {/* Kanban board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {columns.map((column) => (
            <Paper
              key={column.id}
              elevation={2}
              sx={{
                minWidth: 320,
                backgroundColor: column.color,
                p: 2
              }}
            >
              <Typography variant="h6" gutterBottom>
                {column.title} ({getTasksByStatus(column.id).length})
              </Typography>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minHeight: 100,
                      backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.1)' : 'transparent',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            elevation={snapshot.isDragging ? 8 : 2}
                            sx={{
                              mb: 2,
                              cursor: 'grab',
                              '&:active': { cursor: 'grabbing' }
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {task.title}
                              </Typography>
                              
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                {task.description}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <Chip
                                  label={task.priority}
                                  color={getPriorityColor(task.priority)}
                                  size="small"
                                />
                                {task.assignee && (
                                  <Chip
                                    label={getAssigneeName(task.assignee)}
                                    size="small"
                                    icon={<Person />}
                                  />
                                )}
                              </Box>
                            </CardContent>
                            
                            <CardActions sx={{ p: 1, pt: 0 }}>
                              <Button
                                size="small"
                                onClick={() => openTaskDetails(task)}
                              >
                                View
                              </Button>
                              {isAdmin && (
                                <>
                                  <Button
                                    size="small"
                                    startIcon={<Edit />}
                                    onClick={() => openEditDialog(task)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="small"
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={() => handleDeleteTask(task.id)}
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </CardActions>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          ))}
        </Box>
      </DragDropContext>

      {/* Create task dialog */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Assignee</InputLabel>
            <Select
              value={formData.assignee}
              label="Assignee"
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            >
              <MenuItem value="">Unassigned</MenuItem>
              <MenuItem value="1">Admin User</MenuItem>
              <MenuItem value="2">Team Member</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit task dialog */}
      <Dialog open={editTaskOpen} onClose={() => setEditTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Assignee</InputLabel>
            <Select
              value={formData.assignee}
              label="Assignee"
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            >
              <MenuItem value="">Unassigned</MenuItem>
              <MenuItem value="1">Admin User</MenuItem>
              <MenuItem value="2">Team Member</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleEditTask} variant="contained">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task details dialog */}
      <Dialog open={taskDetailsOpen} onClose={() => setTaskDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedTask?.title}</Typography>
            <Chip
              label={selectedTask?.priority}
              color={getPriorityColor(selectedTask?.priority)}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {selectedTask?.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Chip
              label={`Assignee: ${selectedTask?.assignee ? getAssigneeName(selectedTask.assignee) : 'Unassigned'}`}
              icon={<Person />}
            />
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Comments ({selectedTask?.comments?.length || 0})
          </Typography>
          
          <List>
            {selectedTask?.comments?.map((comment, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`User ${comment.userId}`}
                  secondary={comment.text}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              Add Comment
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanPage;
