import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  FormGroup,
  FormControlLabel,
  Switch,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  useMediaQuery,
  useTheme,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Menu from './menu2';
import { CircularProgress } from '@mui/material';
import Footer from './footer';
import PersonIcon from '@mui/icons-material/Person';
import ShareProduct from './ShareProduct';
import InactivityAlert from './InactivityAlert';




  const Oterm = () => {
    const [products, setProducts] = useState([]);
    const [darkMode, setDarkMode] = useState(true);
    const [sideMenuActive, setSideMenuActive] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [open, setOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
    const anchorRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
     const isExtraSmall = useMediaQuery('(max-width:400px)');
    const imageMap = {};
    const images = require.context('../../adaliclothing-mvc/backend/kep', false, /\.(png|jpg|jpeg)$/);
    images.keys().forEach((key) => {
      const imageName = key.replace('./', '');
      imageMap[imageName] = images(key);
    });
    

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('https://adaliclothing.onrender.com/termekek');
          const data = await response.json();
          await new Promise(resolve => setTimeout(resolve, 1500));
          setProducts(data);
        } catch (error) {
          console.log('Hiba:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    }, []);
    
  
    const filteredProducts = selectedCategory 
      ? products.filter(product => {
          if (selectedCategory === 'Pólók') return product.kategoriaId === 4;
          if (selectedCategory === 'Nadrágok') return product.kategoriaId === 2;
          if (selectedCategory === 'Pulóverek') return product.kategoriaId === 5;
          if (selectedCategory === 'Zoknik') return product.kategoriaId === 3;
          return true;
        })
      : products;
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

      return (
<div style={{
  backgroundColor: darkMode ? '#333' : '#f5f5f5',
  backgroundImage: darkMode 
    ? 'radial-gradient(#444 1px, transparent 1px)'
    : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  color: darkMode ? 'white' : 'black',
  minHeight: '100vh',
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
                    xs: isExtraSmall ? '1px 3px' : '2px 6px',
                    sm: '5px 10px'
                  },
                  fontSize: {
                    xs: isExtraSmall ? '0.55rem' : '0.7rem',
                    sm: '1rem'
                  },
                  whiteSpace: 'nowrap',
                  minWidth: isExtraSmall ? '40px' : 'auto',
                  height: isExtraSmall ? '24px' : 'auto',
                  marginRight: isExtraSmall ? '2px' : 'auto',
                  '&:hover': {
                    backgroundColor: '#fff',
                    color: '#333',
                  },
                }}
              >
                {isExtraSmall ? 'Sign In' : 'Sign In'}
              </Button>
              
              <Button
                component={Link}
                to="/signup"
                sx={{
                  color: '#fff',
                  border: '1px solid #fff',
                  borderRadius: '5px',
                  padding: {
                    xs: isExtraSmall ? '1px 3px' : '2px 6px',
                    sm: '5px 10px'
                  },
                  fontSize: {
                    xs: isExtraSmall ? '0.55rem' : '0.7rem',
                    sm: '1rem'
                  },
                  whiteSpace: 'nowrap',
                  minWidth: isExtraSmall ? '40px' : 'auto',
                  height: isExtraSmall ? '24px' : 'auto',
                  '&:hover': {
                    backgroundColor: '#fff',
                    color: '#333',
                  },
                }}
              >
                {isExtraSmall ? 'Sign Up' : 'Sign Up'}
              </Button>
            </>
          )}
        </Box>
      </Box>

       

        <Box sx={{
          position: 'fixed',
          top: 0,
          left: sideMenuActive ? 0 : '-250px',
          width: '250px',
          height: '100%',
          backgroundColor: '#fff',
          boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.2)',
          zIndex: 1200,
          transition: 'left 0.1s ease-in-out',
        }}>
          <Menu sideMenuActive={sideMenuActive} toggleSideMenu={toggleSideMenu} />
        </Box>

        <FormGroup sx={{ position: 'absolute', top: 60, right: 20 }}>
          <FormControlLabel
            control={
              <Switch
                color="default"
                checked={darkMode}
                onChange={() => setDarkMode((prev) => !prev)}
              />
            }
            label="Dark Mode"
          />
        </FormGroup>

        <Container maxWidth="xl" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ 
  display: 'flex', 
  justifyContent: 'center', 
  gap: 1.5, 
  mb: 5, 
  flexWrap: 'wrap',
  marginTop: '30px'
}}>
  {[
    { id: null, name: 'Összes' },
    { id: 'Pólók', name: 'Pólók' },
    { id: 'Nadrágok', name: 'Nadrágok' },
    { id: 'Pulóverek', name: 'Pulloverek' },
    { id: 'Zoknik', name: 'Zoknik' },

  ].map(category => (
    <Button
  key={category.id || 'all'}
  variant={selectedCategory === category.id ? "contained" : "outlined"}
  onClick={() => setSelectedCategory(category.id)}
  sx={{
    borderRadius: '20px',
    px: 2,
    py: 0.8,
    backgroundColor: selectedCategory === category.id
      ? (darkMode ? '#1976d2' : '#1976d2')
      : (darkMode ? 'transparent' : 'rgba(0,0,0,0.03)'),
    borderColor: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.7)',
    borderWidth: '2px',  
    color: selectedCategory === category.id
      ? '#fff'
      : (darkMode ? '#fff' : '#333'),
    '&:hover': {
      backgroundColor: selectedCategory === category.id
        ? (darkMode ? '#1565c0' : '#1565c0')
        : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
      borderColor: darkMode ? 'rgba(255,255,255,0.7)' : '#000',
    },
    textTransform: 'none',
    fontWeight: 600, 
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    boxShadow: darkMode ? 'none' : (selectedCategory === category.id ? 'none' : '0 1px 3px rgba(0,0,0,0.1)')
  }}
>
  {category.name}
</Button>
  ))}
</Box>

                    {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '50vh',
              flexDirection: 'column',
              gap: 2
            }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#333' }}>
                Termékek betöltése...
              </Typography>
            </Box>
          ) : (
            <Grid 
              container 
              spacing={{xs: 1, sm: 2, md: 3}} 
              sx={{ 
                mt: 2,
                width: '100%',
                margin: '0 auto'
              }}
            >
  {filteredProducts.map((product) => (
  <Grid 
    item 
    xs={6} 
    sm={6} 
    md={4} 
    lg={3} 
    key={`product-${product.id}`}
    sx={{
      padding: { xs: '8px', sm: '12px', md: '16px' }
    }}
  >
    <Box sx={{ 
      position: 'relative',
      height: '100%',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)'
      }
    }}>

      <Link to={`/termek/${product.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <Card sx={{
         height: '100%',
         display: 'flex',
         flexDirection: 'column',
         backgroundColor: darkMode ? '#222' : 'white',
         color: darkMode ? 'white' : 'black',
         transition: 'all 0.3s ease',
         borderRadius: '12px',
         border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #000',
         overflow: 'hidden',
         boxShadow: darkMode
           ? '0 8px 20px rgba(0, 0, 0, 0.3)'
           : '0 8px 20px rgba(0, 0, 0, 0.1)',
         '&:hover': {
           transform: 'translateY(-8px)',
           boxShadow: darkMode
             ? '0 12px 30px rgba(0, 0, 0, 0.5)'
             : '0 12px 30px rgba(0, 0, 0, 0.15)'
         }
       }}>
         
          <Box sx={{ 
            position: 'relative', 
            paddingTop: '100%', 
            overflow: 'hidden',
            backgroundColor: darkMode ? '#333' : '#f5f5f5'
          }}>
            <CardMedia
              component="img"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '12px',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              image={imageMap[product.imageUrl]}
              alt={product.nev}
            />
            
            <Box sx={{
              position: 'absolute',
              bottom: {
                xs: 5,
                sm: 8,
                md: 10
              },
              right: {
                xs: 5,
                sm: 8,
                md: 10
              },
              backgroundColor: 'rgba(25, 118, 210, 0.85)',
              color: 'white',
              padding: {
                xs: '4px 8px',
                sm: '5px 10px',
                md: '6px 12px'
              },
              borderRadius: {
                xs: '16px',
                sm: '18px',
                md: '20px'
              },
              fontWeight: 'bold',
              fontSize: {
                xs: '0.75rem',
                sm: '0.8rem',
                md: '0.9rem'
              },
              backdropFilter: 'blur(5px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transform: {
                xs: 'scale(0.9)',
                sm: 'scale(0.95)',
                md: 'scale(1)'
              },
              transformOrigin: 'bottom right',
              transition: 'all 0.2s ease-in-out'
            }}>
              {product.ar} Ft
            </Box>
          </Box>
          

          <CardContent sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 1.5, sm: 2 },
            gap: 0.5
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                color: darkMode ? 'white' : '#333',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {product.nev}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{
                color: darkMode ? '#ccc' : '#555',
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                mt: 'auto',
                mb: 1
              }}
            >
              {product.termekleiras}
            </Typography>

            <Typography 
                variant="body2" 
                sx={{
                  color: product.keszlet <= 5 
                    ? '#f44336'
                    : (darkMode ? '#8bc34a' : '#4caf50'), 
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                  fontWeight: 500,
                  mt: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {product.keszlet <= 0 ? (
                  'Elfogyott'
                ) : product.keszlet <= 5 ? (
                  `Utolsó ${product.keszlet} darab!`
                ) : (
                  'Készleten'
                )}
              </Typography>
            
            <Box sx={{ 
              mt: 'auto', 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Button 
                size="small" 
                sx={{
                  minWidth: 'auto',
                  color: darkMode ? '#90caf9' : '#1976d2',
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.08)',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.15)'
                  }
                }}
              >
                Részletek
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Link>
      
      <Box sx={{
          position: 'absolute',
          top: {
            xs: '5px',
            sm: '8px',
            md: '10px'
          },
          right: {
            xs: '5px',
            sm: '8px',
            md: '10px'
          },
          zIndex: 10,
          backgroundColor: darkMode ? 'rgba(34, 34, 34, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
          padding: {
            xs: '2px',
            sm: '3px',
            md: '4px'
          },
          transform: {
            xs: 'scale(0.8)',
            sm: 'scale(0.9)',
            md: 'scale(1)'
          },
          transformOrigin: 'top right',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s ease-in-out'
        }}>
          <ShareProduct 
            product={product} 
            darkMode={darkMode} 
            source="oterm" 
            size={{
              xs: 'small',
              sm: 'medium',
              md: 'large'
            }}
          />
        </Box>
    </Box>
  </Grid>
))}
  </Grid>
)}




          
{showLogoutAlert && (
  <Box
    sx={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1400,
      animation: 'popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      '@keyframes popIn': {
        '0%': {
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.5)',
        },
        '50%': {
          transform: 'translate(-50%, -50%) scale(1.05)',
        },
        '100%': {
          opacity: 1,
          transform: 'translate(-50%, -50%) scale(1)',
        },
      },
      width: { xs: 'calc(100% - 32px)', sm: 'auto' },
      maxWidth: '100%',
      px: { xs: 2, sm: 0 }
    }}
  >
    <Card
      sx={{
        minWidth: { xs: 'auto', sm: 350 },
        width: { xs: '100%', sm: 'auto' },
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
        p: { xs: 2.5, sm: 4 },
        '@media (max-width: 320px)': {
          p: 2
        }
      }}>
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 2, sm: 3 },
          '@media (max-width: 320px)': {
            mb: 1.5
          }
        }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '1.1rem', sm: '1.5rem' },
              background: darkMode
                ? 'linear-gradient(45deg, #90caf9, #42a5f5)'
                : 'linear-gradient(45deg, #1976d2, #1565c0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '@media (max-width: 320px)': {
                fontSize: '1rem'
              }
            }}
          >
            Kijelentkezés
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: darkMode ? '#aaa' : '#666',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '@media (max-width: 320px)': {
                fontSize: '0.8rem'
              }
            }}
          >
            Biztosan ki szeretnél jelentkezni?
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, sm: 2 },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            '@media (min-width: 400px)': {
              flexDirection: 'row'
            }
          }}
        >
          <Button
            onClick={() => setShowLogoutAlert(false)}
            sx={{
              flex: 1,
              py: { xs: 1, sm: 1.5 },
              borderRadius: { xs: '8px', sm: '12px' },
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)',
              color: darkMode ? '#90caf9' : '#1976d2',
              transition: 'all 0.2s ease',
              fontSize: { xs: '0.9rem', sm: 'inherit' },
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                transform: { xs: 'none', sm: 'translateY(-2px)' },
              },
              '@media (max-width: 320px)': {
                py: 0.75,
                fontSize: '0.8rem'
              }
            }}
          >
            Mégse
          </Button>
          <Button
            onClick={confirmLogout}
            sx={{
              flex: 1,
              py: { xs: 1, sm: 1.5 },
              borderRadius: { xs: '8px', sm: '12px' },
              background: darkMode
                ? 'linear-gradient(45deg, #90caf9, #42a5f5)'
                : 'linear-gradient(45deg, #1976d2, #1565c0)',
              color: '#fff',
              transition: 'all 0.2s ease',
              fontSize: { xs: '0.9rem', sm: 'inherit' },
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                boxShadow: { xs: 'none', sm: '0 5px 15px rgba(0,0,0,0.3)' },
              },
              '@media (max-width: 320px)': {
                py: 0.75,
                fontSize: '0.8rem'
              }
            }}
          >
            Kijelentkezés
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}


<InactivityAlert darkMode={darkMode} inactivityTimeout={120000} />
      
      </Container>
        <Box sx={{ 
      backgroundColor: darkMode ? '#333' : '#f5f5f5',
      backgroundImage: darkMode 
        ? 'radial-gradient(#444 1px, transparent 1px)'
        : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      pb: 8 
    }}>
    </Box>
        <Footer />
      </div>
    );
  };
  
  export default Oterm;
  
  