import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useThemeMode } from '../../contexts/ThemeContext.jsx';
import logo from '../../assests/images/logo.png';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  AccountCircle, 
  Brightness4, 
  Brightness7,
  Menu as MenuIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { useState } from 'react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useThemeMode();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Enhanced logo component with better dark mode styling
  const LogoComponent = ({ isCentered = false }) => (
    <Link 
      to="/" 
      style={{ 
        color: 'inherit', 
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCentered ? 'center' : 'flex-start'
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="Quizzy Logo"
        sx={{
          height: { xs: 45, sm: 55, md: 60 },
          width: 'auto',
          maxWidth: { xs: 150, sm: 180, md: 200 },
          verticalAlign: 'middle',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          // Enhanced dark mode styling
          filter: mode === 'dark' 
            ? 'brightness(1.3) contrast(1.4) saturate(1.1) drop-shadow(0 0 20px rgba(59, 130, 246, 0.4)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.2))' 
            : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.12))',
          // Better visibility in dark mode
          ...(mode === 'dark' && {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            borderRadius: '12px',
            padding: '8px 12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }),
          '&:hover': {
            transform: 'scale(1.08) translateY(-2px)',
            filter: mode === 'dark' 
              ? 'brightness(1.5) contrast(1.5) saturate(1.2) drop-shadow(0 0 30px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 60px rgba(59, 130, 246, 0.3))' 
              : 'drop-shadow(0 6px 20px rgba(0, 0, 0, 0.2))',
            ...(mode === 'dark' && {
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
              borderColor: 'rgba(59, 130, 246, 0.4)',
            })
          }
        }}
      />
    </Link>
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: mode === 'dark' 
          ? 'rgba(17, 25, 40, 0.95)' 
          : 'background.paper',
        borderBottom: mode === 'dark' 
          ? '1px solid rgba(59, 130, 246, 0.2)' 
          : '1px solid',
        borderBottomColor: mode === 'dark' 
          ? 'rgba(59, 130, 246, 0.2)' 
          : 'divider',
        zIndex: 1,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        // Enhanced dark mode backdrop
        ...(mode === 'dark' && {
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(17, 25, 40, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(59, 130, 246, 0.2)',
        })
      }}
    >
      <Toolbar sx={{ 
        minHeight: { xs: 60, sm: 68 },
        px: { xs: 2, sm: 3 }
      }}>
        {/* Mobile hamburger menu */}
        {user && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => {
              onMenuClick && onMenuClick();
            }}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid transparent',
              borderRadius: '12px',
              padding: '10px',
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(0, 0, 0, 0.04)',
                borderColor: mode === 'dark' 
                  ? 'rgba(59, 130, 246, 0.3)' 
                  : 'rgba(0, 0, 0, 0.12)',
                transform: 'scale(1.1) rotate(90deg)',
                boxShadow: mode === 'dark' 
                  ? '0 0 20px rgba(59, 130, 246, 0.3)' 
                  : 'none'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Left side logo for non-authenticated users */}
        {!user && (
          <Typography variant="h6" component="div" sx={{ 
            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary', 
            mr: 2 
          }}>
            <LogoComponent />
          </Typography>
        )}

        {/* Centered Logo for authenticated users */}
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            justifyContent: user ? 'center' : 'flex-end',
            alignItems: 'center',
            fontWeight: 'bold'
          }}
        >
          <LogoComponent isCentered={user} />
        </Typography>

        {/* Right side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Enhanced theme toggle button */}
          <IconButton 
            onClick={() => {
              toggleColorMode();
            }}
            sx={{ 
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid transparent',
              borderRadius: '12px',
              padding: '10px',
              position: 'relative',
              overflow: 'hidden',
              '&:before': mode === 'dark' ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                borderRadius: '12px',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                zIndex: -1,
              } : {},
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(0, 0, 0, 0.04)',
                borderColor: mode === 'dark' 
                  ? 'rgba(59, 130, 246, 0.4)' 
                  : 'rgba(0, 0, 0, 0.12)',
                transform: 'rotate(180deg) scale(1.15)',
                boxShadow: mode === 'dark' 
                  ? '0 0 25px rgba(59, 130, 246, 0.4), 0 0 50px rgba(147, 51, 234, 0.2)' 
                  : 'none',
                '&:before': mode === 'dark' ? {
                  opacity: 1,
                } : {}
              }
            }}
            title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          
          {user ? (
            <>
              {/* Enhanced user account menu */}
              <IconButton 
                sx={{ 
                  color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid transparent',
                  borderRadius: '12px',
                  padding: '10px',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: mode === 'dark' 
                      ? 'rgba(59, 130, 246, 0.15)' 
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: mode === 'dark' 
                      ? 'rgba(59, 130, 246, 0.3)' 
                      : 'rgba(0, 0, 0, 0.12)',
                    transform: 'scale(1.1)',
                    boxShadow: mode === 'dark' 
                      ? '0 0 20px rgba(59, 130, 246, 0.3)' 
                      : 'none'
                  }
                }}
                onClick={handleMenuClick}
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <AccountCircle />
              </IconButton>

              {/* Enhanced dropdown menu */}
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'user-button',
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: mode === 'dark' 
                      ? 'rgba(17, 25, 40, 0.95)' 
                      : 'background.paper',
                    border: mode === 'dark' 
                      ? '1px solid rgba(59, 130, 246, 0.3)' 
                      : '1px solid',
                    borderColor: mode === 'dark' 
                      ? 'rgba(59, 130, 246, 0.3)' 
                      : 'divider',
                    borderRadius: '16px',
                    boxShadow: mode === 'dark' 
                      ? '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.2)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.12)',
                    backdropFilter: mode === 'dark' ? 'blur(20px) saturate(180%)' : 'none',
                    WebkitBackdropFilter: mode === 'dark' ? 'blur(20px) saturate(180%)' : 'none',
                    minWidth: '180px',
                    mt: 1,
                    ...(mode === 'dark' && {
                      background: 'linear-gradient(135deg, rgba(17, 25, 40, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
                    })
                  }
                }}
              >
                <MenuItem 
                  onClick={handleProfileClick}
                  sx={{
                    borderRadius: '12px',
                    mx: 1.5,
                    my: 1,
                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: mode === 'dark' 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : 'rgba(0, 0, 0, 0.04)',
                      transform: 'translateX(8px)',
                      boxShadow: mode === 'dark' 
                        ? '0 0 15px rgba(59, 130, 246, 0.2)' 
                        : 'none'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: mode === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'inherit' 
                  }}>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '12px',
                    mx: 1.5,
                    my: 1,
                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: mode === 'dark' 
                        ? 'rgba(239, 68, 68, 0.15)' 
                        : 'rgba(239, 68, 68, 0.04)',
                      transform: 'translateX(8px)',
                      boxShadow: mode === 'dark' 
                        ? '0 0 15px rgba(239, 68, 68, 0.2)' 
                        : 'none',
                      color: mode === 'dark' ? 'rgba(248, 113, 113, 1)' : 'rgba(239, 68, 68, 1)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: mode === 'dark' ? 'rgba(248, 113, 113, 0.8)' : 'rgba(239, 68, 68, 0.7)' 
                  }}>
                    <ExitToAppIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* Enhanced Login/Register buttons */
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1.5 }}>
              <Button 
                sx={{ 
                  color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: mode === 'dark' 
                    ? '1px solid rgba(59, 130, 246, 0.3)' 
                    : '1px solid transparent',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundColor: mode === 'dark' 
                      ? 'rgba(59, 130, 246, 0.15)' 
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: mode === 'dark' 
                      ? 'rgba(59, 130, 246, 0.5)' 
                      : 'rgba(0, 0, 0, 0.12)',
                    transform: 'translateY(-2px)',
                    boxShadow: mode === 'dark' 
                      ? '0 10px 30px rgba(59, 130, 246, 0.2)' 
                      : '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }} 
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                sx={{ 
                  color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: mode === 'dark' 
                    ? '1px solid rgba(147, 51, 234, 0.3)' 
                    : '1px solid transparent',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  background: mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)' 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: mode === 'dark' 
                      ? 'rgba(147, 51, 234, 0.15)' 
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: mode === 'dark' 
                      ? 'rgba(147, 51, 234, 0.5)' 
                      : 'rgba(0, 0, 0, 0.12)',
                    transform: 'translateY(-2px)',
                    boxShadow: mode === 'dark' 
                      ? '0 10px 30px rgba(147, 51, 234, 0.2)' 
                      : '0 4px 12px rgba(0, 0, 0, 0.1)',
                    background: mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)' 
                      : 'rgba(0, 0, 0, 0.04)'
                  }
                }} 
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
