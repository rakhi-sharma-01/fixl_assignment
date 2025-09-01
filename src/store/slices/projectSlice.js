import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockProjects = [
  {
    id: '1',
    name: 'E-commerce Website',
    description: 'Build a modern e-commerce platform',
    teamId: '1',
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: '1',
    members: ['1', '2'],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Mobile App Design',
    description: 'Design UI/UX for mobile application',
    teamId: '2',
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: '1',
    members: ['1'],
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock API functions
const mockCreateProject = async (projectData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newProject = {
    id: uuidv4(),
    ...projectData,
    createdAt: new Date().toISOString(),
    status: 'active',
    members: [projectData.createdBy]
  };
  
  return newProject;
};

const mockUpdateProject = async (projectId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { id: projectId, ...updates };
};

const mockDeleteProject = async (projectId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return projectId;
};

// Async thunks
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await mockCreateProject(projectData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, updates }, { rejectWithValue }) => {
    try {
      const response = await mockUpdateProject(projectId, updates);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await mockDeleteProject(projectId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProjectMember = createAsyncThunk(
  'projects/addProjectMember',
  async ({ projectId, memberId }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { projectId, memberId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeProjectMember = createAsyncThunk(
  'projects/removeProjectMember',
  async ({ projectId, memberId }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { projectId, memberId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  projects: mockProjects,
  currentProject: null,
  loading: false,
  error: null
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload;
        const projectIndex = state.projects.findIndex(p => p.id === id);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = { ...state.projects[projectIndex], ...updates };
        }
      })
      // Delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      // Add project member
      .addCase(addProjectMember.fulfilled, (state, action) => {
        const { projectId, memberId } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project && !project.members.includes(memberId)) {
          project.members.push(memberId);
        }
      })
      // Remove project member
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        const { projectId, memberId } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.members = project.members.filter(m => m !== memberId);
        }
      });
  },
});

export const { setCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;
