import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API functions
const mockLogin = async (credentials) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
    return {
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        avatar: 'https://via.placeholder.com/40'
      },
      token: 'mock-jwt-token-admin'
    };
  } else if (credentials.email === 'member@example.com' && credentials.password === 'member123') {
    return {
      user: {
        id: '2',
        email: 'member@example.com',
        name: 'Team Member',
        role: 'member',
        avatar: 'https://via.placeholder.com/40'
      },
      token: 'mock-jwt-token-member'
    };
  }
  
  throw new Error('Invalid credentials');
};

const mockSignup = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    user: {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: 'member',
      avatar: 'https://via.placeholder.com/40'
    },
    token: 'mock-jwt-token-new-user'
  };
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await mockLogin(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await mockSignup(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      return {
        user: JSON.parse(user),
        token
      };
    }
    
    throw new Error('No valid session');
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isAdmin: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAdmin = action.payload.user.role === 'admin';
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAdmin = action.payload.user.role === 'admin';
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.error = null;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAdmin = action.payload.user.role === 'admin';
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
