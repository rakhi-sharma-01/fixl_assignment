import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockNotifications = [
  {
    id: '1',
    type: 'task_assigned',
    title: 'Task Assigned',
    message: 'You have been assigned to "Design Homepage Layout"',
    userId: '2',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: {
      taskId: '1',
      taskTitle: 'Design Homepage Layout',
      projectId: '1'
    }
  },
  {
    id: '2',
    type: 'task_status_changed',
    title: 'Task Status Updated',
    message: 'Task "Implement User Authentication" moved to In Progress',
    userId: '1',
    read: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    data: {
      taskId: '2',
      taskTitle: 'Implement User Authentication',
      oldStatus: 'todo',
      newStatus: 'in-progress'
    }
  },
  {
    id: '3',
    type: 'new_message',
    title: 'New Message',
    message: 'New message in "E-commerce Website" chat',
    userId: '1',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    data: {
      conversationId: '2',
      conversationName: 'E-commerce Website'
    }
  }
];

// Mock API functions
const mockMarkAsRead = async (notificationId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return notificationId;
};

const mockMarkAllAsRead = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return userId;
};

const mockDeleteNotification = async (notificationId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return notificationId;
};

// Async thunks
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await mockMarkAsRead(notificationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await mockMarkAllAsRead(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await mockDeleteNotification(notificationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.read).length,
  loading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const newNotification = {
        id: uuidv4(),
        ...action.payload,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount -= 1;
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.notifications.forEach(notification => {
          if (notification.userId === action.payload && !notification.read) {
            notification.read = true;
          }
        });
        state.unreadCount = 0;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
      });
  },
});

export const { addNotification, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
