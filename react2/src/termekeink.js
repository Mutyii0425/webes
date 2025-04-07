import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  FormGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Popper,
  Grow,
  useMediaQuery,
  Paper,
  ClickAwayListener,
  MenuList,
  Grid,
  Badge,
  FormHelperText
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Footer from './footer';
import Menu from './menu2';
import PersonIcon from '@mui/icons-material/Person';
import SizeChart from './SizeChart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InactivityAlert from './InactivityAlert';
import InventoryIcon from '@mui/icons-material/Inventory';



const imageMap = {};
const images = require.context('../../adaliclothing-mvc/backend/kep', false, /\.(png|jpg|jpeg)$/);
    images.keys().forEach((key) => {
      const imageName = key.replace('./', '');
      imageMap[imageName] = images(key);
    });
    

export default function TermekReszletek() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loginAlert, setLoginAlert] = useState(false);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [userName, setUserName] = useState('');
  const anchorRef = useRef(null);
   const isExtraSmall = useMediaQuery('(max-width:400px)');
  const [cartAlert, setCartAlert] = useState(false);
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [error, setError] = useState(null);



 
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        
        const response = await fetch(`http://localhost:5000/termekek/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Nem sikerült betölteni a terméket');
        }
        
        const data = await response.json();
        console.log('Termék adatok:', data);
        setProduct(data);
      } catch (error) {
        console.error('Hiba a termék betöltésekor:', error);
        setError('Nem sikerült betölteni a terméket');
      }
    };
    
    fetchProduct();
  }, [id]);

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

  const getSizeOptions = (product) => {
   
    if (product.imageUrl.toLowerCase().includes('zokni') || 
        product.nev.toLowerCase().includes('zokni') || 
        product.kategoriaId === 3) {
      return ['36-39', '40-44', '45-50'];
    }
    return ['S', 'M', 'L', 'XL', 'XXL'];
  };
  

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError('Kérlek válassz méretet!');
      return;
    }
    setSizeError('');
    
    // Készlet ellenőrzés
    if (product.keszlet <= 0) {
      setCartAlert(false);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return;
    }
    
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
    const existingItem = cartItems.find(item => item.id === product.id && item.size === selectedSize);
  
    // Ellenőrizzük, hogy a kosárba helyezés után nem lépjük-e túl a készletet
    const currentQuantityInCart = existingItem ? existingItem.mennyiseg : 0;
    if (currentQuantityInCart + 1 > product.keszlet) {
      setCartAlert(false);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return;
    }
  
    if (existingItem) {
      existingItem.mennyiseg += 1;
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
      const newItem = {
        ...product,
        size: selectedSize,
        mennyiseg: 1
      };
      cartItems.push(newItem);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
    
    setCartAlert(true);
  };

  if (!product) return <div>Loading...</div>;

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
  minHeight: '100%',  
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '1rem',   
  gap: '1rem',       
  transition: 'all 0.3s ease-in-out'
}}>
<Card
  sx={{
    width: { xs: '100%', sm: '90%', md: '1000px' },
    maxWidth: '100%',
    margin: '0 auto',
    marginTop: { xs: '60px', sm: '80px' }, // Add top margin to clear the Dark Mode toggle
    background: darkMode
      ? 'linear-gradient(145deg, rgba(51, 51, 51, 0.9), rgba(68, 68, 68, 0.9))'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 245, 0.9))',
    backdropFilter: 'blur(8px)',
    borderRadius: { xs: '12px', sm: '16px' },
    overflow: 'hidden',
    boxShadow: darkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
    animation: 'fadeIn 0.6s ease-out',
    transform: 'translateY(0)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: { xs: 'none', md: 'translateY(-4px)' },
      boxShadow: darkMode
        ? '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.15)'
        : '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(0, 0, 0, 0.08)'
    }
  }}
>
  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 2, sm: 3 },
      alignItems: 'center'
    }}>
      <Box sx={{
        width: { xs: '100%', sm: '250px', md: '300px' },
        height: { xs: '250px', sm: '250px', md: '300px' },
        borderRadius: { xs: '8px', sm: '12px' },
        overflow: 'hidden',
        background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        padding: { xs: '4px', sm: '8px' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: { xs: 'center', md: 'flex-start' }
      }}>
        <img
          src={imageMap[product.imageUrl]}
          alt={product.nev}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
            transition: 'transform 0.3s ease',
          }}
        />
      </Box>

      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 0.8, sm: 1, md: 1.2 },
        width: { xs: '100%', md: 'auto' }
      }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
            background: darkMode
              ? 'linear-gradient(45deg, #fff, #ccc)'
              : 'linear-gradient(45deg, #333, #666)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: { xs: 'center', md: 'left' },
            mb: 0.5
          }}
        >
          {product.nev}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: darkMode ? '#90caf9' : '#1976d2',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
            justifyContent: { xs: 'center', md: 'flex-start' },
            mb: 0.5
          }}
        >
          {product.ar.toLocaleString()} Ft
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: darkMode ? '#fff' : '#666',
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            p: { xs: 1, sm: 1.5 },
            borderRadius: '8px',
            lineHeight: 1.5,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            maxHeight: { xs: '100px', sm: '150px', md: 'none' },
            overflow: { xs: 'auto', md: 'visible' },
            mb: 0.5
          }}
        >
          {product.termekleiras}
        </Typography>
       
        <FormControl fullWidth error={!!sizeError} sx={{ mt: 0.5, mb: 0.5 }}>
          <InputLabel sx={{
            color: darkMode ? '#fff' : 'inherit',
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            Válassz méretet
          </InputLabel>
          <Select
            value={selectedSize}
            onChange={(e) => {
              setSelectedSize(e.target.value);
              setSizeError('');
            }}
            sx={{
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
              color: darkMode ? '#fff' : 'inherit',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              height: { xs: '40px', sm: '48px' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              },
              '& .MuiSvgIcon-root': {
                color: darkMode ? '#fff' : 'inherit'
              }
            }}
          >
            {getSizeOptions(product).map((size) => (
              <MenuItem key={size} value={size}>{size}</MenuItem>
            ))}
          </Select>
          {sizeError && <FormHelperText>{sizeError}</FormHelperText>}
        </FormControl>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mt: 0.5,
          mb: 0.5,
          p: 1,
          borderRadius: '8px',
          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          border: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        }}>
          <InventoryIcon sx={{
            color: product.keszlet <= 0
              ? '#f44336'
              : product.keszlet <= 5
                ? '#ff9800'
                : '#4caf50',
            fontSize: '1.2rem'
          }} />
         
          <Typography
            variant="body2"
            sx={{
              color: product.keszlet <= 0
                ? '#f44336'
                : product.keszlet <= 5
                  ? '#ff9800'
                  : (darkMode ? '#8bc34a' : '#4caf50'),
              fontWeight: 500,
            }}
          >
            {product.keszlet <= 0
              ? 'Nincs készleten'
              : product.keszlet <= 5
                ? `Utolsó ${product.keszlet} darab`
                : 'Készleten'}
            {product.keszlet > 0 && ` (${product.keszlet} db)`}
          </Typography>
        </Box>

        <Button
          onClick={() => setSizeChartOpen(true)}
          variant="text"
          size="small"
          startIcon={<InfoOutlinedIcon fontSize="small" />}
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            color: darkMode ? '#90caf9' : '#1976d2',
            textTransform: 'none',
            padding: '2px 6px',
            marginTop: 0,
            marginBottom: 0.5,
            borderRadius: '4px',
            alignSelf: 'flex-start',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.08)',
            }
          }}
        >
          Részletes mérettáblázat
        </Button>

        <Button
          onClick={handleAddToCart}
          sx={{
            mt: 0.5,
            py: { xs: 0.8, sm: 1 },
            px: { xs: 2, sm: 3 },
            borderRadius: '10px',
            background: darkMode
              ? 'linear-gradient(45deg, #90caf9, #42a5f5)'
              : 'linear-gradient(45deg, #1976d2, #1565c0)',
            color: '#fff',
            fontWeight: 600,
            letterSpacing: '0.5px',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: { xs: 'none', md: 'translateY(-2px)' },
              boxShadow: { xs: 'none', md: '0 5px 15px rgba(0,0,0,0.3)' }
            }
          }}
        >
          Kosárba
        </Button>
      </Box>
    </Box>
  </CardContent>
</Card>


</div>

<Box sx={{
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  px: { xs: 1, sm: 2, md: 4 },
  py: { xs: 1, sm: 2, md: 3 }
}}>
  <Typography
    variant="h5"
    gutterBottom
    sx={{
      textAlign: 'center',
      mb: { xs: 1, sm: 2, md: 3 },
      fontSize: { xs: '1rem', sm: '1.3rem', md: '1.5rem' }
    }}
  >
    Termék részletek
  </Typography>

  <Grid
    container
    spacing={{ xs: 1, sm: 2, md: 4 }}
    sx={{ 
      px: { xs: 0.5, sm: 0, md: 0 } // Add padding to container on mobile
    }}
  >
    <Grid item xs={6.5} sm={6} md={6}>
      <Box sx={{
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: { xs: 1, md: 2 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.15rem' },
            fontWeight: 600,
            mb: { xs: 0.5, sm: 1 }
          }}
        >
          Anyagösszetétel
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
            mb: { xs: 1, sm: 1.5 }
          }}
        >
          100% pamut
        </Typography>
       
        <Typography
          variant="h6"
          sx={{
            mt: { xs: 0.5, sm: 1, md: 2 },
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.15rem' }
          }}
          gutterBottom
        >
          Mosási útmutató
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' }
          }}
        >
          40 fokon mosható
        </Typography>
      </Box>
    </Grid>
   
    <Grid item xs={5} sm={5.5} md={5.5} sx={{ 
      ml: { xs: 0.5, sm: 0.5, md: 0.5 },
      pr: { xs: 1, sm: 0, md: 0 } // Add right padding on mobile
    }}>
      <Box sx={{
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: { xs: 1, md: 2 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: { xs: '95%', sm: '100%', md: '100%' } // Make box narrower on mobile
      }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.15rem' },
            fontWeight: 600,
            mb: { xs: 0.5, sm: 1 }
          }}
        >
          Szállítási információk
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
            mb: { xs: 1, sm: 1.5 }
          }}
        >
          2-3 munkanapon belül
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
            mb: { xs: 1, sm: 1.5 }
          }}
        >
          Ingyenes kiszállítás minden 20.000 Ft feletti rendelés esetén!
        </Typography>
       
        <Typography
          variant="h6"
          sx={{
            mt: { xs: 0.5, sm: 1, md: 2 },
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1.15rem' }
          }}
          gutterBottom
        >
          Garancia
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' }
          }}
        >
          30 napos pénzvisszafizetési garancia
        </Typography>
      </Box>
    </Grid>
  </Grid>
</Box>

<SizeChart 
  open={sizeChartOpen} 
  onClose={() => setSizeChartOpen(false)} 
  productType={product.kategoriaId} 
  darkMode={darkMode} 
/>

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
{cartAlert && (
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
            onClick={() => setCartAlert(false)}
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
      px: { xs: 2, sm: 0 },
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
        
        {/* Only the login button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: 1, sm: 2 }
          }}
        >
          <Button
            onClick={() => {
              setLoginAlert(false);
              navigate('/sign');
            }}
            sx={{
              py: { xs: 1, sm: 1.5 },
              px: { xs: 3, sm: 4 },
              borderRadius: { xs: '8px', sm: '12px' },
              background: 'linear-gradient(45deg, #FF9800, #F57C00)',
              color: '#fff',
              transition: 'all 0.2s ease',
              fontSize: { xs: '0.9rem', sm: 'inherit' },
              fontWeight: 500,
              minWidth: { xs: '120px', sm: '150px' },
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
            Bejelentkezés
          </Button>
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
    }}
  >
    <Card
      sx={{
        minWidth: 350,
        backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: darkMode ? '#fff' : '#000',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #f44336, #ff9800)',
          animation: 'loadingBar 2s ease-in-out',
          '@keyframes loadingBar': {
            '0%': { width: '0%' },
            '100%': { width: '100%' }
          }
        }}
      />
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              mb: 1,
              background: 'linear-gradient(45deg, #f44336, #ff9800)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Készlet probléma
          </Typography>
          <Typography variant="body1" sx={{ color: darkMode ? '#aaa' : '#666' }}>
            {product.keszlet <= 0 
              ? 'Sajnos ez a termék jelenleg nincs készleten.' 
              : 'Nincs elég termék készleten a kért mennyiséghez.'}
          </Typography>
        </Box>
        <Button
          onClick={() => setShowAlert(false)}
          sx={{
            width: '100%',
            py: 1.5,
            borderRadius: '12px',
            background: darkMode 
              ? 'linear-gradient(45deg, #90caf9, #42a5f5)' 
              : 'linear-gradient(45deg, #1976d2, #1565c0)',
            color: '#fff',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            }
          }}
        >
          Értem
        </Button>
      </CardContent>
    </Card>
  </Box>
)}

<InactivityAlert darkMode={darkMode} inactivityTimeout={120000} />
      
<Box sx={{ 
      backgroundColor: darkMode ? '#333' : '#f5f5f5',
      backgroundImage: darkMode 
        ? 'radial-gradient(#444 1px, transparent 1px)'
        : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      pb: 15
    }}>
    </Box>
<Footer sx={{
  backgroundColor: darkMode ? '#333' : '#f5f5f5',
  backgroundImage: darkMode 
    ? 'radial-gradient(#444 1px, transparent 1px)'
    : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  backdropFilter: 'blur(8px)',
  borderTop: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out'
}} />
    </div>
  );
}

