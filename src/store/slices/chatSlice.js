import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockMessages = [
  {
    id: '1',
    text: "Hey team! How's the project going?",
    userId: '1',
    userName: 'Admin User',
    userAvatar: 'https://via.placeholder.com/40',
    teamId: '1',
    projectId: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'text'
  },
  {
    id: '2',
    text: 'Great! I just finished the authentication system',
    userId: '2',
    userName: 'Team Member',
    userAvatar: 'https://via.placeholder.com/40',
    teamId: '1',
    projectId: '1',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    type: 'text'
  },
  {
    id: '3',
    text: 'Awesome! Can you show me the code?',
    userId: '1',
    userName: 'Admin User',
    userAvatar: 'https://via.placeholder.com/40',
    teamId: '1',
    projectId: '1',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'text'
  }
];

const mockConversations = [
  {
    id: '1',
    name: 'Development Team Chat',
    type: 'team',
    teamId: '1',
    projectId: null,
    lastMessage: mockMessages[0],
    unreadCount: 0,
    participants: ['1', '2']
  },
  {
    id: '2',
    name: 'E-commerce Website',
    type: 'project',
    teamId: '1',
    projectId: '1',
    lastMessage: mockMessages[2],
    unreadCount: 1,
    participants: ['1', '2']
  }
];

// Mock API functions
const mockSendMessage = async (messageData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newMessage = {
    id: uuidv4(),
    ...messageData,
    createdAt: new Date().toISOString()
  };
  
  return newMessage;
};

const mockCreateConversation = async (conversationData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newConversation = {
    id: uuidv4(),
    ...conversationData,
    lastMessage: null,
    unreadCount: 0,
    participants: [conversationData.createdBy]
  };
  
  return newConversation;
};

// Async thunks
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await mockSendMessage(messageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (conversationData, { rejectWithValue }) => {
    try {
      const response = await mockCreateConversation(conversationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  messages: mockMessages,
  conversations: mockConversations,
  currentConversation: null,
  typingUsers: {},
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      
      // Update conversation last message
      const conversation = state.conversations.find(c => 
        c.teamId === action.payload.teamId && 
        c.projectId === action.payload.projectId
      );
      
      if (conversation) {
        conversation.lastMessage = action.payload;
        if (conversation.id !== state.currentConversation?.id) {
          conversation.unreadCount += 1;
        }
      }
    },
    setTypingUser: (state, action) => {
      const { userId, conversationId, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId] || [];
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        if (state.typingUsers[conversationId]) {
          state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
        }
      }
    },
    markConversationAsRead: (state, action) => {
      const conversationId = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create conversation
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.push(action.payload);
        state.error = null;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setCurrentConversation, 
  addMessage, 
  setTypingUser, 
  markConversationAsRead, 
  clearError 
} = chatSlice.actions;

export default chatSlice.reducer;
