import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockTeams = [
  {
    id: '1',
    name: 'Development Team',
    description: 'Main development team for web applications',
    createdAt: new Date().toISOString(),
    createdBy: '1',
    members: [
      { id: '1', role: 'admin', joinedAt: new Date().toISOString() },
      { id: '2', role: 'member', joinedAt: new Date().toISOString() }
    ]
  },
  {
    id: '2',
    name: 'Design Team',
    description: 'UI/UX design and creative team',
    createdAt: new Date().toISOString(),
    createdBy: '1',
    members: [
      { id: '1', role: 'admin', joinedAt: new Date().toISOString() }
    ]
  }
];

// Mock API functions
const mockCreateTeam = async (teamData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newTeam = {
    id: uuidv4(),
    ...teamData,
    createdAt: new Date().toISOString(),
    members: [{ id: teamData.createdBy, role: 'admin', joinedAt: new Date().toISOString() }]
  };
  
  return newTeam;
};

const mockInviteMember = async (teamId, memberData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: uuidv4(),
    ...memberData,
    teamId,
    invitedAt: new Date().toISOString(),
    status: 'pending'
  };
};

// Async thunks
export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await mockCreateTeam(teamData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const inviteMember = createAsyncThunk(
  'teams/inviteMember',
  async ({ teamId, memberData }, { rejectWithValue }) => {
    try {
      const response = await mockInviteMember(teamId, memberData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'teams/updateMemberRole',
  async ({ teamId, memberId, newRole }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { teamId, memberId, newRole };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeMember = createAsyncThunk(
  'teams/removeMember',
  async ({ teamId, memberId }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { teamId, memberId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  teams: mockTeams,
  currentTeam: null,
  loading: false,
  error: null,
  invitations: []
};

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addInvitation: (state, action) => {
      state.invitations.push(action.payload);
    },
    removeInvitation: (state, action) => {
      state.invitations = state.invitations.filter(inv => inv.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
        state.error = null;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Invite member
      .addCase(inviteMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.loading = false;
        state.invitations.push(action.payload);
        state.error = null;
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update member role
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const { teamId, memberId, newRole } = action.payload;
        const team = state.teams.find(t => t.id === teamId);
        if (team) {
          const member = team.members.find(m => m.id === memberId);
          if (member) {
            member.role = newRole;
          }
        }
      })
      // Remove member
      .addCase(removeMember.fulfilled, (state, action) => {
        const { teamId, memberId } = action.payload;
        const team = state.teams.find(t => t.id === teamId);
        if (team) {
          team.members = team.members.filter(m => m.id !== memberId);
        }
      });
  },
});

export const { setCurrentTeam, clearError, addInvitation, removeInvitation } = teamSlice.actions;
export default teamSlice.reducer;
