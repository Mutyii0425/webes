import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Paper,
  Slide,
  Fade,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ConfettiExplosion from 'react-confetti-explosion';

const WheelOfFortune = ({ darkMode, showOnRegistration = false }) => {
  const [spinning, setSpinning] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [resultDialog, setResultDialog] = useState(false);
  const [prize, setPrize] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isExploding, setIsExploding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const spinRef = useRef(null);
  
  const prizes = [
    { option: 'Nincs nyeremény', value: 0, color: '#34495E', textColor: '#fff' },
    { option: '10% kedvezmény', value: 10, color: '#2ECC71', textColor: '#fff' },
    { option: '5% kedvezmény', value: 5, color: '#34495E', textColor: '#fff' },
    { option: '25% kedvezmény', value: 25, color: '#2ECC71', textColor: '#fff' },
    { option: '20% kedvezmény', value: 20, color: '#34495E', textColor: '#fff' },
    { option: '15% kedvezmény', value: 15, color: '#2ECC71', textColor: '#fff' }
  ];
  
  useEffect(() => {
    // Ellenőrizzük, hogy a felhasználó jogosult-e a pörgetésre
    const checkEligibility = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.f_azonosito) {
        return; // Nincs bejelentkezett felhasználó
      }
      
      // Ha új regisztráció és showOnRegistration=true, akkor automatikusan megjelenítjük
      if (showOnRegistration && user.isNewRegistration && !user.hasSpun) {
        setShowDialog(true);
      } else {
        try {
          // Ellenőrizzük, hogy a felhasználónak van-e már kupona
          const response = await fetch(`https://adaliclothing.onrender.com/api/coupons/user-coupons/${user.f_azonosito}`);
          
          if (response.ok) {
            const coupons = await response.json();
            
            // Ha nincs kupon, vagy csak "Nincs nyeremény" kupona van, akkor jogosult a pörgetésre
            const hasValidCoupon = coupons.some(coupon => 
              coupon.type === 'registration' && 
              coupon.description !== 'Nincs nyeremény'
            );
            
            if (!hasValidCoupon && !showOnRegistration) {
              setShowDialog(true);
            }
          }
        } catch (error) {
          console.error('Hiba a kupon ellenőrzésekor:', error);
        }
      }
    };
    
    checkEligibility();
  }, [showOnRegistration]);
  
  // Animáció a kedvezmények pörgetéséhez
  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % prizes.length);
      }, 100);
      
      // Állítsuk meg a pörgetést 3 másodperc után
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setSpinning(false);
        handleSpinStop();
      }, 3000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [spinning]);
  
  const handleSpinClick = () => {
    if (!spinning) {
      // Random prize number
      const newPrizeNumber = Math.floor(Math.random() * prizes.length);
      setPrizeNumber(newPrizeNumber);
      setSpinning(true);
      
      // Scroll to the spinning element
      if (spinRef.current) {
        spinRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  const handleSpinStop = async () => {
    setPrize(prizes[prizeNumber].option);
    
    // Mentsük el a nyereményt az adatbázisba
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (user && user.f_azonosito) {
        const response = await fetch('https://adaliclothing.onrender.com/api/coupons/save-wheel-prize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.f_azonosito,
            prize: prizes[prizeNumber].option
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            setCouponCode(result.couponCode);
            
            // Frissítsük a localStorage-ben tárolt felhasználói adatokat
            user.kupon = prizes[prizeNumber].option;
            user.kupon_kod = result.couponCode;
            user.hasSpun = true;
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      }
    } catch (error) {
      console.error('Hiba a nyeremény mentésekor:', error);
    }
    
    // Konfetti animáció, ha nyert valamit
    if (prizes[prizeNumber].value > 0) {
      setIsExploding(true);
    }
    
    setResultDialog(true);
  };
  
  const handleClose = () => {
    setShowDialog(false);
    setResultDialog(false);
    
    // Frissítsük a user objektumot, hogy ne jelenjen meg újra
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.isNewRegistration) {
      delete user.isNewRegistration;
      user.hasSpun = true;
      localStorage.setItem('user', JSON.stringify(user));
    }
  };
  
  return (
    <>
      <Dialog
        open={showDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: darkMode ? '#222' : '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
          }
        }}
      >
        <Box sx={{ 
          position: 'relative',
          padding: '20px',
          background: 'linear-gradient(135deg, #4a00e0, #8e2de2)',
          color: 'white',
          textAlign: 'center'
        }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <CelebrationIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Üdvözlünk az Adali Clothing-nál!
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Próbáld ki a szerencséd és nyerj kedvezménykupont!
          </Typography>
        </Box>
        
        <DialogContent sx={{ 
          padding: '30px 20px',
          backgroundColor: darkMode ? '#333' : '#f9f9f9',
          color: darkMode ? '#fff' : '#333'
        }}>
          <Box 
            ref={spinRef}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              mt: 2
            }}
          >
            <Paper
              elevation={8}
              sx={{
                width: '280px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                border: '4px solid',
                borderColor: spinning ? '#f9dd50' : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                transition: 'all 0.3s ease',
                mb: 3,
                background: spinning 
                  ? 'linear-gradient(45deg, #f9dd50, #f8961e)' 
                  : (darkMode ? '#444' : '#fff')
              }}
            >
              {spinning ? (
                <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: prizes[currentIndex].textColor,
                      textAlign: 'center',
                      padding: '20px',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: prizes[currentIndex].color,
                      animation: 'pulse 0.5s infinite alternate'
                    }}
                  >
                    {prizes[currentIndex].option}
                  </Typography>
                </Slide>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  color: darkMode ? '#fff' : '#333'
                }}>
                  <LocalOfferIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Kattints a pörgetésre!
                  </Typography>
                </Box>
              )}
            </Paper>
            
            <Button 
              variant="contained" 
              onClick={handleSpinClick}
              disabled={spinning}
              sx={{
                backgroundColor: spinning ? '#999' : '#f9dd50',
                color: '#333',
                fontWeight: 'bold',
                padding: '10px 30px',
                borderRadius: '30px',
                fontSize: '16px',
                '&:hover': {
                  backgroundColor: spinning ? '#999' : '#f8c01d',
                },
                '&:disabled': {
                  backgroundColor: '#999',
                  color: '#fff'
                },
                transition: 'all 0.3s ease'
              }}
              startIcon={<CardGiftcardIcon />}
            >
              {spinning ? 'Pörgetés folyamatban...' : 'Pörgetés'}
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ 
            textAlign: 'center', 
            color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            mt: 2
          }}>
            Nyerj akár 25% kedvezményt a következő vásárlásodhoz!
          </Typography>
        </DialogContent>
      </Dialog>
      
      <Dialog
        open={resultDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: darkMode ? '#222' : '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
          }
        }}
      >
        <Box sx={{ 
          position: 'relative',
          padding: '20px',
          background: prize === 'Nincs nyeremény' 
            ? 'linear-gradient(135deg, #333, #666)' 
            : 'linear-gradient(135deg, #00b09b, #96c93d)',
          color: 'white',
          textAlign: 'center'
        }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {isExploding && <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <ConfettiExplosion particleCount={100} duration={2500} />
          </Box>}
          
          <Typography variant="h5" sx={{ fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
            {prize === 'Nincs nyeremény' ? 'Sajnáljuk!' : 'Gratulálunk!'}
          </Typography>
        </Box>
        
        <DialogContent sx={{ 
          padding: '30px 20px',
          backgroundColor: darkMode ? '#333' : '#f9f9f9',
          color: darkMode ? '#fff' : '#333',
          textAlign: 'center'
        }}>
          <Fade in={true} timeout={800}>
            <Box>
              <Typography variant="h4" sx={{ 
                mb: 3,
                color: prize === 'Nincs nyeremény' 
                  ? (darkMode ? '#ff6b6b' : '#d32f2f')
                  : (darkMode ? '#4caf50' : '#2e7d32'),
                  fontWeight: 'bold'
                }}>
                  {prize}
                </Typography>
                
                {prize !== 'Nincs nyeremény' && couponCode && (
                  <Box sx={{ 
                    mt: 3, 
                    mb: 3,
                    animation: 'fadeIn 1s ease-in'
                  }}>
                    <Typography variant="body1" sx={{ color: darkMode ? '#aaa' : '#666', mb: 1 }}>
                      Kuponkódod:
                    </Typography>
                    <Paper
                      elevation={3}
                      sx={{
                        display: 'inline-block',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        backgroundColor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                        border: '2px dashed',
                        borderColor: darkMode ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)',
                      }}
                    >
                      <Typography variant="h5" sx={{ 
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        color: darkMode ? '#90caf9' : '#1976d2'
                      }}>
                        {couponCode}
                      </Typography>
                    </Paper>
                    
                    <Typography variant="body2" sx={{ 
                      color: darkMode ? '#aaa' : '#666', 
                      mt: 2,
                      maxWidth: '400px',
                      margin: '0 auto'
                    }}>
                      A kupon a fiókodban is megtalálható és 30 napig érvényes. Vásárláskor automatikusan felhasználhatod.
                    </Typography>
                  </Box>
                )}
                
                {prize === 'Nincs nyeremény' && (
                  <Typography variant="body1" sx={{ 
                    color: darkMode ? '#aaa' : '#666',
                    mb: 3
                  }}>
                    Sajnos most nem nyertél kedvezményt. Próbáld újra később vagy nézd meg aktuális akcióinkat!
                  </Typography>
                )}
              </Box>
            </Fade>
          </DialogContent>
          
          <DialogActions sx={{ 
            justifyContent: 'center', 
            padding: '20px',
            backgroundColor: darkMode ? '#333' : '#f9f9f9',
          }}>
            <Button 
              onClick={handleClose}
              variant="contained"
              sx={{
                backgroundColor: prize === 'Nincs nyeremény' 
                  ? (darkMode ? '#666' : '#999')
                  : (darkMode ? '#4caf50' : '#2e7d32'),
                color: '#fff',
                padding: '10px 30px',
                borderRadius: '30px',
                '&:hover': {
                  backgroundColor: prize === 'Nincs nyeremény' 
                    ? (darkMode ? '#777' : '#aaa')
                    : (darkMode ? '#5cb860' : '#3e8e41'),
                }
              }}
            >
              {prize === 'Nincs nyeremény' ? 'Bezárás' : 'Köszönöm'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* CSS animációk */}
        <style jsx="true">{`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            100% {
              transform: scale(1.05);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </>
    );
  };
  
  export default WheelOfFortune;
  
