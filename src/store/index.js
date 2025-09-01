import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import teamReducer from './slices/teamSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    teams: teamReducer,
    projects: projectReducer,
    tasks: taskReducer,
    chat: chatReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
