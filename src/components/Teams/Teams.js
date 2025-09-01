import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  Group,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';
import { createTeam, inviteMember, updateMemberRole, removeMember } from '../../store/slices/teamSlice';

const Teams = () => {
  const dispatch = useDispatch();
  const { user, isAdmin } = useSelector((state) => state.auth);
  const { teams, loading } = useSelector((state) => state.teams);
  
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member'
  });

  const handleCreateTeam = async () => {
    try {
      await dispatch(createTeam({
        ...formData,
        createdBy: user.id
      })).unwrap();
      
      setCreateTeamOpen(false);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const handleInviteMember = async () => {
    try {
      await dispatch(inviteMember({
        teamId: selectedTeam.id,
        memberData: inviteData
      })).unwrap();
      
      setInviteMemberOpen(false);
      setInviteData({ email: '', role: 'member' });
      setSelectedTeam(null);
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleUpdateMemberRole = async (teamId, memberId, newRole) => {
    try {
      await dispatch(updateMemberRole({ teamId, memberId, newRole })).unwrap();
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    try {
      await dispatch(removeMember({ teamId, memberId })).unwrap();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'member': return 'primary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'member': return <Person />;
      default: return <Person />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Teams</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateTeamOpen(true)}
          >
            Create Team
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {team.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {team.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${team.members.length} members`}
                    size="small"
                    icon={<Group />}
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Created {new Date(team.createdAt).toLocaleDateString()}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Team Members:
                </Typography>
                
                <List dense>
                  {team.members.map((member) => (
                    <ListItem key={member.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`User ${member.id}`}
                        secondary={
                          <Chip
                            label={member.role}
                            color={getRoleColor(member.role)}
                            size="small"
                            icon={getRoleIcon(member.role)}
                          />
                        }
                      />
                      {isAdmin && member.role !== 'admin' && (
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateMemberRole(team.id, member.id, 'admin')}
                          >
                            <AdminPanelSettings />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveMember(team.id, member.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              
              <CardActions>
                {isAdmin && (
                  <Button
                    size="small"
                    startIcon={<PersonAdd />}
                    onClick={() => {
                      setSelectedTeam(team);
                      setInviteMemberOpen(true);
                    }}
                  >
                    Invite Member
                  </Button>
                )}
                <Button size="small" color="primary">
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Team Dialog */}
      <Dialog open={createTeamOpen} onClose={() => setCreateTeamOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTeamOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Create Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteMemberOpen} onClose={() => setInviteMemberOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Member to {selectedTeam?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteData.email}
            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={inviteData.role}
              label="Role"
              onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
            >
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteMemberOpen(false)}>Cancel</Button>
          <Button onClick={handleInviteMember} variant="contained">
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {isAdmin && (
        <Tooltip title="Create Team">
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16, display: { md: 'none' } }}
            onClick={() => setCreateTeamOpen(true)}
          >
            <Add />
          </Fab>
        </Tooltip>
      )}
    </Box>
  );
};

export default Teams;
