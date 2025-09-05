import React, { useState, useEffect } from 'react';
import logo from '../../assests/images/logo2.png';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  AccountCircle,
  Quiz as QuizIcon,
  History as HistoryIcon,
  People as PeopleIcon,
  ExitToApp as LogoutIcon,
  FiberNew as NewIcon,
  Dashboard as DashboardIcon,
  Create as CreateIcon,
  ManageAccounts as ManageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import Navbar from './Navbar'; // Import your Navbar component


// API URL configuration for environment support
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};


const API_URL = getApiUrl();


const drawerWidth = 260; // Increased width for better spacing


const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentQuizzes, setRecentQuizzes] = useState([]);


  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  // Fetch recent quizzes from database (only for users)
  useEffect(() => {
    const fetchRecentQuizzes = async () => {
      try {
        const userToken = JSON.parse(localStorage.getItem('quizUser') || '{}');
        const token = userToken.token;
        if (!token) return;


        // Updated API call to use environment variable
        const response = await fetch(`${API_URL}/api/quizzes/public`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });


        if (response.ok) {
          const data = await response.json();
          const last4Quizzes = (data.quizzes || []).slice(-4);
          setRecentQuizzes(last4Quizzes);
        }
      } catch (error) {
        console.error('Error fetching recent quizzes:', error);
        setRecentQuizzes([
          { name: 'Python Basics', topic: 'Programming' },
          { name: 'React Fundamentals', topic: 'Programming' },
          { name: 'JavaScript ES6', topic: 'Programming' },
          { name: 'Node.js Intro', topic: 'Programming' }
        ]);
      }
    };


    if (user?.role === 'user') {
      fetchRecentQuizzes();
    }
  }, [user]);


  // Admin Sidebar Content (keeping original design)
  const AdminSidebar = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      bgcolor: 'background.paper'
    }}>
      {/* Quiz Management Section */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Quiz Management
        </Typography>
        <List dense>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate('/admin?view=create');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>
                <CreateIcon />
              </ListItemIcon>
              <ListItemText primary="Create New Quiz" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate('/admin?view=manage');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>
                <ManageIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Quizzes" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>


      {/* Admin Info Section */}
      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Hello "{user?.username || 'admin'}"
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Administrator
        </Typography>
      </Box>


      {/* Logout Section */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography
          onClick={handleLogout}
          sx={{
            color: 'error.main',
            cursor: 'pointer',
            fontSize: '0.9rem',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          🚪 Log out
        </Typography>
      </Box>
    </Box>
  );


  // Enhanced User Sidebar Content
  const UserSidebar = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      bgcolor: 'background.paper',
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #f8f9ff 0%, #e8f0fe 100%)'
    }}>
      {/* User Profile Section */}
      <Box sx={{
        p: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {user?.username || 'Username'}
            </Typography>
            <Chip
              label="Student"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '0.75rem',
                height: '20px'
              }}
            />
          </Box>
        </Box>
      </Box>


      {/* Newly Added Quiz Section */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NewIcon sx={{ color: '#ff4081', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Latest Quizzes
          </Typography>
        </Box>
        <List dense sx={{ bgcolor: 'background.default', borderRadius: 2, p: 1 }}>
          {recentQuizzes.map((quiz, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate('/user/quiz-detail', { state: { quiz } }); // Pass quiz data
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 35 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#4caf50'
                  }} />
                </ListItemIcon>
                <ListItemText
                  primary={quiz.name || quiz.topic}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    color: 'text.secondary',
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>


      <Divider sx={{ mx: 2 }} />


      {/* Navigation Menu */}
      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{
          fontWeight: 600,
          mb: 2,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 1
        }}>
          Navigation
        </Typography>
        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate('/user/quiz');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(103, 58, 183, 0.1)'
                    : 'rgba(103, 58, 183, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(103, 58, 183, 0.3)'
                    : '0 4px 20px rgba(103, 58, 183, 0.15)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 45 }}>
                <QuizIcon sx={{ color: '#673ab7', fontSize: '1.4rem' }} />
              </ListItemIcon>
              <ListItemText
                primary="Your Quizzes"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>


          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate('/user/history');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 152, 0, 0.1)'
                    : 'rgba(255, 152, 0, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(255, 152, 0, 0.3)'
                    : '0 4px 20px rgba(255, 152, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 45 }}>
                <HistoryIcon sx={{ color: '#ff9800', fontSize: '1.4rem' }} />
              </ListItemIcon>
              <ListItemText
                primary="Quiz History"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>


          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'rgba(76, 175, 80, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(76, 175, 80, 0.3)'
                    : '0 4px 20px rgba(76, 175, 80, 0.15)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 45 }}>
                <PeopleIcon sx={{ color: '#4caf50', fontSize: '1.4rem' }} />
              </ListItemIcon>
              <ListItemText
                primary="Your Friends"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>


      {/* Enhanced Logout Section */}
      <Box sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        background: theme.palette.mode === 'dark'
          ? 'rgba(244, 67, 54, 0.05)'
          : 'rgba(244, 67, 54, 0.02)'
      }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: 'rgba(244, 67, 54, 0.1)',
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 45 }}>
            <LogoutIcon sx={{ color: 'error.main', fontSize: '1.3rem' }} />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{
              color: 'error.main',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );


  const drawer = user?.role === 'admin' ? AdminSidebar : UserSidebar;


  // Return children only if no user (for login/register pages)
  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderBottomColor: 'divider'
          }}
        >
          <Toolbar>
            <Typography
              variant="h4"
              component="div"
              sx={{
                flexGrow: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#ff4081'
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ height: 60, width: 'auto', verticalAlign: 'middle' }}
              />
            </Typography>
            <IconButton onClick={toggleColorMode} sx={{ color: 'text.primary' }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    );
  }


  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            position: 'relative'
          },
        }}
        open
      >
        {drawer}
      </Drawer>


      {/* Main content area */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* USE YOUR NAVBAR COMPONENT INSTEAD OF CUSTOM APPBAR */}
        <Navbar onMenuClick={handleDrawerToggle} />


        {/* Main content */}
        <Box sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto',
          bgcolor: 'background.default'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};


export default Layout;
