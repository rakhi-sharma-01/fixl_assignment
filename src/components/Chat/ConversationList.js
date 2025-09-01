import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Badge,
  Tabs,
  Tab,
  InputAdornment
} from '@mui/material';
import {
  Search,
  Clear,
  Person
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({
  searchTab,
  searchQuery,
  messageSearchQuery,
  setSearchTab,
  setSearchQuery,
  setMessageSearchQuery,
  debouncedSearchQuery,
  debouncedMessageSearchQuery,
  filteredConversations,
  filteredMessages,
  currentConversation,
  handleConversationSelect,
  getConversationName,
  getConversationIcon,
  highlightText
}) => {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" gutterBottom>
          Conversations
        </Typography>

        {/* Search Tabs */}
        <Tabs
          value={searchTab}
          onChange={(e, newValue) => setSearchTab(newValue)}
          sx={{ mb: 2 }}
          size="small"
        >
          <Tab label="Conversations" />
          <Tab label="Messages" />
        </Tabs>

        {/* Simple, Stable Search Input */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={searchTab === 0 ? searchQuery : messageSearchQuery}
          onChange={(e) => {
            const value = e.target.value;
            if (searchTab === 0) {
              setSearchQuery(value);
            } else {
              setMessageSearchQuery(value);
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Clear button */}
        {(searchTab === 0 ? searchQuery : messageSearchQuery) && (
          <Button
            size="small"
            onClick={() => {
              setSearchQuery("");
              setMessageSearchQuery("");
            }}
            startIcon={<Clear />}
            sx={{ mb: 2 }}
          >
            Clear
          </Button>
        )}
      </Box>

      <List sx={{ flex: 1, overflow: "auto" }}>
        {searchTab === 0 ? (
          // Show conversations
          filteredConversations.map((conversation) => (
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
                  <Avatar sx={{ bgcolor: "primary.main" }}>
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
                        {debouncedSearchQuery
                          ? highlightText(
                              conversation.lastMessage.text,
                              debouncedSearchQuery
                            )
                          : conversation.lastMessage.text}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDistanceToNow(
                          new Date(conversation.lastMessage.createdAt),
                          { addSuffix: true }
                        )}
                      </Typography>
                    </Box>
                  ) : (
                    "No messages yet"
                  )
                }
              />
            </ListItem>
          ))
        ) : // Show search results from current conversation
        currentConversation ? (
          filteredMessages.map((message) => (
            <ListItem
              key={message.id}
              button
              onClick={() => {
                // Scroll to message in chat area
                const messageElement = document.getElementById(
                  `message-${message.id}`
                );
                if (messageElement) {
                  messageElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }}
              sx={{ px: 2 }}
            >
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {message.userAvatar ? (
                    <img src={message.userAvatar} alt={message.userName} />
                  ) : (
                    <Person />
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={message.userName}
                secondary={
                  <Box>
                    <Typography variant="body2" noWrap>
                      {highlightText(message.text, debouncedMessageSearchQuery)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Select a conversation to search messages
            </Typography>
          </Box>
        )}

        {/* No results message */}
        {searchTab === 0 &&
          debouncedSearchQuery &&
          filteredConversations.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="textSecondary">
                No conversations found
              </Typography>
            </Box>
          )}

        {searchTab === 1 &&
          debouncedMessageSearchQuery &&
          filteredMessages.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="textSecondary">
                No messages found
              </Typography>
            </Box>
          )}
      </List>
    </Box>
  );
};

export default ConversationList;
