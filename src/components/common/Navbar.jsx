import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useThemeMode } from '../../contexts/ThemeContext.jsx';
import logo from '../../assests/images/logo2.png';
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
import { useState, useEffect } from 'react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useThemeMode();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const open = Boolean(anchorEl);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add debugging
  // console.log('Navbar rendered with user:', user);

  const handleLogout = () => {
    // console.log('Logout clicked');
    logout();
    navigate('/login');
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    // console.log('Account circle clicked, opening menu');
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    // console.log('Menu closed');
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    // console.log('Profile clicked - navigating to /profile');
    navigate('/profile');
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="sticky"
      elevation={scrolled ? 4 : 0}
      sx={{ 
        backgroundColor: scrolled 
          ? (mode === 'dark' 
              ? 'rgba(18, 18, 18, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)') 
          : 'background.paper',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? 'none' : '1px solid',
        borderBottomColor: 'divider',
        zIndex: 1100,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: scrolled 
          ? (mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.37)'
              : '0 8px 32px rgba(31, 38, 135, 0.37)')
          : 'none',
        '&::before': scrolled ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(18, 18, 18, 0.8) 0%, rgba(32, 32, 32, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)',
          zIndex: -1,
          borderRadius: 0
        } : {}
      }}
    >
      <Toolbar sx={{
        transition: 'all 0.3s ease',
        py: scrolled ? 0.5 : 1,
        minHeight: scrolled ? '56px !important' : '64px !important'
      }}>
        {/* Mobile hamburger menu */}
        {user && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => {
              // console.log('Hamburger menu clicked');
              onMenuClick && onMenuClick();
            }}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: 'text.primary',
              transform: scrolled ? 'scale(0.9)' : 'scale(1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                transform: scrolled ? 'scale(0.95)' : 'scale(1.05)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {!user && (
          <Typography variant="h6" component="div" sx={{ color: 'text.primary' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
               <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ 
                  height: scrolled ? 50 : 65, 
                  width: 'auto', 
                  verticalAlign: 'middle',
                  transition: 'all 0.3s ease',
                  filter: scrolled ? 'brightness(1.1)' : 'brightness(1)'
                }}
              />
            </Link>
          </Typography>
        )}

        {/* Centered Logo */}
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#ff4081',
            fontSize: { xs: scrolled ? '1.25rem' : '1.5rem', md: scrolled ? '1.75rem' : '2rem' },
            transition: 'all 0.3s ease',
            transform: scrolled ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ 
                height: scrolled ? 50 : 65, 
                width: 'auto', 
                verticalAlign: 'middle',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: scrolled ? 'drop-shadow(0 4px 8px rgba(255, 64, 129, 0.3))' : 'none',
                '&:hover': {
                  transform: 'scale(1.05)',
                  filter: 'drop-shadow(0 6px 12px rgba(255, 64, 129, 0.4))'
                }
              }}
            />
          </Link>
        </Typography>

        {/* Right side controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          transform: scrolled ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }}>
          <IconButton 
            onClick={() => {
              // console.log('Theme toggle clicked');
              toggleColorMode();
            }}
            sx={{ 
              color: 'text.primary',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                transform: 'rotate(180deg)',
                color: scrolled ? '#ff4081' : 'text.primary'
              }
            }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          
          {user ? (
            <>
              <IconButton 
                sx={{ 
                  color: 'text.primary',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    color: scrolled ? '#ff4081' : 'text.primary',
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={handleMenuClick}
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <AccountCircle />
              </IconButton>
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
                    backgroundColor: mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '12px',
                    boxShadow: mode === 'dark'
                      ? '0 8px 32px rgba(0, 0, 0, 0.37)'
                      : '0 8px 32px rgba(31, 38, 135, 0.37)',
                    mt: 1,
                    minWidth: '160px'
                  }
                }}
              >
                <MenuItem 
                  onClick={handleProfileClick}
                  sx={{
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    '&:hover': {
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.08)',
                      color: 'error.main'
                    }
                  }}
                >
                  <ListItemIcon>
                    <ExitToAppIcon fontSize="small" sx={{ color: 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button 
                sx={{ 
                  color: 'text.primary',
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    color: '#ff4081',
                    transform: 'translateY(-1px)'
                  }
                }} 
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                sx={{ 
                  color: 'text.primary',
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    color: '#ff4081',
                    transform: 'translateY(-1px)'
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
