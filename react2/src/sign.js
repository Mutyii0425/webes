import React, { useState, useEffect, useRef } from 'react';
import Menu from './menu2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import logo from './kep/fehlogo.png';
import { Card, CardContent } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import darkLogo from './kep/logo02.png';
import { Dialog, CircularProgress } from '@mui/material';
import { 
 
  useTheme,
  useMediaQuery
  
  
} from '@mui/material';

const randomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`; 
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [successAlert, setSuccessAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [email, setEmail] = useState(''); 
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

   const theme = useTheme();
            const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
            const isExtraSmall = useMediaQuery('(max-width:400px)');

  const dvdLogoRef = useRef({
      x: window.innerWidth * 0.1,  
      y: window.innerHeight * 0.1, 
      width: Math.min(150, window.innerWidth * 0.2), 
      height: Math.min(150, window.innerWidth * 0.2), 
      dx: Math.min(2, window.innerWidth * 0.003), 
      dy: Math.min(2, window.innerHeight * 0.003), 
      color: randomColor(),
    });

  useEffect(() => {
    const canvas = document.getElementById('dvdCanvas');
    const ctx = canvas.getContext('2d');
    const img = new Image(); 
    img.src = darkMode ? logo : darkLogo;
    
    let animationFrameId;
    let isComponentMounted = true; 
    
    const handleResize = () => {
      if (isComponentMounted) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        dvdLogoRef.current.width = Math.min(150, window.innerWidth * 0.2);
        dvdLogoRef.current.height = Math.min(150, window.innerWidth * 0.2);
        
        dvdLogoRef.current.dx = Math.min(2, window.innerWidth * 0.003);
        dvdLogoRef.current.dy = Math.min(2, window.innerHeight * 0.003);
      }
    };
  
    handleResize();
    window.addEventListener('resize', handleResize);
  
    const update = () => {
      if (!isComponentMounted) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      const radius = dvdLogoRef.current.width / 2;
      const centerX = dvdLogoRef.current.x + radius;
      const centerY = dvdLogoRef.current.y + radius;
      
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.clip();
      
      ctx.drawImage(
        img,
        dvdLogoRef.current.x,
        dvdLogoRef.current.y,
        dvdLogoRef.current.width,
        dvdLogoRef.current.height
      );
      
      ctx.restore();
      
      dvdLogoRef.current.x += dvdLogoRef.current.dx;
      dvdLogoRef.current.y += dvdLogoRef.current.dy;
      
      if (dvdLogoRef.current.x <= 0 || dvdLogoRef.current.x + dvdLogoRef.current.width >= canvas.width) {
        dvdLogoRef.current.dx *= -1;
      }
      
      if (dvdLogoRef.current.y <= 0 || dvdLogoRef.current.y + dvdLogoRef.current.height >= canvas.height) {
        dvdLogoRef.current.dy *= -1;
      }
      
      animationFrameId = requestAnimationFrame(update);
    };
  
    img.onload = update;
  
   
    
      return () => {
        isComponentMounted = false;
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        const canvas = document.getElementById('dvdCanvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
    }, [darkMode]);
    
  
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
  };
  

  const handleLogin = async (e) => {
    e.preventDefault();
    

    if (!validateEmail(email)) {
      setErrorTitle('Érvénytelen email cím');
      setErrorMessage('Kérjük, adj meg egy érvényes email címet.');
      setShowErrorDialog(true);
      return;
    }
    

    if (password.length < 6) {
      setErrorTitle('Érvénytelen jelszó');
      setErrorMessage('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
      setShowErrorDialog(true);
      return;
    }
    
    setIsLoading(true); 
    
    try {
      const response = await fetch('https://adaliclothing.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    
      const data = await response.json();
    
      if (!response.ok) {
        setErrorTitle('Bejelentkezési hiba');
        setErrorMessage(data.error || 'Hibás email vagy jelszó!');
        setShowErrorDialog(true);
        setIsLoading(false);
        return;
      }
    
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setLoggedInUsername(data.user.username);
        setSuccessAlert(true);
        setTimeout(() => {
          setSuccessAlert(false);
          navigate('/kezdolap');
        }, 2000);
      }
    
    } catch (error) {
      setErrorTitle('Szerver hiba');
      setErrorMessage('Szerverhiba történt! Kérjük, próbáld újra később.');
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false); 
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      setErrorTitle('Hiányzó email cím');
      setErrorMessage('Kérjük, add meg az email címed a jelszó visszaállításához.');
      setShowErrorDialog(true);
      return;
    }
    
    if (!validateEmail(email)) {
      setErrorTitle('Érvénytelen email cím');
      setErrorMessage('Kérjük, adj meg egy érvényes email címet.');
      setShowErrorDialog(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://adaliclothing.onrender.com/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setErrorTitle('Jelszó visszaállítás');
        setErrorMessage(`A jelszó visszaállítási linket elküldtük a következő címre: ${email}`);
        setShowErrorDialog(true);
      } else {
        setErrorTitle('Hiba történt');
        setErrorMessage(data.error || 'Nem sikerült elküldeni a jelszó-visszaállítási emailt.');
        setShowErrorDialog(true);
      }
    } catch (error) {
      setErrorTitle('Szerver hiba');
      setErrorMessage('Nem sikerült kapcsolódni a szerverhez. Kérjük, próbáld újra később.');
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  
  
  

  return (
   <div
     style={{
       background: darkMode 
         ? `linear-gradient(135deg, #151515 0%, #1a1a1a 100%)`
         : `linear-gradient(135deg, #c8c8c8 0%, #d0d0d0 100%)`,
       color: darkMode ? 'white' : 'black',
       height: '100vh',
       zIndex: 0,
       position: 'relative',
       overflow: 'hidden',
       backgroundImage: darkMode
         ? `linear-gradient(to right, rgba(18,18,18,0.9) 0%, rgba(25,25,25,0.4) 50%, rgba(18,18,18,0.9) 100%),
            linear-gradient(to bottom, rgba(18,18,18,0.9) 0%, rgba(25,25,25,0.4) 50%, rgba(18,18,18,0.9) 100%)`
         : `linear-gradient(to right, rgba(200,200,200,0.8) 0%, rgba(208,208,208,0.4) 50%, rgba(200,200,200,0.8) 100%),
            linear-gradient(to bottom, rgba(200,200,200,0.8) 0%, rgba(208,208,208,0.4) 50%, rgba(200,200,200,0.8) 100%)`,
       backgroundBlendMode: 'multiply'
     }}
   >
     
   
     
         
     <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    color: '#fff',
    padding: {
      xs: isExtraSmall ? '8px 10px' : '10px 15px',
      sm: '10px 20px'
    },
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box'
  }}
>
  <IconButton 
    sx={{ 
      color: 'white',
      padding: isExtraSmall ? '4px' : '8px'
    }}
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
  
  <Box sx={{
    display: 'flex',
    gap: {
      xs: isExtraSmall ? '2px' : '3px',
      sm: '10px'
    },
    flex: '0 0 auto',
    zIndex: 1,
    marginLeft: isExtraSmall ? '20px' : '50px'
  }}>
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
  </Box>
</Box>
      <Menu />
      <Container
              maxWidth="sm"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
        <Box
    id="form-box"
    sx={{
      padding: {
        xs: 2,
        sm: 3
      },
      borderRadius: 3,
      boxShadow: 2,
      backgroundColor: darkMode ? '#333' : '#fff',
      color: darkMode ? 'white' : 'black',
      width: '100%',
      position: 'relative',
      border: darkMode ? 'black' : 'black',
      maxWidth: {
        xs: '100%',
        sm: '450px'
      }
    }}
  >
    <TextField
        label="E-mail"
        type="email"
        variant="outlined"
        name="email"
        required
        fullWidth
        margin="normal"
        value={email}
        onChange={handleEmailChange}
        InputProps={{
          style: { color: darkMode ? 'white' : 'black' },
        }}
        InputLabelProps={{
          style: { color: darkMode ? 'white' : 'black' },
        }}
        sx={{
          '& input': {
            backgroundColor: darkMode ? '#333' : '#fff',
            fontSize: {
              xs: '0.9rem',
              sm: '1rem'
            },
            padding: {
              xs: '12px',
              sm: '14px'
            }
          }
        }}
      />

    <TextField
      label="Jelszó"
      type={showPassword ? 'text' : 'password'}
      variant="outlined"
      name="password"
      required
      fullWidth
      margin="normal"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      InputProps={{
        style: { color: darkMode ? 'white' : 'black' },
        endAdornment: password && (
          <InputAdornment position="end">
            <IconButton
              onClick={togglePasswordVisibility}
              edge="end"
              style={{ color: 'gray' }}
              sx={{
                padding: {
                  xs: '4px',
                  sm: '8px'
                }
              }}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      InputLabelProps={{
        style: { color: darkMode ? 'white' : 'black' },
      }}
      sx={{
        '& input': {
          backgroundColor: darkMode ? '#333' : '#fff',
          fontSize: {
            xs: '0.9rem',
            sm: '1rem'
          },
          padding: {
            xs: '12px',
            sm: '14px'
          }
        }
      }}
    />

    
<Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: {
      xs: 2,
      sm: 3
    },
    flexDirection: 'column',
    gap: 2
  }}
>
  <Button
    onClick={handleLogin}
    type="submit"
    variant="contained"
    disabled={isLoading}
    style={{ color: darkMode ? 'white' : 'black' }}
    sx={{
      backgroundColor: darkMode ? '#555' : '#ddd',
      border: '2px solid',
      borderColor: 'black',
      padding: {
        xs: '8px 16px',
        sm: '10px 20px'
      },
      fontSize: {
        xs: '0.9rem',
        sm: '1rem'
      }
    }}
  >
    {isLoading ? (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: 20, height: 20, mr: 1 }}>
          <CircularProgress size={20} color="inherit" />
        </Box>
        Bejelentkezés...
      </Box>
    ) : (
      'Bejelentkezés'
    )}
  </Button>
  
  <Button
    onClick={handleForgotPassword}
    variant="text"
    sx={{
      color: darkMode ? '#90caf9' : '#1976d2',
      textTransform: 'none',
      fontSize: '0.9rem',
      '&:hover': {
        backgroundColor: 'transparent',
        textDecoration: 'underline'
      }
    }}
  >
    Elfelejtetted a jelszavad?
  </Button>
</Box>
    </Box>
  

    <Button
  variant="contained"
  color="secondary"
  onClick={() => window.history.back()}
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#444',
    alignItems: 'center',
    position: 'absolute',
    top: {
      xs: isExtraSmall ? 8 : 12,
      sm: 12
    },
    left: {
      xs: isExtraSmall ? 8 : 16,
      sm: 16
    },
    padding: {
      xs: isExtraSmall ? '4px 8px' : '6px 12px',
      sm: '8px 16px'
    },
    minWidth: {
      xs: isExtraSmall ? '32px' : '40px',
      sm: 'auto'
    },
    zIndex: 1000,
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#666',
      transform: 'scale(1.05)',
    },
  }}
>
  <ArrowBackIcon 
    sx={{ 
      marginRight: {
        xs: isExtraSmall ? 0 : 1,
        sm: 1
      },
      fontSize: {
        xs: isExtraSmall ? '1rem' : '1.25rem',
        sm: '1.5rem'
      }
    }} 
  />
</Button>
        <FormGroup
          sx={{
            position: 'absolute',
            top: 60,
            right: 20,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                color="default"
                sx={{
                  color: 'black',
                }}
                checked={darkMode} 
                onChange={() => setDarkMode((prev) => !prev)}
              />
            }
            label="Dark Mode"
          />
        </FormGroup>

        <canvas
          id="dvdCanvas"
          style={{
            position: 'absolute',
            zIndex: -1,
            width: '104%',
            height: '100%',
            bottom: '',
            top: '4%',
          }}
        />

{successAlert && (
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
      maxWidth: '100%'
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
            Üdvözlünk újra, {loggedInUsername}!
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
            Sikeres bejelentkezés
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}


{errorAlert && (
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
    data-testid="login-error-alert" 
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
          background: 'linear-gradient(90deg, #FF5252, #FF1744)',
          animation: 'loadingBar 3s ease-in-out',
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
              background: darkMode 
                ? 'linear-gradient(45deg, #FF5252, #FF1744)' 
                : 'linear-gradient(45deg, #D32F2F, #C62828)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            data-testid="login-error-title" 
          >
            Bejelentkezési hiba!
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ color: darkMode ? '#aaa' : '#666' }}
            data-testid="login-error-message" 
          >
            {errorMessage}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}

<Dialog
  open={showErrorDialog}
  onClose={() => setShowErrorDialog(false)}
  sx={{
    '& .MuiDialog-paper': {
      backgroundColor: darkMode ? '#1E1E1E' : '#fff',
      borderRadius: {
        xs: '15px',
        sm: '25px'
      },
      padding: {
        xs: '1.5rem',
        sm: '3rem'
      },
      minWidth: {
        xs: '80%',
        sm: '450px'
      },
      textAlign: 'center',
      boxShadow: darkMode 
        ? '0 8px 32px rgba(255,87,87,0.3)' 
        : '0 8px 32px rgba(255,87,87,0.2)',
      border: '2px solid',
      borderColor: darkMode ? '#FF5757' : '#FF5757',
      position: 'relative',
      overflow: 'hidden'
    }
  }}
>
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #FF5757, #FF8A8A)',
      animation: 'loadingBar 2s ease-in-out',
      '@keyframes loadingBar': {
        '0%': { width: '0%' },
        '100%': { width: '100%' }
      }
    }}
  />
  <Box sx={{ position: 'relative' }}>    
    <Typography 
      variant="h4" 
      sx={{ 
        color: darkMode ? '#FF5757' : '#FF5757',
        mb: 3,
        fontWeight: 800,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        fontSize: {
          xs: '1.2rem',
          sm: '1.5rem',
          md: '2rem'
        },
        padding: {
          xs: '0.5rem',
          sm: '1rem'
        }
      }}
    >
      {errorTitle}
    </Typography>

    <Typography 
      variant="body1" 
      sx={{ 
        color: darkMode ? '#ccc' : '#555',
        mb: 4,
        fontWeight: 400,
        lineHeight: 1.6
      }}
    >
      {errorMessage}
    </Typography>
    
    <Button
      onClick={() => setShowErrorDialog(false)}
      variant="contained"
      sx={{
        backgroundColor: darkMode ? '#FF5757' : '#FF5757',
        color: 'white',
        padding: '10px 24px',
        borderRadius: '8px',
        fontWeight: 600,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: darkMode ? '#FF8A8A' : '#FF8A8A',
        }
      }}
    >
      Értettem
    </Button>
  </Box>
</Dialog>

      </Container>
    </div>
  );
}