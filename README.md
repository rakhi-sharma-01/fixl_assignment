# Team Collaboration Platform

A modern team collaboration platform built with React, featuring project management, real-time chat, and task tracking capabilities.

## Features

### 🚀 **Project Management**
- Create and manage multiple projects
- Team collaboration and member management
- Project progress tracking and analytics

### 💬 **Real-time Chat**
- Team and project-specific conversations
- Message search and filtering
- User typing indicators
- Conversation management

### 📋 **Task Management (Kanban Board)**
- Drag and drop task organization
- Status-based task categorization (To Do, In Progress, Done)
- Priority levels and assignee management
- Due date tracking and notifications

### 👥 **Team Management**
- User roles and permissions (Admin/Member)
- Team creation and member invitations
- User profile management

### 📊 **Dashboard & Analytics**
- Project overview and statistics
- Task completion metrics
- Team performance insights

## Tech Stack

- **Frontend**: React 18
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Drag & Drop**: React Beautiful DnD
- **Styling**: Emotion, MUI System
- **Date Handling**: date-fns
- **Build Tool**: Create React App

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd team-collaboration-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Loading, Error, etc.)
│   ├── Dashboard/      # Dashboard-specific components
│   ├── Kanban/         # Kanban board components
│   ├── Chat/           # Chat interface components
│   └── Profile/        # User profile components
├── pages/              # Main page components
│   ├── Dashboard/      # Dashboard page
│   ├── Kanban/         # Kanban board page
│   ├── Chat/           # Chat page
│   ├── Profile/        # Profile page
│   └── Settings/       # Settings page
├── store/              # Redux store configuration
│   └── slices/         # Redux slices for state management
├── utils/              # Utility functions and helpers
└── App.js              # Main application component
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Features in Detail

### Authentication
- User registration and login
- JWT token-based authentication
- Role-based access control

### Project Management
- Create, edit, and delete projects
- Assign team members
- Track project progress

### Kanban Board
- Visual task management
- Drag and drop functionality
- Status-based organization
- Priority and assignee management

### Real-time Chat
- Multiple conversation types
- Message search and filtering
- User presence indicators

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

