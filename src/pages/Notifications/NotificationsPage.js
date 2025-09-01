import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  Paper,
  Badge
} from '@mui/material';
import {
  Notifications,
  Assignment,
  Message,
  Group,
  Delete,
  CheckCircle
} from '@mui/icons-material';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead(user.id));
  };

  const handleDeleteNotification = (notificationId) => {
    dispatch(deleteNotification(notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <Assignment color="primary" />;
      case 'task_status_changed':
        return <Assignment color="info" />;
      case 'new_message':
        return <Message color="success" />;
      case 'team_invite':
        return <Group color="warning" />;
      default:
        return <Notifications color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_assigned':
        return 'primary';
      case 'task_status_changed':
        return 'info';
      case 'new_message':
        return 'success';
      case 'team_invite':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'task_assigned':
        return 'Task Assigned';
      case 'task_status_changed':
        return 'Task Status Updated';
      case 'new_message':
        return 'New Message';
      case 'team_invite':
        return 'Team Invitation';
      default:
        return 'Notification';
    }
  };

  if (notifications.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No notifications yet
        </Typography>
        <Typography variant="body2" color="textSecondary">
          You'll see notifications here when there are updates to your tasks, teams, or messages.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Notifications
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<CheckCircle />}
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      <Paper elevation={2}>
        <List>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemAvatar>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={notification.read}
                  >
                    <Avatar sx={{ bgcolor: 'background.paper' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: notification.read ? 'normal' : 'bold',
                          color: notification.read ? 'text.primary' : 'text.primary'
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={getNotificationTitle(notification.type)}
                        color={getNotificationColor(notification.type)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!notification.read && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
