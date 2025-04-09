import React, { useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Dialog, CircularProgress, Toolbar, AppBar } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


export default function ResetPassword() {
    const { token } = useParams();
    console.log('Token értéke:', token);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);
  
  const validatePassword = (password) => {
    return password.length >= 6 && /[A-Z]/.test(password);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      setDialogTitle('Gyenge jelszó');
      setDialogMessage('A jelszónak legalább 6 karakterből kell állnia és tartalmaznia kell legalább egy nagybetűt.');
      setIsSuccess(false);
      setShowDialog(true);
      return;
    }
    
    if (password !== confirmPassword) {
      setDialogTitle('Jelszó hiba');
      setDialogMessage('A jelszavak nem egyeznek!');
      setIsSuccess(false);
      setShowDialog(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Küldés a szervernek:', { token, newPassword: password });
      
      
      const response = await fetch('https://adaliclothing.onrender.com/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      
      console.log('Válasz státusz:', response.status);
      
      const data = await response.json();
      console.log('Válasz adat:', data);
      
      if (response.ok) {
        setDialogTitle('Sikeres jelszóváltoztatás');
        setDialogMessage('A jelszavad sikeresen megváltozott. Most már bejelentkezhetsz az új jelszavaddal.');
        setIsSuccess(true);
        setShowDialog(true);
        
        
        setTimeout(() => {
          navigate('/sign');
        }, 3000);
      } else {
      
        if (data.errorType === 'invalid_token') {
          setDialogTitle('Érvénytelen token');
          setDialogMessage('A jelszó-visszaállítási link érvénytelen vagy lejárt. Kérj új linket a bejelentkezési oldalon.');
        } else if (data.errorType === 'expired_token') {
          setDialogTitle('Lejárt token');
          setDialogMessage('A jelszó-visszaállítási link lejárt. Kérj új linket a bejelentkezési oldalon.');
        } else if (data.errorType === 'invalid_password') {
          setDialogTitle('Gyenge jelszó');
          setDialogMessage('A jelszónak legalább 6 karakterből kell állnia és tartalmaznia kell legalább egy nagybetűt.');
        } else if (data.errorType === 'missing_data') {
          setDialogTitle('Hiányzó adatok');
          setDialogMessage('Hiányzó token vagy jelszó. Kérjük, próbáld újra.');
        } else {
          setDialogTitle('Hiba történt');
          setDialogMessage(data.error || 'Nem sikerült megváltoztatni a jelszót.');
        }
        setIsSuccess(false);
        setShowDialog(true);
      }
    } catch (error) {
      console.error('Fetch hiba:', error);
      
 
      try {
        console.log('Próbálkozás a 3000-es porttal...');
        const response = await fetch('http://localhost:3000/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setDialogTitle('Sikeres jelszóváltoztatás');
          setDialogMessage('A jelszavad sikeresen megváltozott. Most már bejelentkezhetsz az új jelszavaddal.');
          setIsSuccess(true);
          setShowDialog(true);
          
          setTimeout(() => {
            navigate('/sign');
          }, 3000);
        } else {
          setDialogTitle('Hiba történt');
          setDialogMessage(data.error || 'Nem sikerült megváltoztatni a jelszót.');
          setIsSuccess(false);
          setShowDialog(true);
        }
      } catch (secondError) {
        console.error('Második fetch hiba:', secondError);
        
       
        setDialogTitle('Kapcsolódási hiba');
        setDialogMessage('Nem sikerült kapcsolódni a szerverhez. A jelszóváltoztatás nem került mentésre. Kérjük, próbáld újra később, vagy lépj kapcsolatba az ügyfélszolgálattal.');
        setIsSuccess(false);
        setShowDialog(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
    
      
  
  return (
    <Box sx={{ 
      backgroundColor: '#121212',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
     
      <AppBar position="static" sx={{ backgroundColor: '#1E1E1E', boxShadow: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1, 
            textAlign: 'center', 
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}>
            Adali Clothing
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="sm" sx={{ mt: 8, flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: '#1E1E1E', 
            color: 'white' 
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3, color: 'white' }}>
            Új jelszó beállítása
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              label="Új jelszó"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              required
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                style: { color: 'white' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end" sx={{ color: 'white' }}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                style: { color: 'white' }, 
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)', 
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)', 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white', 
                  },
                },
              }}
            />
            
            <TextField
              label="Jelszó megerősítése"
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              required
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                style: { color: 'white' }, 
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleConfirmPasswordVisibility} edge="end" sx={{ color: 'white' }}>
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                style: { color: 'white' }, 
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)', 
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)', 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white', 
                  },
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                mt: 3, 
                mb: 2,
                bgcolor: '#4CAF50', 
                '&:hover': {
                  bgcolor: '#45a049', 
                },
                color: 'white'
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                  Feldolgozás...
                </Box>
              ) : (
                'Jelszó megváltoztatása'
              )}
            </Button>
          </Box>
        </Box>
      </Container>
      
      
      <Dialog
        open={showDialog}
        onClose={() => !isSuccess && setShowDialog(false)}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#1E1E1E',
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
            boxShadow: `0 8px 32px rgba(${isSuccess ? '76,175,80' : '255,87,87'},0.3)`,
            border: '2px solid',
            borderColor: isSuccess ? '#4CAF50' : '#FF5757',
            position: 'relative',
            overflow: 'hidden',
            color: 'white' 
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
            background: isSuccess 
              ? 'linear-gradient(90deg, #4CAF50, #8BC34A)'
              : 'linear-gradient(90deg, #FF5757, #FF8A8A)',
            animation: 'loadingBar 2s ease-in-out',
            '@keyframes loadingBar': {
              '0%': { width: '0%' },
              '100%': { width: '100%' }
            }
          }}
        />
        
        {isSuccess && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <CheckCircleIcon 
              sx={{ 
                fontSize: 60, 
                color: '#4CAF50',
                animation: 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                '@keyframes popIn': {
                  '0%': { transform: 'scale(0)' },
                  '80%': { transform: 'scale(1.2)' },
                  '100%': { transform: 'scale(1)' }
                }
              }} 
            />
          </Box>
        )}
        
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 2,
            color: isSuccess ? '#4CAF50' : '#FF5757',
            fontWeight: 'bold'
          }}
        >
          {dialogTitle}
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3,
            color: 'white' 
          }}
        >
          {dialogMessage}
        </Typography>
        
        {isSuccess && (
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3, 
              color: 'white' 
            }}
          >
            Átirányítás a bejelentkezési oldalra 3 másodperc múlva...
          </Typography>
        )}
        
        <Button
          onClick={() => !isSuccess && setShowDialog(false)}
          variant="contained"
          sx={{
            bgcolor: isSuccess ? '#4CAF50' : '#FF5757',
            color: 'white',
            '&:hover': {
              bgcolor: isSuccess ? '#45a049' : '#ff4040',
            }
          }}
        >
          {isSuccess ? 'Rendben' : 'Értettem'}
        </Button>
      </Dialog>
    </Box>
  );
}