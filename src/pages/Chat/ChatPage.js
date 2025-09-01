import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer
} from '@mui/material';
import {
  Send,
  Message,
  Person,
  MoreVert,
  Group,
  Assignment
} from '@mui/icons-material';
import { sendMessage, setCurrentConversation, markConversationAsRead, setTypingUser } from '../../store/slices/chatSlice';
import { formatDistanceToNow } from 'date-fns';
import ConversationList from '../../components/Chat/ConversationList';

const ChatPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useSelector((state) => state.auth);
  const { conversations, currentConversation, messages, typingUsers } = useSelector((state) => state.chat);
  const { teams } = useSelector((state) => state.teams);
  const { projects } = useSelector((state) => state.projects);
  
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState(0); // 0 for conversations, 1 for messages
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentConversation) {
      dispatch(markConversationAsRead(currentConversation.id));
    }
  }, [currentConversation, dispatch]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentConversation) return;
    
    try {
      await dispatch(sendMessage({
        text: messageText,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        teamId: currentConversation.teamId,
        projectId: currentConversation.projectId
      })).unwrap();
      
      setMessageText('');
      setTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    if (!typing) {
      setTyping(true);
      // Simulate typing indicator
      dispatch(setTypingUser({
        userId: user.id,
        conversationId: currentConversation?.id,
        isTyping: true
      }));
    }
    
    // Clear typing indicator after 2 seconds of no typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      dispatch(setTypingUser({
        userId: user.id,
        conversationId: currentConversation?.id,
        isTyping: false
      }));
    }, 2000);
  };

  const handleConversationSelect = (conversation) => {
    dispatch(setCurrentConversation(conversation));
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
    // Clear message search when selecting a conversation
    setMessageSearchQuery('');
  };

  const getConversationName = (conversation) => {
    if (conversation.type === 'team') {
      const team = teams.find(t => t.id === conversation.teamId);
      return team ? `${team.name} Chat` : 'Team Chat';
    } else {
      const project = projects.find(p => p.id === conversation.projectId);
      return project ? project.name : 'Project Chat';
    }
  };

  const getConversationIcon = (conversation) => {
    return conversation.type === 'team' ? <Group /> : <Assignment />;
  };

  // Clear search queries with useCallback to prevent re-renders
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setMessageSearchQuery('');
  }, []);

  // Debounced search queries for better performance
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [debouncedMessageSearchQuery, setDebouncedMessageSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMessageSearchQuery(messageSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [messageSearchQuery]);

  // Enhanced conversation filtering with debounced search
  const filteredConversations = conversations.filter(conversation => {
    if (!debouncedSearchQuery.trim()) return true;
    
    const name = getConversationName(conversation);
    const lastMessage = conversation.lastMessage?.text || '';
    
    return name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
           lastMessage.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
  });

  // Message filtering with debounced search functionality
  const filteredMessages = messages.filter(message => {
    if (!currentConversation) return false;
    
    // First filter by conversation
    let matchesConversation = false;
    if (currentConversation.type === 'team') {
      matchesConversation = message.teamId === currentConversation.teamId && !message.projectId;
    } else {
      matchesConversation = message.teamId === currentConversation.teamId && message.projectId === currentConversation.projectId;
    }
    
    if (!matchesConversation) return false;
    
    // Then filter by debounced search query if exists
    if (debouncedMessageSearchQuery.trim()) {
      return message.text.toLowerCase().includes(debouncedMessageSearchQuery.toLowerCase()) ||
             message.userName.toLowerCase().includes(debouncedMessageSearchQuery.toLowerCase());
    }
    
    return true;
  });

  // Highlight search terms in text using debounced queries
  const highlightText = (text, searchQuery) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
          {part}
        </span>
      ) : part
    );
  };

  const ChatArea = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {currentConversation ? (
        <>
          {/* Chat Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">
                  {getConversationName(currentConversation)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {currentConversation.type === 'team' ? 'Team Chat' : 'Project Chat'}
                </Typography>
              </Box>
              {isMobile && (
                <IconButton onClick={() => setMobileDrawerOpen(true)}>
                  <MoreVert />
                </IconButton>
              )}
            </Box>
          </Box>
          
          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message, index) => (
                <Box
                  key={message.id}
                  id={`message-${message.id}`}
                  sx={{
                    display: 'flex',
                    justifyContent: message.userId === user.id ? 'flex-end' : 'flex-start',
                    mb: 2,
                    // Highlight message if it matches search
                    backgroundColor: debouncedMessageSearchQuery && 
                      (message.text.toLowerCase().includes(debouncedMessageSearchQuery.toLowerCase()) ||
                       message.userName.toLowerCase().includes(debouncedMessageSearchQuery.toLowerCase())) 
                      ? 'rgba(255, 255, 0, 0.1)' 
                      : 'transparent',
                    borderRadius: 1,
                    p: debouncedMessageSearchQuery && 
                      (message.text.toLowerCase().includes(debouncedMessageSearchQuery.toLowerCase()) ||
                       message.userName.toLowerCase().includes(debouncedMessageSearchQuery.toLowerCase())) 
                      ? 1 
                      : 0
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: message.userId === user.id ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        order: message.userId === user.id ? 1 : 0
                      }}
                    >
                      {message.userAvatar ? (
                        <img src={message.userAvatar} alt={message.userName} />
                      ) : (
                        <Person />
                      )}
                    </Avatar>
                    
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: message.userId === user.id ? 'primary.main' : 'background.paper',
                        color: message.userId === user.id ? 'white' : 'text.primary',
                        borderRadius: 2,
                        maxWidth: '100%'
                      }}
                    >
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {debouncedMessageSearchQuery ? highlightText(message.text, debouncedMessageSearchQuery) : message.text}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          textAlign: message.userId === user.id ? 'right' : 'left'
                        }}
                      >
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Message sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {debouncedMessageSearchQuery ? 'No messages found' : 'No messages yet'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {debouncedMessageSearchQuery ? 'Try adjusting your search terms' : 'Start the conversation by sending a message!'}
                </Typography>
              </Box>
            )}
            
            {/* Typing indicator */}
            {typingUsers[currentConversation.id]?.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1, mb: 2 }}>
                <Avatar sx={{ width: 24, height: 24 }}>
                  <Person />
                </Avatar>
                <Typography variant="body2" color="textSecondary">
                  Someone is typing...
                </Typography>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message..."
                value={messageText}
                onChange={handleTyping}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <Send />
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Message sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Select a conversation
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Choose a team or project chat to start messaging
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex' }}>
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <Paper
            elevation={2}
            sx={{
              width: 320,
              height: '100%',
              borderRight: 1,
              borderColor: 'divider'
            }}
          >
            <ConversationList
              searchTab={searchTab}
              searchQuery={searchQuery}
              messageSearchQuery={messageSearchQuery}
              setSearchTab={setSearchTab}
              setSearchQuery={setSearchQuery}
              setMessageSearchQuery={setMessageSearchQuery}
              debouncedSearchQuery={debouncedSearchQuery}
              debouncedMessageSearchQuery={debouncedMessageSearchQuery}
              filteredConversations={filteredConversations}
              filteredMessages={filteredMessages}
              currentConversation={currentConversation}
              handleConversationSelect={handleConversationSelect}
              getConversationName={getConversationName}
              getConversationIcon={getConversationIcon}
              highlightText={highlightText}
            />
          </Paper>
          
          <Box sx={{ flex: 1, height: '100%' }}>
            <ChatArea />
          </Box>
        </>
      )}
      
      {/* Mobile Layout */}
      {isMobile && (
        <>
          <Box sx={{ flex: 1, height: '100%' }}>
            <ChatArea />
          </Box>
          
          <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: 320
              }
            }}
          >
            <ConversationList
              searchTab={searchTab}
              searchQuery={searchQuery}
              messageSearchQuery={messageSearchQuery}
              setSearchTab={setSearchTab}
              setSearchQuery={setSearchQuery}
              setMessageSearchQuery={setMessageSearchQuery}
              debouncedSearchQuery={debouncedSearchQuery}
              debouncedMessageSearchQuery={debouncedMessageSearchQuery}
              filteredConversations={filteredConversations}
              filteredMessages={filteredMessages}
              currentConversation={currentConversation}
              handleConversationSelect={handleConversationSelect}
              getConversationName={getConversationName}
              getConversationIcon={getConversationIcon}
              highlightText={highlightText}
            />
          </Drawer>
        </>
      )}
    </Box>
  );
};

export default ChatPage;
