import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  Notifications,
  Security,
  Palette,
  Language,
  Storage,
  Delete,
  Save
} from '@mui/icons-material';
import { toggleTheme } from '../../store/slices/uiSlice';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    soundNotifications: true,
    autoSave: true,
    language: 'en',
    timezone: 'UTC'
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');


  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked !== undefined ? event.target.checked : event.target.value
    }));
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log('Settings saved:', settings);
    handleCloseDialog();
  };

  const handleDeleteAccount = () => {
    // In a real app, this would delete the account
    console.log('Account deletion requested');
    handleCloseDialog();
  };

  const notificationSettings = [
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <Notifications color="primary" />
    },
    {
      key: 'pushNotifications',
      label: 'Push Notifications',
      description: 'Receive push notifications in browser',
      icon: <Notifications color="secondary" />
    },
    {
      key: 'soundNotifications',
      label: 'Sound Notifications',
      description: 'Play sounds for notifications',
      icon: <Notifications color="info" />
    }
  ];

  const generalSettings = [
    {
      key: 'autoSave',
      label: 'Auto Save',
      description: 'Automatically save changes',
      icon: <Storage color="primary" />
    }
  ];

  const appearanceSettings = [
    {
      key: 'theme',
      label: 'Dark Mode',
      description: 'Use dark theme',
      icon: <Palette color="primary" />,
      customControl: (
        <Switch
          checked={theme === 'dark'}
          onChange={handleThemeToggle}
          color="primary"
        />
      )
    }
  ];

  const renderSettingItem = (setting) => (
    <ListItem key={setting.key}>
      <ListItemIcon>
        {setting.icon}
      </ListItemIcon>
      <ListItemText
        primary={setting.label}
        secondary={setting.description}
      />
      <ListItemSecondaryAction>
        {setting.customControl || (
          <Switch
            checked={settings[setting.key]}
            onChange={handleSettingChange(setting.key)}
            color="primary"
          />
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <List>
              {notificationSettings.map(renderSettingItem)}
            </List>
          </Paper>
        </Grid>

        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              General
            </Typography>
            <List>
              {generalSettings.map(renderSettingItem)}
            </List>
          </Paper>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <List>
              {appearanceSettings.map(renderSettingItem)}
            </List>
          </Paper>
        </Grid>

        {/* Account Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Security color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Change Password"
                  secondary="Update your account password"
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenDialog('password')}
                  >
                    Change
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Language color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Language"
                  secondary="Select your preferred language"
                />
                <ListItemSecondaryAction>
                  <TextField
                    select
                    size="small"
                    value={settings.language}
                    onChange={handleSettingChange('language')}
                    sx={{ minWidth: 120 }}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </TextField>
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Storage color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Timezone"
                  secondary="Set your local timezone"
                />
                <ListItemSecondaryAction>
                  <TextField
                    select
                    size="small"
                    value={settings.timezone}
                    onChange={handleSettingChange('timezone')}
                    sx={{ minWidth: 120 }}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="GMT">GMT</option>
                  </TextField>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, border: '1px solid #f44336' }}>
            <Typography variant="h6" color="error" gutterBottom>
              Danger Zone
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              These actions cannot be undone. Please proceed with caution.
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => handleOpenDialog('deleteAccount')}
              >
                Delete Account
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
                startIcon={<Storage />}
                onClick={() => handleOpenDialog('exportData')}
              >
                Export Data
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'password' && 'Change Password'}
          {dialogType === 'deleteAccount' && 'Delete Account'}
          {dialogType === 'exportData' && 'Export Data'}
        </DialogTitle>
        
        <DialogContent>
          {dialogType === 'password' && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                margin="normal"
                required
              />
            </Box>
          )}
          
          {dialogType === 'deleteAccount' && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                This action will permanently delete your account and all associated data.
              </Alert>
              <TextField
                fullWidth
                label="Type 'DELETE' to confirm"
                placeholder="DELETE"
                margin="normal"
                required
              />
            </Box>
          )}
          
          {dialogType === 'exportData' && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Export your data including:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Profile information" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Team memberships" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Project data" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Task history" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Chat messages" />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            onClick={dialogType === 'deleteAccount' ? handleDeleteAccount : handleSaveSettings}
            variant="contained"
            color={dialogType === 'deleteAccount' ? 'error' : 'primary'}
            startIcon={dialogType === 'deleteAccount' ? <Delete /> : <Save />}
          >
            {dialogType === 'deleteAccount' ? 'Delete Account' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
