import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  Badge,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Send,
  Message,
  Group,
  Assignment,
  Person,
  Search,
  MoreVert
} from '@mui/icons-material';
import { sendMessage, setCurrentConversation, markConversationAsRead } from '../../store/slices/chatSlice';
import { formatDistanceToNow } from 'date-fns';

const Chat = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useSelector((state) => state.auth);
  const { conversations, currentConversation, messages, typingUsers } = useSelector((state) => state.chat);
  const { teams } = useSelector((state) => state.teams);
  const { projects } = useSelector((state) => state.projects);
  
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredConversations = conversations.filter(conversation => {
    const name = getConversationName(conversation);
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredMessages = messages.filter(message => {
    if (!currentConversation) return false;
    
    if (currentConversation.type === 'team') {
      return message.teamId === currentConversation.teamId && !message.projectId;
    } else {
      return message.teamId === currentConversation.teamId && message.projectId === currentConversation.projectId;
    }
  });

  const ConversationList = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Conversations
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>
      
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {filteredConversations.map((conversation) => (
          <ListItem
            key={conversation.id}
            button
            selected={currentConversation?.id === conversation.id}
            onClick={() => handleConversationSelect(conversation)}
            sx={{ px: 2 }}
          >
            <ListItemAvatar>
              <Badge
                badgeContent={conversation.unreadCount}
                color="error"
                invisible={conversation.unreadCount === 0}
              >
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getConversationIcon(conversation)}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={getConversationName(conversation)}
              secondary={
                conversation.lastMessage ? (
                  <Box>
                    <Typography variant="body2" noWrap>
                      {conversation.lastMessage.text}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                ) : (
                  'No messages yet'
                )
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

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
                  sx={{
                    display: 'flex',
                    justifyContent: message.userId === user.id ? 'flex-end' : 'flex-start',
                    mb: 2
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
                        {message.text}
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
                  No messages yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Start the conversation by sending a message!
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
            <ConversationList />
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
            <ConversationList />
          </Drawer>
        </>
      )}
    </Box>
  );
};

export default Chat;
