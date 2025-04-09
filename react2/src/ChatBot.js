import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  FormGroup,
  FormControlLabel,
  Switch,
  Popper,
 
  useMediaQuery,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  TextField,
  Badge,
  Card,
  CardContent
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import StraightenIcon from '@mui/icons-material/Straighten';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Menu from './menu2';
import Footer from './footer';
import InactivityAlert from './InactivityAlert';






const predefinedResponses = {

  'szállítás': 'A szállítás általában 2-3 munkanapon belül történik. A 20.000 Ft feletti rendelések esetén a szállítás ingyenes.',
  'szállítási idő': 'A szállítás általában 2-3 munkanapon belül történik.',
  'szállítási díj': 'A szállítási díj 1.590 Ft, de 20.000 Ft feletti rendelés esetén ingyenes.',
  'házhozszállítás': 'Házhozszállítást a GLS futárszolgálattal biztosítunk, 2-3 munkanapon belül.',

  'fizetés': 'Fizetési módok: bankkártya, utánvét, átutalás.',
  'fizetési mód': 'Fizetési módok: bankkártya, utánvét, átutalás.',
  'bankkártya': 'Bankkártyás fizetés esetén a Barion biztonságos fizetési rendszerét használjuk.',
  'utánvét': 'Utánvétes fizetés esetén a csomag átvételekor fizethetsz a futárnak.',
  

  'méret': 'Ruházati termékeink S, M, L, XL, XXL méretekben, zoknijaink pedig 36-39, 40-44, 45-50 méretekben érhetők el. Részletes mérettáblázatot minden termék oldalán találsz.',
  'mérettáblázat': 'Részletes mérettáblázatot minden termék oldalán találsz a "Mérettáblázat" gombra kattintva.',
  'méretezés': 'Ruházati termékeink S, M, L, XL, XXL méretekben, zoknijaink pedig 36-39, 40-44, 45-50 méretekben érhetők el.',
  

  'visszaküldés': 'A termékeket 14 napon belül visszaküldheted. A visszaküldés költségét a vásárlónak kell állnia.',
  'garancia': 'Termékeinkre 30 napos pénzvisszafizetési garanciát vállalunk.',
  'csere': 'Ha nem megfelelő a méret, 14 napon belül kérhetsz cserét. Vedd fel velünk a kapcsolatot az adaliclothing@gmail.com email címen.',
  

  'anyag': 'Termékeink többsége 100% pamut, de az egyes termékek pontos anyagösszetételét a termékleírásnál találod.',
  'pamut': 'Pólóink és pulóvereink többsége 100% pamut anyagból készül.',
  

  'kupon': 'Kuponkódot csak az újonnan regisztrált felhasználók kapnak.',
  'kedvezmény': 'Aktuális kedvezményeidről a főoldalon, profil fülnél értesülhetsz. 20.000 Ft feletti rendelés esetén a szállítás ingyenes.',
  

  'kapcsolat': 'Kapcsolatfelvétel: adaliclothing@gmail.com vagy a +36-30-645-6285 telefonszámon munkanapokon 9-17 óra között.',
  'nyitvatartás': 'Webshopunk 0-24 órában elérhető. Ügyfélszolgálatunk munkanapokon 9-17 óra között áll rendelkezésedre.',
  'üzlet': 'Keszthelyi bemutatótermünk címe: 8360 Keszthely, Főtér 10. Nyitvatartás: H-P: 10-18, Szo: 10-14.',
};


const fallbackResponses = [
  'Sajnos nem értem pontosan a kérdésedet. Próbálj kérdezni a szállításról, fizetésről vagy méretezésről.',
  'Ebben sajnos nem tudok segíteni. Kérdezhetsz a termékekről, szállításról, fizetési módokról vagy méretezésről.',
  'Ezt a kérdést nem tudom megválaszolni. Ha sürgős segítségre van szükséged, írj az info@adaliclothing.hu címre vagy hívd ügyfélszolgálatunkat: +36-1-234-5678.'
];

const ChatBot = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [userName, setUserName] = useState('');
  const anchorRef = useRef(null);
  const isExtraSmall = useMediaQuery('(max-width:400px)');
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [showHelp, setShowHelp] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '' });


  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Üdvözöllek az Adali Clothing oldalán! Miben segíthetek?', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const findResponse = (query) => {

    const lowerQuery = query.toLowerCase();
    

    for (const [keyword, response] of Object.entries(predefinedResponses)) {
      if (lowerQuery.includes(keyword)) {
        return response;
      }
    }
  
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  };
  
  const handleSend = () => {
    if (input.trim() === '') return;
    

    setMessages(prev => [...prev, { text: input, isBot: false }]);

    setTimeout(() => {
      const botResponse = findResponse(input);
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 500);
    
    setInput('');
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

  const showToast = (message) => {
    setToast({ show: true, message });
   
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2000);
  };
  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('Szöveg másolva!');
      })
      .catch(err => {
        console.error('Másolási hiba:', err);
        showToast('Másolás sikertelen');
      });
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
        <Menu 
          sideMenuActive={sideMenuActive} 
          toggleSideMenu={toggleSideMenu} 
          darkMode={darkMode}
          setChatOpen={setIsOpen}
        />
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

    
      <Box sx={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: { xs: 'calc(100vh - 150px)', sm: 'calc(100vh - 200px)' },
  p: { xs: 1, sm: 2 },
  pt: { xs: 5, sm: 6 }, 
  mt: { xs: 2, sm: 0 }
}}>
  <Typography
    variant="h4"
    sx={{
      mb: { xs: 2, sm: 4 },
      textAlign: 'center',
      fontWeight: 600,
      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
      background: darkMode
        ? 'linear-gradient(45deg, #fff, #ccc)'
        : 'linear-gradient(45deg, #333, #666)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      px: { xs: 1, sm: 0 },
      width: '100%',
      maxWidth: { xs: '100%', sm: '90%', md: '80%' }
    }}
  >
    Segítség / GYIK
  </Typography>

        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            maxWidth: '800px',
            color: darkMode ? '#ccc' : '#666'
          }}
        >
          Üdvözlünk az Adali Clothing segítség oldalán! Itt választ kaphatsz a leggyakrabban felmerülő kérdésekre. 
          Kérdezz bátran a szállításról, fizetési módokról, méretezésről vagy bármi másról, amiben segíthetünk.
        </Typography>
        
 
        <Paper 
          sx={{
            width: { xs: '95%', sm: '80%', md: '600px' },
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: darkMode ? '#222' : '#fff',
            color: darkMode ? '#fff' : '#333',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 4
          }}
        >
    
    <Box sx={{ 
  p: 2, 
  borderBottom: '1px solid', 
  borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5'
}}>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <ChatIcon sx={{ color: darkMode ? '#60BA97' : '#1976d2' }} />
    <Typography variant="h6">Adali Asszisztens</Typography>
  </Box>
  <IconButton 
    onClick={() => setShowHelp(prev => !prev)}
    sx={{ color: darkMode ? '#60BA97' : '#1976d2' }}
  >
    <HelpOutlineIcon />
  </IconButton>
</Box>
          
     
          <Box sx={{ 
            flex: 1, 
            p: 2, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            backgroundColor: darkMode ? '#222' : '#fff'
          }}>
            {messages.map((msg, index) => (
              <Box 
                key={index}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: '80%',
                  backgroundColor: msg.isBot 
                    ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') 
                    : (darkMode ? '#1976d2' : '#e3f2fd'),
                  color: msg.isBot 
                    ? (darkMode ? '#fff' : '#333')
                    : (darkMode ? '#fff' : '#0d47a1'),
                  alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                  wordBreak: 'break-word'
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          

          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid', 
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5'
          }}>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => {
                setMessages(prev => [...prev, 
                  { text: 'Mennyi a szállítási idő?', isBot: false },
                  { text: predefinedResponses['szállítási idő'], isBot: true }
                ]);
              }}
              sx={{ 
                fontSize: '0.7rem',
                borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                color: darkMode ? '#fff' : '#333',
              }}
            >
              Szállítási idő
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => {
                setMessages(prev => [...prev, 
                  { text: 'Milyen méretekben kaphatók a termékek?', isBot: false },
                  { text: predefinedResponses['méret'], isBot: true }
                ]);
              }}
              sx={{ 
                fontSize: '0.7rem',
                borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                color: darkMode ? '#fff' : '#333',
              }}
            >
              Méretek
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => {
                setMessages(prev => [...prev, 
                  { text: 'Hogyan fizethetek?', isBot: false },
                  { text: predefinedResponses['fizetés'], isBot: true }
                ]);
              }}
              sx={{ 
                fontSize: '0.7rem',
                borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                color: darkMode ? '#fff' : '#333',
              }}
            >
              Fizetés
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => {
                setMessages(prev => [...prev, 
                  { text: 'Van garancia a termékekre?', isBot: false },
                  { text: predefinedResponses['garancia'], isBot: true }
                ]);
              }}
              sx={{ 
                fontSize: '0.7rem',
                borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                color: darkMode ? '#fff' : '#333',
              }}
            >
              Garancia
            </Button>
          </Box>
          
   
          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid', 
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
            display: 'flex',
            backgroundColor: darkMode ? '#222' : '#fff'
          }}>
            <TextField 
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Írd be kérdésed..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  color: darkMode ? '#fff' : '#333',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                  }
                },
                '& .MuiInputBase-input': {
                  color: darkMode ? '#fff' : '#333'
                }
              }}
            />
            <Button 
              onClick={handleSend}
              sx={{ 
                ml: 1,
                backgroundColor: darkMode ? '#1976d2' : '#1976d2',
                color: '#fff',
                '&:hover': {
                  backgroundColor: darkMode ? '#1565c0' : '#1565c0'
                }
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Paper>
        
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center',
            maxWidth: '800px',
            color: darkMode ? '#aaa' : '#777',
            mb: 4
          }}
        >
          Ha nem találod a választ a kérdésedre, írj nekünk az adaliclothing@gmail.com címre vagy hívj minket a +36-30-645-6285 telefonszámon munkanapokon 9-17 óra között.
        </Typography>
      </Box>

    
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
{showHelp && (
  <Box sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1500,
    backdropFilter: 'blur(5px)',
    animation: 'fadeIn 0.3s ease-out',
    '@keyframes fadeIn': {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    }
  }}>
    <Card sx={{
      width: { xs: '90%', sm: '450px' },
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      backgroundColor: darkMode ? '#222' : '#fff',
      color: darkMode ? '#fff' : '#333',
      borderRadius: '16px',
      boxShadow: darkMode
        ? '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        : '0 12px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      animation: 'scaleIn 0.3s ease-out',
      '@keyframes scaleIn': {
        '0%': { transform: 'scale(0.9)' },
        '100%': { transform: 'scale(1)' }
      }
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px'
      }}>
        <Typography variant="h6" sx={{
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <HelpOutlineIcon sx={{ color: darkMode ? '#60BA97' : '#1976d2' }} />
          Segítség
        </Typography>
        <IconButton
          onClick={() => setShowHelp(false)}
          sx={{
            color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: darkMode ? '#fff' : '#000'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
     
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{
          fontWeight: 600,
          mb: 2,
          color: darkMode ? '#60BA97' : '#1976d2'
        }}>
          Milyen kérdéseket tehetsz fel?
        </Typography>
       
        <Typography variant="body2" sx={{ mb: 2 }}>
          Az asszisztens a következő témákban tud segíteni:
        </Typography>
       
     

        {[
  { icon: <LocalShippingIcon fontSize="small" />, text: 'Szállítás (idő, díj, feltételek)' },
  { icon: <PaymentIcon fontSize="small" />, text: 'Fizetési módok (bankkártya, utánvét)' },
  { icon: <StraightenIcon fontSize="small" />, text: 'Méretezés és mérettáblázat' },
  { icon: <AssignmentReturnIcon fontSize="small" />, text: 'Garancia és visszaküldés' },
  { icon: <CategoryIcon fontSize="small" />, text: 'Anyagösszetétel' },
  { icon: <LocalOfferIcon fontSize="small" />, text: 'Kuponok és kedvezmények' },
  { icon: <ContactSupportIcon fontSize="small" />, text: 'Kapcsolatfelvétel' }
].map((item, index) => (
  <Box 
    key={index} 
    sx={{ 
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 1.5,
      mb: 1,
      borderRadius: '8px',
      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        transform: 'translateX(5px)'
      }
    }}
  >
    <Box sx={{
      width: 36,
      height: 36,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: darkMode ? 'rgba(96, 186, 151, 0.2)' : 'rgba(25, 118, 210, 0.1)',
      color: darkMode ? '#60BA97' : '#1976d2'
    }}>
      {item.icon}
    </Box>
    <Typography variant="body2" sx={{ flex: 1 }}>{item.text}</Typography>
    <IconButton
      size="small"
      onClick={() => handleCopy(item.text)}
      sx={{
        color: darkMode ? '#60BA97' : '#1976d2',
        '&:hover': {
          backgroundColor: darkMode ? 'rgba(96, 186, 151, 0.2)' : 'rgba(25, 118, 210, 0.1)',
        }
      }}
    >
      <ContentCopyIcon fontSize="small" />
    </IconButton>
  </Box>
))}


{toast.show && (
  <Box
    sx={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: darkMode ? '#333' : '#fff',
      color: darkMode ? '#fff' : '#333',
      padding: '8px 16px',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      zIndex: 9999,
      animation: 'fadeIn 0.3s',
      '@keyframes fadeIn': {
        '0%': {
          opacity: 0,
          transform: 'translate(-50%, 20px)'
        },
        '100%': {
          opacity: 1,
          transform: 'translate(-50%, 0)'
        }
      }
    }}
  >
    {toast.message}
  </Box>
)}

       
        <Typography variant="body2" sx={{
          mb: 2,
          fontStyle: 'italic',
          color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
        }}>
          Tipp: Próbálj egyszerű, rövid kérdéseket feltenni, amelyek tartalmazzák a kulcsszavakat (pl. "szállítás", "méret", stb.)
        </Typography>
       
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => setShowHelp(false)}
            sx={{
              mt: 1,
              px: 3,
              py: 1,
              borderRadius: '8px',
              backgroundColor: darkMode ? '#60BA97' : '#1976d2',
              color: '#fff',
              '&:hover': {
                backgroundColor: darkMode ? '#4e9d7e' : '#1565c0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Értem, köszönöm!
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}

<InactivityAlert darkMode={darkMode} inactivityTimeout={120000} />
      
          
            <Footer />
    </div>
  );
};

export default ChatBot;