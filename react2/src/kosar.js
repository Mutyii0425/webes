import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Menu from './menu2';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Grid,
  FormGroup,
  FormControlLabel,
  Switch,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import InactivityAlert from './InactivityAlert';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const imageMap = {};
const images = require.context('../../adaliclothing-mvc/backend/kep', false, /\.(png|jpg|jpeg)$/);
images.keys().forEach((key) => {
  const imageName = key.replace('./', '');
  imageMap[imageName] = images(key);
});

export default function Kosar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isExtraSmall = useMediaQuery('(max-width:400px)');
  
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef(null);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [quantityAlert, setQuantityAlert] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [quantityMessage, setQuantityMessage] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);
  }, []);

  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + (item.ar * item.mennyiseg), 0);
    setTotalPrice(newTotal);
  }, [cartItems]);

  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserName(user.username || user.felhasznalonev || 'Felhasználó');
      }
    };
    checkLoginStatus();
  }, []);

  const handleQuantityChange = (id, increase) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = increase ? item.mennyiseg + 1 : Math.max(1, item.mennyiseg - 1);
        setQuantityMessage(increase ? 'Mennyiség növelve' : 'Mennyiség csökkentve');
        setQuantityAlert(true);
        setTimeout(() => setQuantityAlert(false), 1500);
        return {
          ...item,
          mennyiseg: newQuantity
        };
      }
      return item;
    });
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const handleRemoveItem = (id) => {
    setItemToDelete(id);
    setDeleteAlert(true);
  };

  const confirmDelete = () => {
    const updatedItems = cartItems.filter(item => item.id !== itemToDelete);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    setDeleteAlert(false);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setQuantityMessage('A kosár üres! Kérjük, adjon hozzá termékeket a folytatáshoz.');
      setQuantityAlert(true);
      setTimeout(() => setQuantityAlert(false), 3000);
      return;
    }
    
    navigate('/shipping', {
      state: {
        cartItems: cartItems,
        totalPrice: totalPrice
      }
    });
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event = {}) => {
    if (event.target && anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
    setOpen(false);
  };
  
  const confirmLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setShowLogoutAlert(false);
    navigate('/sign');
  };

  const toggleSideMenu = () => {
    setSideMenuActive((prev) => !prev);
  };

  const handleCartClick = () => {
    navigate('/kosar');
  };

  const fadeInAnimation = {
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' }
    }
  };

  return (
    <div style={{
      backgroundColor: darkMode ? '#333' : '#f5f5f5',
      backgroundImage: darkMode 
        ? 'radial-gradient(#444 1px, transparent 1px)'
        : 'radial-gradient(#aaaaaa 1px, transparent 1px)', 
      backgroundSize: '20px 20px',
      color: darkMode ? 'white' : 'black',
      minHeight: '100vh',
      paddingBottom: '100px', 
      transition: 'all 0.3s ease-in-out'
    }}>
  
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: darkMode ? '#333' : '#333',
          padding: isExtraSmall ? '8px 12px' : '10px 20px',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          borderBottom: '3px solid #ffffff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
          marginBottom: '10px', 
        }}
      >
        <IconButton
          onClick={toggleSideMenu}
          sx={{ 
            color: darkMode ? 'white' : 'white',
            padding: isExtraSmall ? '4px' : '8px'
          }}
          aria-label="Menu"
        >
          <MenuIcon fontSize={isExtraSmall ? "small" : "medium"} />
        </IconButton>
      
        <Typography
          variant="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: {
              xs: isExtraSmall ? '0.9rem' : '1.1rem',
              sm: '1.5rem',   
              md: '2rem'      
            },
            textAlign: 'center',
            color: 'white',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'auto',
            pointerEvents: 'none'
          }}
        >
          Adali Clothing
        </Typography>
        <Box sx={{ display: 'flex', gap: isExtraSmall ? '5px' : '10px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', gap: isExtraSmall ? '5px' : '10px', alignItems: 'center' }}>
              <IconButton
                onClick={handleCartClick}
                sx={{
                  color: '#fff',
                  padding: isExtraSmall ? '4px' : '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                aria-label="Kosár"
              >
                <Badge 
                  badgeContent={cartItemCount} 
                  color="primary"
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: '#fff', 
                      color: '#333',
                      fontSize: isExtraSmall ? '0.6rem' : '0.75rem',
                      minWidth: isExtraSmall ? '14px' : '20px',
                      height: isExtraSmall ? '14px' : '20px'
                    } 
                  }}
                >
                  <ShoppingCartIcon fontSize={isExtraSmall ? "small" : "medium"} />
                </Badge>
              </IconButton>
              <IconButton
                ref={anchorRef}
                onClick={handleToggle}
                sx={{
                  color: '#fff',
                  zIndex: 1300,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  padding: isExtraSmall ? '4px' : '8px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
                  }
                }}
                aria-label="Felhasználói menü"
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
              >
                <PersonIcon fontSize={isExtraSmall ? "small" : "medium"} />
              </IconButton>
              <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                transition
                disablePortal
                sx={{ 
                  zIndex: 1300,
                  mt: 1, 
                  '& .MuiPaper-root': {
                    overflow: 'hidden',
                    borderRadius: '12px',
                    boxShadow: darkMode 
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: darkMode 
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.05)',
                  }
                }}
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                    }}
                  >
                    <Paper
                      sx={{
                        backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
                        minWidth: isExtraSmall ? '180px' : '200px',
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList 
                          autoFocusItem={open} 
                          id="menu-list-grow"
                          onKeyDown={handleListKeyDown}
                          sx={{ py: 1 }}
                        >
                          <MenuItem 
                            onClick={handleClose}
                            sx={{
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1" sx={{ 
                              fontWeight: 500,
                              fontSize: isExtraSmall ? '0.8rem' : 'inherit'
                            }}>
                              {userName} profilja
                            </Typography>
                          </MenuItem>

                          <MenuItem 
                            onClick={() => {
                              handleClose();
                              navigate('/fiokom');
                            }}
                            sx={{
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1" sx={{ fontSize: isExtraSmall ? '0.8rem' : 'inherit' }}>
                              Fiókom
                            </Typography>
                          </MenuItem>

                          <MenuItem 
                                                     onClick={handleClose}
                                                     sx={{
                                                       py: isExtraSmall ? 1 : 1.5,
                                                       px: isExtraSmall ? 1.5 : 2,
                                                       color: darkMode ? '#fff' : '#333',
                                                       '&:hover': {
                                                         backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                                                       },
                                                       gap: 2,
                                                     }}
                                                   >
                                                     {(() => {
                                                       const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                       let hasCoupons = false;
                                                       
                                                       
                                                       return (
                                                         <Box sx={{ width: '100%' }}>
                                                           <Typography variant="body2" sx={{ 
                                                             fontSize: isExtraSmall ? '0.8rem' : 'inherit',
                                                             fontWeight: 'medium',
                                                             mb: 0.5
                                                           }}>
                                                             Kuponjaim
                                                           </Typography>
                                                           {user.kupon && user.kupon !== 'Nincs nyeremény' && (
                                                             <Box sx={{ mb: 0.5 }}>
                                                               <Typography variant="body2" sx={{ 
                                                                 fontSize: isExtraSmall ? '0.75rem' : '0.85rem',
                                                                 display: 'flex',
                                                                 justifyContent: 'space-between'
                                                               }}>
                                                                 <span>Regisztrációs kupon:</span>
                                                                 <span>{user.kupon}</span>
                                                               </Typography>
                                                               <Typography variant="body2" sx={{ 
                                                                 fontSize: isExtraSmall ? '0.7rem' : '0.8rem',
                                                                 color: user.kupon_hasznalva ? 
                                                                   (darkMode ? '#ff6b6b' : '#d32f2f') : 
                                                                   (darkMode ? '#4caf50' : '#2e7d32'),
                                                                 textAlign: 'right'
                                                               }}>
                                                                 {user.kupon_hasznalva ? '(Felhasználva)' : '(Aktív)'}
                                                               </Typography>
                                                             </Box>
                                                           )}
                                                           {user.email_kupon && user.email_kupon !== 'Nincs nyeremény' && (
                                                             <Box>
                                                               <Typography variant="body2" sx={{ 
                                                                 fontSize: isExtraSmall ? '0.75rem' : '0.85rem',
                                                                 display: 'flex',
                                                                 justifyContent: 'space-between',
                                                                 mt: 0.5
                                                               }}>
                                                                 <span>Email kupon:</span>
                                                                 <span>{user.email_kupon}</span>
                                                               </Typography>
                                                               <Typography variant="body2" sx={{ 
                                                                 fontSize: isExtraSmall ? '0.7rem' : '0.8rem',
                                                                 color: user.email_kupon_hasznalva ? 
                                                                   (darkMode ? '#ff6b6b' : '#d32f2f') : 
                                                                   (darkMode ? '#4caf50' : '#2e7d32'),
                                                                 textAlign: 'right'
                                                               }}>
                                                                 {user.email_kupon_hasznalva ? '(Felhasználva)' : '(Aktív)'}
                                                               </Typography>
                                                             </Box>
                                                           )}
                                                           
                                                           {(!user.kupon || user.kupon === 'Nincs nyeremény') && 
                                                           (!user.email_kupon || user.email_kupon === 'Nincs nyeremény') && (
                                                             <Typography variant="body2" sx={{ 
                                                               fontSize: isExtraSmall ? '0.75rem' : '0.85rem',
                                                               color: darkMode ? '#aaa' : '#666'
                                                             }}>
                                                               Nincs aktív kuponod
                                                             </Typography>
                                                           )}
                                                         </Box>
                                                       );
                                                     })()}
                                                   </MenuItem>
                          <MenuItem 
                            onClick={handleLogout}
                            sx={{
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: '#ff4444',
                              '&:hover': {
                                backgroundColor: 'rgba(255,68,68,0.1)',
                              },
                              gap: 2,
                              borderTop: '1px solid',
                              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              mt: 1,
                            }}
                          >
                            <Typography variant="body1" sx={{ fontSize: isExtraSmall ? '0.8rem' : 'inherit' }}>
                              Kijelentkezés
                            </Typography>
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
          ) : (
            <>
              <Button
                component={Link}
                to="/sign"
                sx={{
                  color: '#fff',
                  border: '1px solid #fff',
                  borderRadius: '5px',
                  padding: {
                    xs: isExtraSmall ? '1px 4px' : '2px 6px',
                    sm: '5px 10px'
                  },
                  fontSize: {
                    xs: isExtraSmall ? '0.6rem' : '0.7rem',
                    sm: '1rem'
                  },
                  whiteSpace: 'nowrap',
                  minWidth: isExtraSmall ? '50px' : 'auto',
                  '&:hover': {
                    backgroundColor: '#fff',
                    color: '#333',
                  },
                }}
              >
                Sign In
              </Button>

              <Button
                component={Link}
                to="/signup"
                sx={{
                  color: '#fff',
                  border: '1px solid #fff',
                  borderRadius: '5px',
                  padding: {
                    xs: isExtraSmall ? '1px 4px' : '2px 6px',
                    sm: '5px 10px'
                  },
                  fontSize: {
                    xs: isExtraSmall ? '0.6rem' : '0.7rem',
                    sm: '1rem'
                  },
                  whiteSpace: 'nowrap',
                  minWidth: isExtraSmall ? '50px' : 'auto',
                  '&:hover': {
                    backgroundColor: '#fff',
                    color: '#333',
                  },
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{
        position: 'fixed',
        top: 0,
        left: sideMenuActive ? 0 : '-250px',
        width: isExtraSmall ? '200px' : '250px',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1200,
        transition: 'left 0.1s ease-in-out',
      }}>
        <Menu sideMenuActive={sideMenuActive} toggleSideMenu={toggleSideMenu} />
      </Box>


      <FormGroup sx={{ 
        position: 'absolute', 
        top: isExtraSmall ? 50 : 60, 
        right: isExtraSmall ? 10 : 20,
        transform: isExtraSmall ? 'scale(0.8)' : 'none',
        transformOrigin: 'top right',
        zIndex: 10
      }}>
        <FormControlLabel
          control={
            <Switch
              color="default"
              checked={darkMode}
              onChange={() => setDarkMode((prev) => !prev)}
              size={isExtraSmall ? "small" : "medium"}
            />
          }
          label={<Typography sx={{ fontSize: isExtraSmall ? '0.7rem' : 'inherit', color: darkMode ? 'white' : 'black' }}>Dark Mode</Typography>}
        />
      </FormGroup>

    
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 3, sm: 4, md: 6 },
          px: { xs: isExtraSmall ? 1 : 2, sm: 3 },
          animation: 'fadeIn 0.6s ease-out',
          ...fadeInAnimation,
          mt: { xs: 4, sm: 2 }
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: {
              xs: isExtraSmall ? '1.4rem' : '1.75rem',
              sm: '2.25rem',    
              md: '2.75rem'  
            },
            textAlign: {
              xs: 'center', 
              sm: 'left'      
            },
            background: darkMode
              ? 'linear-gradient(45deg, #fff, #ccc)'
              : 'linear-gradient(45deg, #333, #666)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: {
              xs: isExtraSmall ? 1.5 : 2,          
              sm: 3,        
              md: 4            
            },
            padding: {
              xs: '0 15px',     
              sm: 0           
            },
            lineHeight: {
              xs: 1.3,        
              sm: 1.4,         
              md: 1.5          
            },
            letterSpacing: {
              xs: '-0.5px',     
              sm: 'normal'      
            },
            animation: 'fadeIn 0.8s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          Kosár tartalma
        </Typography>

        <Box
  sx={{
    border: '2px solid',
    borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.8)',
    borderRadius: { xs: '16px', sm: '24px' },
    padding: {
      xs: isExtraSmall ? 1 : 2,
      sm: 3,
      md: 4
    },
    backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
    boxShadow: darkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      boxShadow: darkMode
        ? '0 12px 40px rgba(0, 0, 0, 0.4)'
        : '0 12px 40px rgba(0, 0, 0, 0.15)',
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 1)',
    },
    mb: 4
  }}
>

         <Grid container spacing={{ xs: isExtraSmall ? 1 : 2, sm: 3, md: 4 }}>
         <Grid item xs={12} md={8}>
  {cartItems.length > 0 ? (
    cartItems.map((item, index) => (
      <Card
        key={item.id}
        sx={{
          mb: isExtraSmall ? 1 : 2,
          backgroundColor: darkMode ? 'rgba(51, 51, 51, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: { xs: '8px', sm: '16px' },
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(0, 0, 0, 0.8)',
          boxShadow: darkMode
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: { xs: 'none', sm: 'translateY(-4px)' },
            boxShadow: darkMode
              ? '0 12px 40px rgba(0, 0, 0, 0.4)'
              : '0 12px 40px rgba(0, 0, 0, 0.15)'
          },
          animation: `fadeIn 0.6s ease-out ${index * 0.1}s`
        }}
        className="cart-item"
      >
        <CardContent sx={{
          p: {
            xs: isExtraSmall ? 1 : 1.5,
            sm: 2
          }
        }}>
     
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: { xs: 1, sm: 2 }
          }}>
         
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              maxWidth: { xs: '100%', sm: '40%' }
            }}>
              <img
                src={imageMap[item.imageUrl] || item.imageUrl}
                alt={item.nev}
                style={{
                  width: isExtraSmall ? '50px' : '60px',
                  height: isExtraSmall ? '50px' : '60px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  padding: '4px',
                  border: darkMode ? 'none' : '1px solid rgba(0, 0, 0, 0.6)'
                }}
              />
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: darkMode ? '#fff' : '#333',
                    fontSize: {
                      xs: isExtraSmall ? '0.8rem' : '0.9rem',
                      sm: '1rem'
                    },
                    lineHeight: 1.2
                  }}
                >
                  {item.nev}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: darkMode ? '#aaa' : '#666',
                    fontSize: {
                      xs: isExtraSmall ? '0.7rem' : '0.75rem',
                      sm: '0.8rem'
                    }
                  }}
                >
                  Méret: {item.size || item.meret}
                </Typography>
              </Box>
            </Box>

       
            <Box sx={{
              display: { xs: 'none', sm: 'block' },
              flex: '0 0 auto',
              width: { sm: '15%' },
              textAlign: 'right'
            }}>
              <Typography
                variant="body2"
                sx={{
                  color: darkMode ? '#aaa' : '#666',
                  fontSize: '0.85rem'
                }}
              >
                {item.ar.toLocaleString()} Ft
              </Typography>
            </Box>

     
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              borderRadius: '30px',
              padding: '2px',
              flex: { xs: '0 0 auto', sm: '0 0 15%' },
              justifyContent: { sm: 'center' },
              border: darkMode ? 'none' : '1px solid rgba(0, 0, 0, 0.6)'
            }}>
              <IconButton
                onClick={() => handleQuantityChange(item.id, false)}
                size="small"
                sx={{
                  color: darkMode ? '#fff' : '#333',
                  padding: '2px',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                }}
                data-testid="decrease-quantity"
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography sx={{
                mx: 0.5,
                color: darkMode ? '#fff' : '#333',
                fontWeight: 600,
                fontSize: '0.8rem',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {item.mennyiseg}
              </Typography>
              <IconButton
                onClick={() => handleQuantityChange(item.id, true)}
                size="small"
                sx={{
                  color: darkMode ? '#fff' : '#333',
                  padding: '2px',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                }}
                data-testid="increase-quantity"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>

       
            <Box sx={{
              flex: { xs: '1 1 auto', sm: '0 0 15%' },
              textAlign: 'right'
            }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: darkMode ? '#fff' : '#333',
                  fontSize: {
                    xs: isExtraSmall ? '0.8rem' : '0.9rem',
                    sm: '0.95rem'
                  }
                }}
                className="total-price"
              >
                {(item.ar * item.mennyiseg).toLocaleString()} Ft
              </Typography>
           
              <Typography
                variant="body2"
                sx={{
                  display: { xs: 'block', sm: 'none' },
                  color: darkMode ? '#aaa' : '#666',
                  fontSize: isExtraSmall ? '0.7rem' : '0.75rem'
                }}
              >
                {item.ar.toLocaleString()} Ft/db
              </Typography>
            </Box>

       
            <Box sx={{
              flex: '0 0 auto'
            }}>
              <IconButton
                onClick={() => handleRemoveItem(item.id)}
                size="small"
                sx={{
                  color: '#ff4444',
                  padding: '4px',
                  border: darkMode ? 'none' : '1px solid rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,68,68,0.1)'
                  }
                }}
                data-testid="remove-item"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    ))
  ) : (
    <Card
      sx={{
        backgroundColor: darkMode ? 'rgba(51, 51, 51, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: { xs: '8px', sm: '16px' },
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(0, 0, 0, 0.8)',
        boxShadow: darkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        p: { xs: isExtraSmall ? 2 : 2.5, sm: 3 },
        textAlign: 'center'
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: darkMode ? '#fff' : '#333',
          mb: 1.5,
          fontSize: {
            xs: isExtraSmall ? '1rem' : '1.2rem',
            sm: '1.4rem'
          }
        }}
        className="empty-cart-message"
      >
        A kosár üres
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: darkMode ? '#aaa' : '#666',
          mb: 2,
          fontSize: {
            xs: isExtraSmall ? '0.85rem' : '0.95rem',
            sm: '1rem'
          }
        }}
      >
        Nincs termék a kosaradban. Fedezd fel kínálatunkat és adj hozzá termékeket!
      </Typography>
      <Button
        variant="contained"
        component={Link}
        to="/"
        sx={{
          backgroundColor: darkMode ? '#666' : '#333',
          borderRadius: '8px',
          py: 1,
          px: 2.5,
          fontSize: {
            xs: isExtraSmall ? '0.8rem' : '0.9rem',
            sm: '1rem'
          },
          border: darkMode ? 'none' : '1px solid rgba(0, 0, 0, 0.8)',
          '&:hover': {
            backgroundColor: darkMode ? '#777' : '#444',
          }
        }}
      >
        Vásárlás folytatása
      </Button>
    </Card>
  )}
</Grid>


<Grid item xs={12} md={4}>
<Card
    sx={{
      backgroundColor: darkMode ? 'rgba(51, 51, 51, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: { xs: '8px', sm: '16px' },
      position: { xs: 'relative', md: 'sticky' },
      top: '2rem',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(0, 0, 0, 0.8)',
      boxShadow: darkMode
        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
        : '0 8px 32px rgba(0, 0, 0, 0.1)',
      mt: { xs: 0, md: 0 }, 
      mb: { xs: 3, md: 0 },
      alignSelf: 'flex-start', 
      width: '100%'
    }}
  >
    <CardContent sx={{
      p: {
        xs: isExtraSmall ? 1.5 : 1,
        sm: 3,
        md: 4
      },
      '@media (max-height: 600px)': {
        p: 1.5,
      }
    }}>
       <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: darkMode ? '#fff' : '#333',
          mb: { xs: 1.5, sm: 2, md: 3 },
          fontSize: {
            xs: isExtraSmall ? '1rem' : '1.2rem',
            sm: '1.3rem',
            md: '1.5rem'
          },
          textAlign: { xs: 'center', sm: 'left' }
        }}
      >
        Összegzés
      </Typography>
       
      <Box sx={{
        mb: { xs: 2, sm: 3, md: 4 },
        '@media (max-height: 600px)': {
          mb: 1.5,
        }
      }}>
   
        <Box
          sx={{
            backgroundColor: darkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.1)',
            borderRadius: { xs: '6px', sm: '8px' },
            p: { xs: isExtraSmall ? 1 : 1.5, sm: 2 },
            mb: { xs: 1.5, sm: 2, md: 3 },
            border: darkMode ? '1px solid rgba(76, 175, 80, 0.3)' : '2px solid rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            justifyContent: { xs: 'center', sm: 'flex-start' },
            '@media (max-height: 600px)': {
              p: 1,
              mb: 1,
            }
          }}
        >
          <LocalShippingIcon
            sx={{
              color: darkMode ? '#4caf50' : '#2e7d32',
              fontSize: {
                xs: isExtraSmall ? '0.9rem' : '1rem',
                sm: '1.1rem',
                md: '1.25rem'
              },
              mr: { xs: 0.5, sm: 0 }
            }}
          />
          <Typography
            sx={{
              color: darkMode ? '#4caf50' : '#2e7d32',
              fontSize: {
                xs: isExtraSmall ? '0.7rem' : '0.8rem',
                sm: '0.9rem',
                md: '1rem'
              },
              textAlign: { xs: 'center', sm: 'left' },
              lineHeight: 1.3,
              flex: 1,
              '@media (max-width: 320px)': {
                fontSize: '0.65rem',
              }
            }}
          >
            {totalPrice > 19999
              ? '✓ Ingyenes szállítás (20 000 Ft feletti rendelés)'
              : `Még ${(20000 - totalPrice).toLocaleString()} Ft és ingyenes a szállítás!`}
          </Typography>
        </Box>

  
        {[
          { label: 'Részösszeg:', value: totalPrice },
          {
            label: totalPrice > 19999 ? 'Szállítási költség (ingyenes):' : 'Szállítási költség:',
            value: cartItems.length > 0 ? (totalPrice > 19999 ? 0 : 1590) : 0
          },
          {
            label: 'Végösszeg:',
            value: cartItems.length > 0 ? totalPrice + (totalPrice > 19999 ? 0 : 1590) : 0,
            isTotal: true
          }
        ].map((item, index) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: {
                xs: isExtraSmall ? 0.75 : 1,
                sm: 1.5,
                md: 2
              },
              px: { xs: 0.5, sm: 0 },
              borderBottom: index !== 2 ? `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)'}` : 'none',
              '@media (max-height: 600px)': {
                py: 0.75,
              }
            }}
          >
            <Typography sx={{
              color: darkMode ? '#fff' : '#333',
              fontWeight: item.isTotal ? 600 : 400,
              fontSize: {
                xs: isExtraSmall ? (item.isTotal ? '0.85rem' : '0.75rem') : (item.isTotal ? '0.95rem' : '0.85rem'),
                sm: item.isTotal ? '1.1rem' : '0.95rem',
                md: item.isTotal ? '1.2rem' : '1rem'
              },
              '@media (max-width: 320px)': {
                fontSize: item.isTotal ? '0.8rem' : '0.7rem',
              },
              '@media (max-height: 600px)': {
                fontSize: item.isTotal ? '0.85rem' : '0.75rem',
              }
            }}>
              {item.label}
            </Typography>
            <Typography sx={{
              color: darkMode ? '#fff' : '#333',
              fontWeight: item.isTotal ? 600 : 400,
              fontSize: {
                xs: isExtraSmall ? (item.isTotal ? '0.85rem' : '0.75rem') : (item.isTotal ? '0.95rem' : '0.85rem'),
                sm: item.isTotal ? '1.1rem' : '0.95rem',
                md: item.isTotal ? '1.2rem' : '1rem'
              },
              '@media (max-width: 320px)': {
                fontSize: item.isTotal ? '0.8rem' : '0.7rem',
              },
              '@media (max-height: 600px)': {
                fontSize: item.isTotal ? '0.85rem' : '0.75rem',
              }
            }}>
              {item.value.toLocaleString()} Ft
            </Typography>
          </Box>
        ))}
      </Box>

  
      <Button
        variant="contained"
        fullWidth
        size={isExtraSmall ? "small" : "medium"}
        onClick={handleCheckout}
        sx={{
          py: {
            xs: isExtraSmall ? 1 : 1.25,
            sm: 1.5,
            md: 2
          },
          backgroundColor: darkMode ? '#666' : '#333',
          borderRadius: { xs: '8px', sm: '12px' },
          fontSize: {
            xs: isExtraSmall ? '0.8rem' : '0.9rem',
            sm: '1rem',
            md: '1.1rem'
          },
          fontWeight: 600,
          transition: 'all 0.3s ease',
          border: darkMode ? 'none' : '1px solid rgba(0, 0, 0, 0.8)',
          '&:hover': {
            backgroundColor: darkMode ? '#777' : '#444',
            transform: { xs: 'none', sm: 'translateY(-2px)' },
            boxShadow: { xs: 'none', sm: '0 10px 20px rgba(0,0,0,0.2)' }
          },
          '&:disabled': {
            backgroundColor: darkMode ? '#555' : '#ccc',
            color: darkMode ? '#888' : '#666',
            border: darkMode ? 'none' : '1px solid rgba(0, 0, 0, 0.3)'
          },
          '@media (max-height: 600px)': {
            py: 0.75,
            fontSize: '0.8rem',
          },
          '@media (max-width: 320px)': {
            fontSize: '0.75rem',
          }
        }}
        disabled={cartItems.length === 0}
        data-testid="checkout-button"
      >
        Tovább a fizetéshez
      </Button>
    </CardContent>
  </Card>
</Grid>
</Grid>
</Box>

              


{deleteAlert && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1400,
      padding: { xs: '16px', sm: 0 },
      backdropFilter: 'blur(4px)'
    }}
    onClick={(e) => {

      if (e.target === e.currentTarget) {
        setDeleteAlert(false);
      }
    }}
  >
    <Box
      sx={{
        width: { xs: '100%', sm: 'auto' },
        maxWidth: { xs: '100%', sm: '400px' },
        animation: 'popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        '@keyframes popIn': {
          '0%': {
            opacity: 0,
            transform: 'scale(0.5)',
          },
          '50%': {
            transform: 'scale(1.05)',
          },
          '100%': {
            opacity: 1,
            transform: 'scale(1)',
          },
        },
      }}
    >
      <Card
        sx={{
          backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: darkMode ? '#fff' : '#000',
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          borderRadius: { xs: '16px', sm: '20px' },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: { xs: '3px', sm: '4px' },
            background: 'linear-gradient(90deg, #FF5252, #FF1744)',
            animation: 'loadingBar 2s ease-in-out',
            '@keyframes loadingBar': {
              '0%': { width: '0%' },
              '100%': { width: '100%' }
            }
          }}
        />
        <CardContent sx={{ 
          p: { 
            xs: isExtraSmall ? 2.5 : 3, 
            sm: 4 
          },
          '@media (max-height: 500px)': {
            p: 2,
          }
        }}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: { 
              xs: isExtraSmall ? 2 : 2.5, 
              sm: 3 
            },
            '@media (max-height: 500px)': {
              mb: 1.5,
            }
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: { xs: 0.5, sm: 1 },
                fontSize: { 
                  xs: isExtraSmall ? '1.1rem' : '1.2rem', 
                  sm: '1.5rem' 
                },
                background: darkMode
                  ? 'linear-gradient(45deg, #FF5252, #FF1744)'
                  : 'linear-gradient(45deg, #D32F2F, #C62828)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                '@media (max-height: 500px)': {
                  fontSize: '1rem',
                }
              }}
            >
              Termék törlése
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: darkMode ? '#aaa' : '#666',
                fontSize: { 
                  xs: isExtraSmall ? '0.8rem' : '0.9rem', 
                  sm: '1rem' 
                },
                '@media (max-height: 500px)': {
                  fontSize: '0.8rem',
                }
              }}
            >
              Biztosan törölni szeretnéd ezt a terméket a kosárból?
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: { xs: isExtraSmall ? 1 : 1.5, sm: 2 },
              justifyContent: 'space-between',
              flexDirection: { 
                xs: isExtraSmall ? 'column' : 'row', 
                sm: 'row' 
              },
              '@media (max-height: 500px)': {
                flexDirection: 'row',
              }
            }}
          >
            <Button
              onClick={() => setDeleteAlert(false)}
              sx={{
                flex: 1,
                py: { 
                  xs: isExtraSmall ? 0.75 : 1, 
                  sm: 1.5 
                },
                borderRadius: { xs: '8px', sm: '12px' },
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                color: darkMode ? '#90caf9' : '#1976d2',
                fontSize: { 
                  xs: isExtraSmall ? '0.8rem' : '0.85rem', 
                  sm: 'inherit' 
                },
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                  transform: { xs: 'none', sm: 'translateY(-2px)' },
                },
                '@media (max-height: 500px)': {
                  py: 0.75,
                  fontSize: '0.8rem',
                }
              }}
            >
              Mégse
            </Button>
            <Button
              onClick={confirmDelete}
              sx={{
                flex: 1,
                py: { 
                  xs: isExtraSmall ? 0.75 : 1, 
                  sm: 1.5 
                },
                borderRadius: { xs: '8px', sm: '12px' },
                background: darkMode
                  ? 'linear-gradient(45deg, #FF5252, #FF1744)'
                  : 'linear-gradient(45deg, #D32F2F, #C62828)',
                color: '#fff',
                fontSize: { 
                  xs: isExtraSmall ? '0.8rem' : '0.85rem', 
                  sm: 'inherit' 
                },
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-2px)' },
                  boxShadow: { xs: 'none', sm: '0 5px 15px rgba(0,0,0,0.3)' },
                },
                '@media (max-height: 500px)': {
                  py: 0.75,
                  fontSize: '0.8rem',
                }
              }}
            >
              Törlés
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  </Box>
)}
        
        {quantityAlert && (
          <Box
            sx={{
              position: 'fixed',
              bottom: { xs: '10px', sm: '20px', md: '30px' },
              right: { xs: '10px', sm: '20px', md: '30px' },
              zIndex: 1400,
              width: { xs: 'calc(100% - 20px)', sm: 'auto' },
              maxWidth: { xs: '100%', sm: '350px', md: '400px' },
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                '0%': {
                  opacity: 0,
                  transform: { xs: 'translateY(20px)', sm: 'translateX(100%)' },
                },
                '100%': {
                  opacity: 1,
                  transform: { xs: 'translateY(0)', sm: 'translateX(0)' },
                },
              },
            }}
          >
            <Card
              sx={{
                backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                color: darkMode ? '#fff' : '#000',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                borderRadius: { xs: '8px', sm: '12px' },
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: { xs: '2px', sm: '3px' },
                  background: 'linear-gradient(90deg, #64B5F6, #2196F3)',
                  animation: 'loadingBar 1.5s ease-in-out',
                  '@keyframes loadingBar': {
                    '0%': { width: '0%' },
                    '100%': { width: '100%' }
                  }
                }}
              />
              <CardContent 
                sx={{
                  p: { xs: isExtraSmall ? 1.25 : 1.5, sm: 2 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  minHeight: { xs: '40px', sm: 'auto' },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    fontSize: { 
                      xs: isExtraSmall ? '0.75rem' : '0.85rem', 
                      sm: '0.9rem', 
                      md: '1rem' 
                    },
                    textAlign: 'center',
                    background: darkMode
                      ? 'linear-gradient(45deg, #64B5F6, #2196F3)'
                      : 'linear-gradient(45deg, #1976d2, #1565c0)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    px: { xs: 1, sm: 0 },
                  }}
                >
                  {quantityMessage}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}


        {showLogoutAlert && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1400,
              padding: { xs: '16px', sm: 0 },
            }}
            onClick={(e) => {
              
              if (e.target === e.currentTarget) {
                setShowLogoutAlert(false);
              }
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: '100%', sm: '400px' },
                animation: 'popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                '@keyframes popIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'scale(0.5)',
                  },
                  '50%': {
                    transform: 'scale(1.05)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
              }}
            >
              <Card
                sx={{
                  width: '100%',
                  backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: darkMode ? '#fff' : '#000',
                  boxShadow: darkMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                  borderRadius: { xs: '16px', sm: '20px' },
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: { xs: '3px', sm: '4px' },
                    background: 'linear-gradient(90deg, #00C853, #B2FF59)',
                    animation: 'loadingBar 2s ease-in-out',
                    '@keyframes loadingBar': {
                      '0%': { width: '0%' },
                      '100%': { width: '100%' }
                    }
                  }}
                />
                <CardContent sx={{ 
                  p: { 
                    xs: isExtraSmall ? 2.5 : 3, 
                    sm: 4 
                  },
                  '@media (max-height: 500px)': {
                    p: 2,
                  }
                }}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    mb: { 
                      xs: isExtraSmall ? 2 : 2.5, 
                      sm: 3 
                    },
                    '@media (max-height: 500px)': {
                      mb: 1.5,
                    }
                  }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: { xs: 0.5, sm: 1 },
                        fontSize: { 
                          xs: isExtraSmall ? '1.1rem' : '1.2rem', 
                          sm: '1.5rem' 
                        },
                        background: darkMode
                          ? 'linear-gradient(45deg, #90caf9, #42a5f5)'
                          : 'linear-gradient(45deg, #1976d2, #1565c0)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        '@media (max-height: 500px)': {
                          fontSize: '1rem',
                        }
                      }}
                    >
                      Kijelentkezés
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: darkMode ? '#aaa' : '#666',
                        fontSize: { 
                          xs: isExtraSmall ? '0.8rem' : '0.9rem', 
                          sm: '1rem' 
                        },
                        '@media (max-height: 500px)': {
                          fontSize: '0.8rem',
                        }
                      }}
                    >
                      Biztosan ki szeretnél jelentkezni?
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: { xs: isExtraSmall ? 1 : 1.5, sm: 2 },
                      justifyContent: 'space-between',
                      flexDirection: { 
                        xs: isExtraSmall ? 'column' : 'row', 
                        sm: 'row' 
                      },
                      '@media (max-height: 500px)': {
                        flexDirection: 'row',
                      }
                    }}
                  >
                    <Button
                      onClick={() => setShowLogoutAlert(false)}
                      sx={{
                        flex: 1,
                        py: { 
                          xs: isExtraSmall ? 0.75 : 1, 
                          sm: 1.5 
                        },
                        borderRadius: { xs: '8px', sm: '12px' },
                        backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                        color: darkMode ? '#90caf9' : '#1976d2',
                        fontSize: { 
                          xs: isExtraSmall ? '0.8rem' : '0.85rem', 
                          sm: 'inherit' 
                        },
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                          transform: { xs: 'none', sm: 'translateY(-2px)' },
                        },
                        '@media (max-height: 500px)': {
                          py: 0.75,
                          fontSize: '0.8rem',
                        }
                      }}
                    >
                      Mégse
                    </Button>
                    <Button
                      onClick={confirmLogout}
                      sx={{
                        flex: 1,
                        py: { 
                          xs: isExtraSmall ? 0.75 : 1, 
                          sm: 1.5 
                        },
                        borderRadius: { xs: '8px', sm: '12px' },
                        background: darkMode
                          ? 'linear-gradient(45deg, #90caf9, #42a5f5)'
                          : 'linear-gradient(45deg, #1976d2, #1565c0)',
                        color: '#fff',
                        fontSize: { 
                          xs: isExtraSmall ? '0.8rem' : '0.85rem', 
                          sm: 'inherit' 
                        },
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: { xs: 'none', sm: 'translateY(-2px)' },
                          boxShadow: { xs: 'none', sm: '0 5px 15px rgba(0,0,0,0.3)' },
                        },
                        '@media (max-height: 500px)': {
                          py: 0.75,
                          fontSize: '0.8rem',
                        }
                      }}
                    >
                      Kijelentkezés
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

 
        <InactivityAlert darkMode={darkMode} inactivityTimeout={120000} />
      </Container>
    </div>
  );
}

              


