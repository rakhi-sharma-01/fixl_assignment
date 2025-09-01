// KanbanBoard.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Comment,
  Person,
  CalendarToday,
  Flag,
  MoreVert
} from '@mui/icons-material';
import { createTask, updateTask, deleteTask, moveTask, addComment } from '../../store/slices/taskSlice';
import { formatDistanceToNow } from 'date-fns';

const KanbanBoard = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const { user, isAdmin } = useSelector((state) => state.auth);
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    status: 'todo'
  });
  const [commentText, setCommentText] = useState('');

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((task) => task.projectId === projectId);

  const columns = [
    { id: 'todo', title: 'To Do', color: '#e3f2fd' },
    { id: 'in-progress', title: 'In Progress', color: '#fff3e0' },
    { id: 'done', title: 'Done', color: '#e8f5e8' }
  ];

  const getTasksByStatus = (status) =>
    projectTasks.filter((task) => task.status === status);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      dispatch(
        moveTask({
          taskId: draggableId,
          newStatus: destination.droppableId
        })
      );
    }
  };

  const handleCreateTask = async () => {
    try {
      await dispatch(
        createTask({
          ...formData,
          projectId,
          teamId: project.teamId,
          createdBy: user.id
        })
      ).unwrap();

      setCreateTaskOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        status: 'todo'
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleEditTask = async () => {
    try {
      await dispatch(
        updateTask({
          taskId: selectedTask.id,
          updates: formData
        })
      ).unwrap();

      setEditTaskOpen(false);
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        status: 'todo'
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await dispatch(
        addComment({
          taskId: selectedTask.id,
          commentData: {
            text: commentText,
            userId: user.id
          }
        })
      ).unwrap();

      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const openEditDialog = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status
    });
    setEditTaskOpen(true);
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getAssigneeName = (assigneeId) => {
    return `User ${assigneeId}`;
  };

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          Project not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {project.name} - Kanban Board
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {project.description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateTaskOpen(true)}
        >
          Add Task
        </Button>
      </Box>

      {/* KANBAN COLUMNS */}
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
                      backgroundColor: snapshot.isDraggingOver
                        ? 'rgba(0,0,0,0.1)'
                        : 'transparent',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
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
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  mb: 1
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: 'bold', flex: 1 }}
                                >
                                  {task.title}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => openTaskDetails(task)}
                                >
                                  <MoreVert />
                                </IconButton>
                              </Box>

                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ mb: 2 }}
                              >
                                {task.description}
                              </Typography>

                              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <Chip
                                  label={task.priority}
                                  color={getPriorityColor(task.priority)}
                                  size="small"
                                  icon={<Flag />}
                                />
                                {task.assignee && (
                                  <Chip
                                    label={getAssigneeName(task.assignee)}
                                    size="small"
                                    icon={<Person />}
                                  />
                                )}
                                {/* Simple Status Display */}
                                <Chip
                                  label={`Status: ${task.status === 'todo' ? 'To Do' : task.status === 'in-progress' ? 'In Progress' : 'Done'}`}
                                  color={task.status === 'done' ? 'success' : task.status === 'in-progress' ? 'warning' : 'default'}
                                  size="small"
                                  sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                                />
                              </Box>

                              {/* Status Change Dropdown */}
                              <Box sx={{ 
                                mb: 2, 
                                p: 1.5, 
                                backgroundColor: '#f5f5f5', 
                                borderRadius: 1.5, 
                                border: '1px solid #e0e0e0'
                              }}>
                                <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                  Change Status
                                </Typography>
                                <FormControl fullWidth size="small">
                                  <Select
                                    value={task.status}
                                    onChange={(e) => {
                                      dispatch(moveTask({
                                        taskId: task.id,
                                        newStatus: e.target.value
                                      }));
                                    }}
                                    sx={{ 
                                      fontSize: '0.75rem',
                                      backgroundColor: 'white'
                                    }}
                                  >
                                    <MenuItem value="todo">To Do</MenuItem>
                                    <MenuItem value="in-progress">In Progress</MenuItem>
                                    <MenuItem value="done">Done</MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>

                              {task.dueDate && (
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  display="block"
                                >
                                  Due: {new Date(
                                    task.dueDate
                                  ).toLocaleDateString()}
                                </Typography>
                              )}
                            </CardContent>

                            <CardActions sx={{ p: 1, pt: 0 }}>
                              <Button
                                size="small"
                                startIcon={<Comment />}
                                onClick={() => openTaskDetails(task)}
                              >
                                {task.comments?.length || 0} Comments
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
                                    onClick={() =>
                                      handleDeleteTask(task.id)
                                    }
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

      {/* CREATE TASK DIALOG */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Assignee</InputLabel>
            <Select
              value={formData.assignee}
              onChange={(e) =>
                setFormData({ ...formData, assignee: e.target.value })
              }
            >
              <MenuItem value="">Unassigned</MenuItem>
              {project.members.map((m) => (
                <MenuItem key={m} value={m}>
                  {getAssigneeName(m)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT TASK DIALOG */}
      <Dialog open={editTaskOpen} onClose={() => setEditTaskOpen(false)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Assignee</InputLabel>
            <Select
              value={formData.assignee}
              onChange={(e) =>
                setFormData({ ...formData, assignee: e.target.value })
              }
            >
              <MenuItem value="">Unassigned</MenuItem>
              {project.members.map((m) => (
                <MenuItem key={m} value={m}>
                  {getAssigneeName(m)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleEditTask} variant="contained">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* TASK DETAILS DIALOG */}
      <Dialog open={taskDetailsOpen} onClose={() => setTaskDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedTask?.title}</Typography>
            <Chip
              label={selectedTask?.priority}
              color={getPriorityColor(selectedTask?.priority)}
              icon={<Flag />}
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
            {selectedTask?.dueDate && (
              <Chip
                label={`Due: ${new Date(selectedTask.dueDate).toLocaleDateString()}`}
                icon={<CalendarToday />}
              />
            )}
          </Box>
          
          {/* Status Change in Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Change Status:
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedTask?.status || 'todo'}
                onChange={(e) => {
                  if (selectedTask) {
                    dispatch(moveTask({
                      taskId: selectedTask.id,
                      newStatus: e.target.value
                    }));
                  }
                }}
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Comments ({selectedTask?.comments?.length || 0})
          </Typography>
          
          <List>
            {selectedTask?.comments?.map((comment, index) => (
              <React.Fragment key={comment.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`User ${comment.userId}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">{comment.text}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < selectedTask.comments.length - 1 && <Divider />}
              </React.Fragment>
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

      {/* FLOATING ACTION BUTTON FOR MOBILE */}
      <Tooltip title="Add Task">
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16, display: { md: 'none' } }}
          onClick={() => setCreateTaskOpen(true)}
        >
          <Add />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default KanbanBoard;
