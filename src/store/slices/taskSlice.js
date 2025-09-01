import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockTasks = [
  {
    id: '1',
    title: 'Design Homepage Layout',
    description: 'Create wireframes and mockups for the homepage',
    status: 'todo',
    priority: 'high',
    assignee: '2',
    projectId: '1',
    teamId: '1',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: '1',
    comments: [
      {
        id: '1',
        text: 'Should we use a hero section?',
        userId: '1',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    title: 'Implement User Authentication',
    description: 'Set up JWT authentication and user management',
    status: 'in-progress',
    priority: 'high',
    assignee: '1',
    projectId: '1',
    teamId: '1',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: '1',
    comments: []
  },
  {
    id: '3',
    title: 'Create Mobile App Mockups',
    description: 'Design mobile app screens and user flows',
    status: 'done',
    priority: 'medium',
    assignee: '1',
    projectId: '2',
    teamId: '2',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: '1',
    comments: []
  }
];

// Mock API functions
const mockCreateTask = async (taskData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newTask = {
    id: uuidv4(),
    ...taskData,
    createdAt: new Date().toISOString(),
    comments: []
  };
  
  return newTask;
};

const mockUpdateTask = async (taskId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { id: taskId, ...updates };
};

const mockDeleteTask = async (taskId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return taskId;
};

const mockAddComment = async (taskId, commentData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    id: uuidv4(),
    ...commentData,
    createdAt: new Date().toISOString()
  };
};

// Async thunks
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await mockCreateTask(taskData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updates }, { rejectWithValue }) => {
    try {
      const response = await mockUpdateTask(taskId, updates);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await mockDeleteTask(taskId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, commentData }, { rejectWithValue }) => {
    try {
      const response = await mockAddComment(taskId, commentData);
      return { taskId, comment: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ taskId, newStatus }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { taskId, newStatus };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tasks: mockTasks,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    assignee: 'all',
    projectId: 'all'
  }
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        priority: 'all',
        assignee: 'all',
        projectId: 'all'
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        const taskIndex = state.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { taskId, comment } = action.payload;
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          task.comments.push(comment);
        }
      })
      // Move task
      .addCase(moveTask.fulfilled, (state, action) => {
        const { taskId, newStatus } = action.payload;
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = newStatus;
        }
      });
  },
});

export const { setFilters, clearFilters, clearError } = taskSlice.actions;
export default taskSlice.reducer;
