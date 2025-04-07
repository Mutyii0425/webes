
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Badge,
  CardContent,
  IconButton,
  FormGroup,
  FormControlLabel,
  Switch,
  Popper,
  Grow,
  useMediaQuery,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Grid,
  Avatar
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Footer from './footer';
import Menu from './menu2';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonIcon from '@mui/icons-material/Person';
import UserRating from './UserRating';
import UploaderRatingBadge from './UploaderRatingBadge';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import InactivityAlert from './InactivityAlert';




export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginAlert, setLoginAlert] = useState(false);
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('');
   const isExtraSmall = useMediaQuery('(max-width:400px)');
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [error, setError] = useState(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const anchorRef = React.useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const uniqueImages = [...new Set([product?.imageUrl, ...(product?.images || [])])];
  const [feltolto, setFeltolto] = useState(null);
  const [feltoltoKep, setFeltoltoKep] = useState(null);
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [showRatings, setShowRatings] = useState(false);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://adaliclothing.onrender.com/products/${id}`);
        const data = await response.json();
        
        let imagesArray = [];
        try {
          imagesArray = data.images ? JSON.parse(data.images) : [];
        } catch (e) {
          console.log('Images parsing failed, using empty array');
        }
        
        setProduct({
          ...data,
          images: imagesArray
        });
        
      
        if (data.feltolto) {
          setFeltolto(data.feltolto);
          
        
          try {
            const profileResponse = await fetch(`https://adaliclothing.onrender.com/profile-image/${data.feltolto}`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              if (profileData.success && profileData.profileImage) {
                setFeltoltoKep(profileData.profileImage);
              }
            }
          } catch (error) {
            console.error('Hiba a profilkép lekérésekor:', error);
          }
        }
      
        setMainImage(data.imageUrl);
        setAdditionalImages(imagesArray);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError('Nem sikerült betölteni a termék adatait');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event = {}) => {
    if (event.target && anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };
  const handleImageNavigation = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
    }
  };
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
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

  const toggleSideMenu = () => {
    setSideMenuActive((prev) => !prev);
  };

  const handleCartClick = () => {
    navigate('/kosar');
  };
  const addToCart = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      setLoginAlert(true);
      setTimeout(() => {
        setLoginAlert(false);
        navigate('/sign');
      }, 2000);
      return;
    }
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItem = cartItems.find(item => item.id === product.id);
  
    if (existingItem) {
      existingItem.mennyiseg += 1;
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
      const newItem = {
        ...product,
        mennyiseg: 1
      };
      cartItems.push(newItem);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
    setShowAlert(true);
  };

  if (!product) return <div>Loading...</div>;
  const fadeInAnimation = {
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' }
    }
  };

  const handleCloseDialog = () => {
    setShowRatings(false);
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
                            <Typography variant="body1" sx={{ fontSize: isExtraSmall ? '0.8rem' : 'inherit' }}>
                            {(() => {
                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                if (user.kupon) {
                                  if (user.kupon_hasznalva) {
                                    return `Kupon: ${user.kupon} (Felhasználva)`;
                                  } else if (user.kupon === 'Nincs nyeremény') {
                                    return `Kupon: ${user.kupon} `;
                                  } else {
                                    return `Kupon: ${user.kupon} (Aktív)`;
                                  }
                                } else {
                                  return 'Nincs kuponod';
                                }
                              })()}
                            </Typography>
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
        <div style={{
        backgroundColor: darkMode ? '#333' : '#f5f5f5',
        backgroundImage: darkMode 
          ? 'radial-gradient(#444 1px, transparent 1px)'
          : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        transition: 'all 0.3s ease-in-out'
      }}>
       <Card sx={{
  width: { xs: '95%', sm: '90%' },
  maxWidth: '1200px',
  background: darkMode
    ? 'linear-gradient(145deg, rgba(51, 51, 51, 0.9), rgba(68, 68, 68, 0.9))'
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 245, 0.9))',
  backdropFilter: 'blur(8px)',
  borderRadius: { xs: '12px', sm: '16px' },
  overflow: 'hidden',
  boxShadow: darkMode
    ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
    : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.15)' 
    : '1px solid rgba(0, 0, 0, 0.2)',
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  margin: '0 auto'
}}>
  <Box sx={{
    flex: { xs: '1', md: '1.5' },
    p: { xs: 2, sm: 2.5, md: 3 },
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 1.5, sm: 2, md: 3 }
  }}>
    <Box sx={{
  width: '100%',
  height: { xs: '250px', sm: '300px', md: '400px' },
  borderRadius: { xs: '8px', sm: '10px', md: '12px' },
  overflow: 'hidden',
  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.15)' 
    : '1px solid rgba(0, 0, 0, 0.2)',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
      <IconButton
  onClick={() => handleImageNavigation('prev')}
  sx={{
    position: 'absolute',
    left: { xs: 5, sm: 10 },
    zIndex: 2,
    background: darkMode 
      ? 'rgba(255,255,255,0.2)' 
      : 'rgba(0,0,0,0.1)',
    border: darkMode 
      ? '1px solid rgba(255, 255, 255, 0.3)' 
      : '1px solid rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(4px)',
    width: { xs: '30px', sm: '40px' },
    height: { xs: '30px', sm: '40px' },
    '&:hover': {
      background: darkMode 
        ? 'rgba(255,255,255,0.3)' 
        : 'rgba(0,0,0,0.2)',
    }
  }}
>
  <ArrowBackIosIcon sx={{ 
    fontSize: { xs: '0.8rem', sm: '1.2rem' },
    color: darkMode ? '#fff' : '#000'
  }} />
</IconButton>

      <img
        src={uniqueImages[currentImageIndex]}
        alt={product.nev}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />

      <IconButton
        onClick={() => handleImageNavigation('next')}
        sx={{
          position: 'absolute',
          right: { xs: 5, sm: 10 },
          zIndex: 2,
    background: darkMode 
      ? 'rgba(255,255,255,0.2)' 
      : 'rgba(0,0,0,0.1)',
    border: darkMode 
      ? '1px solid rgba(255, 255, 255, 0.3)' 
      : '1px solid rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(4px)',
    width: { xs: '30px', sm: '40px' },
    height: { xs: '30px', sm: '40px' },
    '&:hover': {
      background: darkMode 
        ? 'rgba(255,255,255,0.3)' 
        : 'rgba(0,0,0,0.2)',
          }
        }}
      >
        <ArrowForwardIosIcon sx={{ fontSize: { xs: '0.8rem', sm: '1.2rem' },
    color: darkMode ? '#fff' : '#000' }} />
      </IconButton>
    </Box>

    <Grid container spacing={{ xs: 0.5, sm: 1 }}>
      {uniqueImages.map((img, index) => (
        <Grid item xs={3} key={index}>
          <Box
  sx={{
    height: { xs: '50px', sm: '60px', md: '80px' },
    borderRadius: { xs: '4px', sm: '6px', md: '8px' },
    overflow: 'hidden',
    cursor: 'pointer',
    border: currentImageIndex === index
      ? darkMode 
        ? '2px solid #90caf9' 
        : '2px solid #1976d2'
      : darkMode 
        ? '1px solid rgba(255, 255, 255, 0.2)' 
        : '1px solid rgba(0, 0, 0, 0.2)',
    '&:hover': { opacity: 0.8 },
    mx: { xs: 0.25, sm: 0.5 }
  }}
  onClick={() => handleThumbnailClick(index)}
>

            <img
              src={img}
              alt={`${product.nev} - ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>

  <Box sx={{
    flex: { xs: '1', md: '1' },
    p: { xs: 2, sm: 3, md: 4 },
    background: darkMode
      ? 'linear-gradient(145deg, rgba(68, 68, 68, 0.9), rgba(51, 51, 51, 0.9))'
      : 'linear-gradient(145deg, rgba(248, 248, 248, 0.9), rgba(255, 255, 255, 0.9))',
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 1.5, sm: 2, md: 3 }
  }}>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 600,
        fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
        background: darkMode
          ? 'linear-gradient(45deg, #fff, #ccc)'
          : 'linear-gradient(45deg, #333, #666)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: { xs: 'center', md: 'left' }
      }}
    >
      {product.nev}
    </Typography>
    
    {product.feltolto && (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    mt: 2,
    gap: 1
  }}>
   <Avatar 
  src={feltoltoKep} 
  alt={product.feltolto}
  sx={{ 
    width: 32, 
    height: 32,
    bgcolor: !feltoltoKep ? '#1976d2' : 'transparent'
  }}
>
  {!feltoltoKep && product.feltolto.charAt(0).toUpperCase()}
</Avatar>
    <Typography 
      variant="body2" 
      sx={{ fontWeight: 500 }}
    >
      {product.feltolto}
    </Typography>
    
    {/* Feltöltő értékelése */}
    <UploaderRatingBadge 
      username={product.feltolto} 
      darkMode={darkMode}
      onClick={() => setShowRatings(true)}
    />
  </Box>
)}

    <Typography
      variant="h6"
      sx={{
        color: darkMode ? '#90caf9' : '#1976d2',
        fontWeight: 600,
        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
        textAlign: { xs: 'center', md: 'left' }
      }}
    >
      {product.ar.toLocaleString()} Ft
    </Typography>

    <Typography
  variant="body1"
  sx={{
    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    p: { xs: 1.5, md: 2 },
    color: darkMode ? '#fff' : '#333',
    border: darkMode 
      ? '1px solid rgba(255, 255, 255, 0.15)' 
      : '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: { xs: '6px', md: '8px' },
    lineHeight: 1.6,
    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
    maxHeight: { xs: '120px', sm: '150px', md: 'none' },
    overflow: { xs: 'auto', md: 'visible' }
  }}
>
  {product.leiras}
</Typography>

<Box sx={{
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 1, md: 2 },
  p: { xs: 1.5, md: 2 },
  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.15)' 
    : '1px solid rgba(0, 0, 0, 0.2)',
  borderRadius: { xs: '6px', md: '8px' },
  justifyContent: { xs: 'center', md: 'flex-start' }
}}>
  <Typography
    variant="body1"
    sx={{
      fontWeight: 600,
      color: darkMode ? '#fff' : '#333',
      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
    }}
  >
    Méret:
  </Typography>
  <Typography
    variant="body1"
    sx={{
      color: darkMode ? '#fff' : '#333',
      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
    }}
  >
    {product.meret}
  </Typography>
</Box>
<Button
  onClick={addToCart}
  sx={{
    py: { xs: 1, sm: 1.25, md: 1.5 },
    px: { xs: 2, sm: 2.5, md: 3 },
    borderRadius: { xs: '8px', md: '10px' },
    background: darkMode
      ? 'linear-gradient(45deg, #90caf9, #42a5f5)'
      : 'linear-gradient(45deg, #1976d2, #1565c0)',
    color: '#fff',
    fontWeight: 600,
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
    alignSelf: { xs: 'center', md: 'flex-start' },
    width: { xs: '80%', sm: 'auto' },
    border: darkMode 
      ? '1px solid rgba(255, 255, 255, 0.3)' 
      : '1px solid rgba(0, 0, 0, 0.1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    }
  }}
>
  Kosárba
</Button>
  </Box>
</Card>

</div>

{showAlert && (
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
            Sikeres hozzáadás!
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
            onClick={() => setShowAlert(false)}
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
            Vásárlás folytatása
          </Button>
          <Button
            onClick={() => navigate('/kosar')}
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
            Rendelés leadása
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}

{loginAlert && (
  <Box
    sx={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1400,
      width: { xs: 'calc(100% - 32px)', sm: 'auto' },
      maxWidth: '100%',
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
          background: 'linear-gradient(90deg, #FF9800, #F57C00)',
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
                ? 'linear-gradient(45deg, #FF9800, #F57C00)'
                : 'linear-gradient(45deg, #FB8C00, #EF6C00)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '@media (max-width: 320px)': {
                fontSize: '1rem'
              }
            }}
          >
            Bejelentkezés szükséges!
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
            A vásárláshoz kérjük, jelentkezz be!
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Box>
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

<Dialog
  open={showRatings}
  onClose={() => setShowRatings(false)}
  maxWidth="md"
  fullWidth
  PaperProps={{
    sx: {
      backgroundColor: darkMode ? '#333' : '#fff',
      color: darkMode ? '#fff' : '#333',
      borderRadius: '12px',
    }
  }}
>
  <DialogTitle 
    sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid',
      borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    }}
  >

    <div>
      {product.feltolto} értékelései
    </div>
    <IconButton 
      onClick={() => setShowRatings(false)}
      size="small"
      sx={{
        color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </DialogTitle>
  <DialogContent sx={{ p: 3 }}>
    <UserRating 
      username={product.feltolto} 
      darkMode={darkMode}
      onClose={() => setShowRatings(false)} 
    />
  </DialogContent>
</Dialog>

<InactivityAlert darkMode={darkMode} inactivityTimeout={120000} />
      
        <Footer />
    </div>
  );
}