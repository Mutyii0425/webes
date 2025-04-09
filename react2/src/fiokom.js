import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent,
  Avatar,
  Grid,
  Paper,
  Divider,
  IconButton,
  FormGroup,
  FormControlLabel,
  Switch,
  Badge,
  Stack,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SecurityIcon from '@mui/icons-material/Security';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Menu from './menu2';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import InactivityAlert from './InactivityAlert';

export default function Fiokom() {
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const navigate = useNavigate();
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    lastOrderDate: null
  });
  
  const [couponInfo, setCouponInfo] = useState({
    hasCoupon: false,
    couponCode: '',
    isUsed: false,
    coupons: {
      registration: null,
      email: null
    }
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("Retrieved user data:", user);
    if (user) {
      setUserData({
        email: user.email,
        username: user.username || user.felhasznalonev,
        kuponKod: user.kupon_kod || user.kuponKod || '' 
      });
      
      setCouponInfo({
        hasCoupon: !!user.kupon,
        couponCode: user.kupon || '',
        isUsed: !!user.kupon_hasznalva,
        kuponKod: user.kupon_kod || user.kuponKod || '' 
      });
      
    
      if (user.profileImage) {
        setProfileImage(user.profileImage);
      } else if (user.username || user.felhasznalonev) {
        loadProfileImage(user.username || user.felhasznalonev);
      }
    }
  }, []);
  
  const loadProfileImage = async (username) => {
    try {
      console.log("Profilkép betöltése:", username);
    } catch (error) {
      console.error('Hiba a profilkép betöltésekor:', error);
    }
  };
  
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'A kép mérete túl nagy. Kérjük, válassz 5MB-nál kisebb képet.',
        severity: 'error'
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target.result;
      
      try {
        if (userData && userData.username) {
   
          setIsLoading(true);

          const response = await fetch('https://adaliclothing.onrender.com/profile-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: userData.username,
              imageData: imageData
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
          
            setProfileImage(imageData);
            
            
            const user = JSON.parse(localStorage.getItem('user')) || {};
            user.profileImage = imageData;
            localStorage.setItem('user', JSON.stringify(user));
            
          
            window.dispatchEvent(new Event('profileImageUpdated'));
            
            setSnackbar({
              open: true,
              message: 'Profilkép sikeresen feltöltve',
              severity: 'success'
            });
          } else {
            throw new Error(result.message || 'Hiba történt a kép feltöltése során');
          }
        }
      } catch (error) {
        console.error('Hiba a profilkép feltöltése során:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Hiba történt a kép feltöltése során. Kérjük, próbáld újra később.',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      console.error('Hiba a fájl olvasása közben');
      setSnackbar({
        open: true,
        message: 'Nem sikerült beolvasni a képet. Kérjük, próbálj egy másik képet.',
        severity: 'error'
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.f_azonosito) {
      setIsLoading(true);
      fetch(`https://adaliclothing.onrender.com/api/order-stats/${user.f_azonosito}`)
        .then(res => {
          if (!res.ok) {
            
            if (res.status === 404) {
              return { totalOrders: 0, totalAmount: 0, lastOrderDate: null };
            }
            throw new Error(`HTTP hiba: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Fetched order stats:', data); 
          setOrderStats({
            totalOrders: data.totalOrders || 0,
            totalAmount: data.totalAmount || 0,
            lastOrderDate: data.lastOrderDate
          });
        })
        .catch(err => {
          console.log('Hiba:', err);
       
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userData]); 
  
  const toggleSideMenu = () => {
    setSideMenuActive(!sideMenuActive);
  };

  const handleCartClick = () => {
    navigate('/kosar');
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };


  

  useEffect(() => {
    const fetchCouponInfo = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.f_azonosito) {
          const response = await fetch(`https://adaliclothing.onrender.com/api/coupons/user-coupons/${user.f_azonosito}`);
          if (response.ok) {
            const coupons = await response.json();
            
      
            if (coupons && Array.isArray(coupons)) {
          
              const regCoupon = coupons.find(c => c.type === 'registration');
      
              const emailCoupon = coupons.find(c => c.type === 'email');
              
      
              setCouponInfo({
                hasCoupon: !!(regCoupon || emailCoupon),
                coupons: {
                  registration: regCoupon ? {
                    code: regCoupon.code,
                    isUsed: regCoupon.isUsed,
                    isExpired: regCoupon.isExpired,
                    discount: regCoupon.discount,
                    description: regCoupon.description || `${regCoupon.discount}% kedvezmény`,
                    expiryDate: regCoupon.expiryDate ? new Date(regCoupon.expiryDate) : null
                  } : null,
                  email: emailCoupon ? {
                    code: emailCoupon.code,
                    isUsed: emailCoupon.isUsed,
                    isExpired: emailCoupon.isExpired,
                    discount: emailCoupon.discount,
                    description: emailCoupon.description || `${emailCoupon.discount}% kedvezmény`,
                    expiryDate: emailCoupon.expiryDate ? new Date(emailCoupon.expiryDate) : null
                  } : null
                }
              });
            }
          }
        }
      } catch (error) {
        console.error('Hiba a kupon információk lekérésekor:', error);
      }
    };
    
    fetchCouponInfo();
  }, []);

  return (
    <Box sx={{ 
      backgroundColor: darkMode ? '#222' : '#f5f5f5',
      minHeight: '100vh',
      pb: 4,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: darkMode ? '#333' : '#f5f5f5',
        backgroundImage: darkMode 
        ? 'radial-gradient(#444 1px, transparent 1px)'
        : 'radial-gradient(#aaaaaa 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        color: darkMode ? 'white' : 'black',
        minHeight: '100vh',
        transition: 'all 0.3s ease-in-out' 
      }
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: darkMode ? '#333' : '#333',
          padding: '10px 20px',
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
          style={{ color: darkMode ? 'white' : 'white' }}
        >
          <MenuIcon />
        </IconButton>
      
        <Typography 
          variant="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: {
              xs: '1.1rem',    
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
        <IconButton
          onClick={handleCartClick}
          sx={{
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Badge 
            badgeContent={cartItemCount} 
            color="primary"
            sx={{ 
              '& .MuiBadge-badge': { 
                backgroundColor: '#fff', 
                color: '#333' 
              } 
            }}
          >
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </div>

      <Box sx={{
                position: 'fixed',
                top: 0,
                left: sideMenuActive ? 0 : '-250px',
                width: '250px',
                height: '100%',
                backgroundColor: '#fff',
                transition: 'left 0.3s',
                zIndex: 1200,
              }}>
                <Menu sideMenuActive={sideMenuActive} toggleSideMenu={toggleSideMenu} />
              </Box>
        
              <FormGroup
                sx={{
                  position: 'absolute',
                  top: 60,
                  right: 20,
                  zIndex: 1100
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      color="default"
                      sx={{
                        color: darkMode ? 'white' : 'black',
                      }}
                      checked={darkMode}
                      onChange={() => setDarkMode((prev) => !prev)}
                    />
                  }
                  label="Dark Mode"
                  sx={{ color: darkMode ? 'white' : 'black' }}
                />
              </FormGroup>
        
              <Container maxWidth="lg" sx={{
                mt: 8,
                backgroundColor: darkMode ? '#333' : '#f0f0f0',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
                zIndex: 1,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)' 
                  : '0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                
        
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
                  zIndex: 2
                },
                
        
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.03,
                  backgroundImage: darkMode
                    ? 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 20L20 0L40 20L20 40z\'/%3E%3C/g%3E%3C/svg%3E")'
                    : 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 20L20 0L40 20L20 40z\'/%3E%3C/g%3E%3C/svg%3E")',
                  zIndex: -1
                },
                
        
                animation: 'fadeIn 0.5s ease-out',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' }
                },
        
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: darkMode 
                    ? '0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.15)' 
                    : '0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)'
                }
              }}>
                {isLoading && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1300,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <CircularProgress color="primary" />
                    <Typography variant="body2" sx={{ color: darkMode ? '#fff' : '#333' }}>
                      Adatok betöltése...
                    </Typography>
                  </Box>
                )}
        
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ 
                      backgroundColor: darkMode ? '#1c1c1c' : 'white',
                      color: darkMode ? 'white' : 'black',
                      borderRadius: '16px',
                      height: '100%',
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.2)'
                      }
                    }}>
             
                      <Box sx={{ 
                        position: 'relative', 
                        height: '120px', 
                        background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          opacity: 0.2,
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'
                        }} />
                      </Box>
          
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        py: 4, 
                        position: 'relative',
                        mt: -8
                      }}>
                     
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          ref={fileInputRef}
                          onChange={handleProfileImageUpload}
                        />
                        
                       
                        <Avatar 
                          src={profileImage}
                          sx={{ 
                            width: 120, 
                            height: 120, 
                            margin: '0 auto 20px',
                            backgroundColor: '#1976d2',
                            fontSize: '3rem',
                            border: '5px solid',
                            borderColor: darkMode ? '#1c1c1c' : 'white',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            position: 'relative',
                            '&:hover': {
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }
                            }
                          }}
                          onClick={openFileSelector}
                        >
                          {userData?.username?.charAt(0)?.toUpperCase() || 'A'}
                        </Avatar>
                        

                        <IconButton 
                          onClick={openFileSelector}
                          sx={{
                            position: 'absolute',
                            bottom: '65%',  
                            right: '35%',  
                            backgroundColor: darkMode ? 'rgba(25, 118, 210, 0.8)' : 'rgba(25, 118, 210, 0.9)',
                            color: '#fff',
                            width: '32px',
                            height: '32px',
                            '&:hover': {
                              backgroundColor: '#1976d2'
                            },
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            border: '2px solid',
                            borderColor: darkMode ? '#1c1c1c' : 'white',
                          }}
                        >
                          <PhotoCameraIcon fontSize="medium" />
                        </IconButton>
        
                        <Typography variant="h5" gutterBottom sx={{ 
                          fontWeight: 600,
                          mb: 1
                        }}>
                          {userData?.username || 'Felhasználó'}
                        </Typography>
                        
        
                        <Typography variant="body1" sx={{ 
                          color: darkMode ? '#aaa' : '#666',
                          mb: 3
                        }}>
                          {userData?.email || 'Email cím nincs megadva'}
                        </Typography>
                        
                        <Divider sx={{ my: 3 }} />
                        
                    
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666', mb: 1 }}>
                            Fiók státusz
                          </Typography>
                          <Box sx={{
                            display: 'inline-block',
                            backgroundColor: darkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                            color: darkMode ? '#90caf9' : '#1976d2',
                            borderRadius: '20px',
                            padding: '6px 16px',
                            fontWeight: 'medium',
                            fontSize: '0.875rem',
                            border: '1px solid',
                            borderColor: darkMode ? 'rgba(25, 118, 210, 0.5)' : 'rgba(25, 118, 210, 0.3)',
                          }}>
                            <Typography variant="body2">
                              {orderStats.totalOrders > 0 ? 'Aktív vásárló' : 'Új felhasználó'}
                            </Typography>
                          </Box>
                        </Box>
                        
                    
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666', mb: 1 }}>
                            Vásárlói szint
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            {(() => {
                          
                              let level, color;
                              if (orderStats.totalOrders >= 10) {
                                level = 'Arany';
                                color = '#FFD700';
                              } else if (orderStats.totalOrders >= 5) {
                                level = 'Ezüst';
                                color = '#C0C0C0';
                              } else if (orderStats.totalOrders >= 1) {
                                level = 'Bronz';
                                color = '#CD7F32';
                              } else {
                                level = 'Kezdő';
                                color = '#1976d2';
                              }
                              
                              return (
                                <>
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: '50%',
                                      backgroundColor: color
                                    }}
                                  />
                                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {level}
                                  </Typography>
                                </>
                              );
                            })()}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
        
                  <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                      <Paper sx={{ 
                        p: 3, 
                        backgroundColor: darkMode ? '#1c1c1c' : 'white',
                        color: darkMode ? 'white' : 'black',
                        borderRadius: '16px'
                      }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 1,
                          color: '#1976d2'
                        }}>
                          <PersonIcon /> Személyes Információk
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                              Felhasználónév
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {userData?.username || 'Nincs megadva'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                              Email Cím
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {userData?.email || 'Nincs megadva'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                      <Paper sx={{
  p: 3,
  backgroundColor: darkMode ? '#1c1c1c' : 'white',
  color: darkMode ? 'white' : 'black',
  borderRadius: '16px',
  mt: 3
}}>
  <Typography variant="h6" gutterBottom sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    color: '#1976d2'
  }}>
    <LocalOfferIcon /> Kupon Információk
  </Typography>
  <Divider sx={{ my: 2 }} />
  
  {couponInfo.hasCoupon && couponInfo.coupons ? (
  <Box>
    {couponInfo.coupons.registration && (
      <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
            Regisztrációs kupon
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
              Kupon kód:
            </Typography>
            <Typography variant="body1" sx={{
              fontWeight: 'bold',
              backgroundColor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
              padding: '4px 12px',
              borderRadius: '4px',
              border: '1px dashed',
              borderColor: darkMode ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)',
            }}>
              {couponInfo.coupons.registration.code}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
              Kedvezmény:
            </Typography>
            <Typography variant="body1">
              {couponInfo.coupons.registration.description === 'Nincs nyeremény' 
                ? 'Nincs kedvezmény' 
                : `${couponInfo.coupons.registration.discount}%`}
            </Typography>
          </Box>
          
          {couponInfo.coupons.registration.expiryDate && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                Érvényesség:
              </Typography>
              <Typography variant="body1">
                {couponInfo.coupons.registration.expiryDate.toLocaleDateString('hu-HU')}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
              Státusz:
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: couponInfo.coupons.registration.isUsed 
                  ? (darkMode ? '#ff6b6b' : '#d32f2f') 
                  : couponInfo.coupons.registration.isExpired
                    ? (darkMode ? '#ff9800' : '#ed6c02')
                    : couponInfo.coupons.registration.description === 'Nincs nyeremény'
                      ? (darkMode ? '#aaa' : '#666')
                      : (darkMode ? '#4caf50' : '#2e7d32'),
                fontWeight: 'medium'
              }}
            >
              {couponInfo.coupons.registration.isUsed 
                ? 'Felhasználva' 
                : couponInfo.coupons.registration.isExpired
                  ? 'Lejárt'
                  : couponInfo.coupons.registration.description === 'Nincs nyeremény'
                    ? 'Nem alkalmazható'
                    : 'Aktív'
              }
            </Typography>
          </Box>
        </Box>
      )}
      
       {couponInfo.coupons.email && (
      
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
            Email kupon
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
              Kupon kód:
            </Typography>
            <Typography variant="body1" sx={{
              fontWeight: 'bold',
              backgroundColor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
              padding: '4px 12px',
              borderRadius: '4px',
              border: '1px dashed',
              borderColor: darkMode ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)',
            }}>
              {couponInfo.coupons.email.code}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
              Kedvezmény:
            </Typography>
            <Typography variant="body1">
              {couponInfo.coupons.email.description === 'Nincs nyeremény' 
                ? 'Nincs kedvezmény' 
                : `${couponInfo.coupons.email.discount}%`}
            </Typography>
          </Box>
          
          {couponInfo.coupons.email.expiryDate && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
                Érvényesség:
              </Typography>
              <Typography variant="body1">
                {couponInfo.coupons.email.expiryDate.toLocaleDateString('hu-HU')}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ color: darkMode ? '#aaa' : '#666' }}>
              Státusz:
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: couponInfo.coupons.email.isUsed 
                  ? (darkMode ? '#ff6b6b' : '#d32f2f') 
                  : couponInfo.coupons.email.isExpired
                    ? (darkMode ? '#ff9800' : '#ed6c02')
                    : couponInfo.coupons.email.description === 'Nincs nyeremény'
                      ? (darkMode ? '#aaa' : '#666')
                      : (darkMode ? '#4caf50' : '#2e7d32'),
                fontWeight: 'medium'
              }}
            >
              {couponInfo.coupons.email.isUsed 
                ? 'Felhasználva' 
                : couponInfo.coupons.email.isExpired
                  ? 'Lejárt'
                  : couponInfo.coupons.email.description === 'Nincs nyeremény'
                    ? 'Nem alkalmazható'
                    : 'Aktív'
              }
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  ) : (
    <Typography variant="body1" sx={{ textAlign: 'center', py: 2, color: darkMode ? '#aaa' : '#666' }}>
      Jelenleg nincs aktív kuponod. Figyelj az email értesítésekre vagy vegyél részt promóciókban kuponokért!
    </Typography>
  )}
</Paper>
              <Paper sx={{
                p: 3,
                backgroundColor: darkMode ? '#1c1c1c' : 'white',
                color: darkMode ? 'white' : 'black',
                borderRadius: '16px'
              }}>
                <Typography variant="h6" gutterBottom sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#1976d2'
                }}>
                  <SecurityIcon /> Fiók Statisztika
                </Typography>
                <Divider sx={{ my: 2 }} />
                {orderStats.totalOrders === 0 ? (
                  <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
                    Még nincs rendelésed. Nézz körül a termékek között!
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <LocalShippingIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                        <Typography variant="h6">{orderStats.totalOrders} db</Typography>
                        <Typography variant="body2">Leadott rendelések</Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <AttachMoneyIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                        <Typography variant="h6">
                          {typeof orderStats.totalAmount === 'number' ? orderStats.totalAmount.toLocaleString() : '0'} Ft
                        </Typography>
                        <Typography variant="body2">Összes rendelés értéke</Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CalendarTodayIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                        <Typography variant="h6">
                          {orderStats.lastOrderDate ? new Date(orderStats.lastOrderDate).toLocaleDateString() : '-'}
                        </Typography>
                        <Typography variant="body2">Utolsó rendelés dátuma</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      
     
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <InactivityAlert darkMode={darkMode} inactivityTimeout={120000} />
    </Box>
  );
}

                        
        
