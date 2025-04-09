import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Slide
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PaymentSimulation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount, items, shippingDetails } = location.state || {};
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [alertTitle, setAlertTitle] = useState('');

  const showAlert = (message, severity = 'error', title = '') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertTitle(title);
    setAlertOpen(true);
  };
  
  useEffect(() => {
  
    if (!orderId || !amount) {
      navigate('/');
      return;
    }
  }, [orderId, amount, navigate]);
  
  const formatCardNumber = (value) => {

    const cleaned = value.replace(/\D/g, '');

    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19);
  };
  
  const formatExpiryDate = (value) => {

    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };
  
  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };
  
  const handleExpiryDateChange = (e) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };
  
  const validateForm = () => {
    const newErrors = {};
    

    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'A kártyaszám megadása kötelező';
    } else if (cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'A kártyaszámnak 16 számjegyből kell állnia';
    }
    
 
    if (!cardName.trim()) {
      newErrors.cardName = 'A kártyatulajdonos nevének megadása kötelező';
    }
    
 
    if (!expiryDate.trim()) {
      newErrors.expiryDate = 'A lejárati dátum megadása kötelező';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Érvénytelen formátum (MM/YY)';
    } else {
      const [month, year] = expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Érvénytelen hónap';
    } else if (
        parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.expiryDate = 'A kártya lejárt';
      }
    }
    
   
    if (!cvv.trim()) {
      newErrors.cvv = 'A biztonsági kód megadása kötelező';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'A biztonsági kód 3 vagy 4 számjegyből állhat';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('Kérjük, töltsd ki helyesen az összes mezőt!', 'warning', 'Hiányos adatok');
      return;
    }
    

    setIsProcessing(true);
    

    setTimeout(() => {
      setIsProcessing(false);
      
    
      const isSuccessful = Math.random() < 0.9;
      
      if (isSuccessful) {
        setPaymentSuccess(true);
        showAlert('A fizetés sikeres volt!', 'success', 'Sikeres fizetés');
        
  
        setTimeout(() => {
          navigate('/', { 
            state: { 
              orderId: orderId,
              paymentSuccess: true,
              orderDetails: {
                items: items,
                totalPrice: amount,
                customerName: shippingDetails?.name,
                paymentMethod: 'Online bankkártyás fizetés'
              }
            } 
          });
        }, 2000);
      } else {
        showAlert('A fizetés sikertelen volt. Kérjük, ellenőrizd a megadott adatokat vagy próbálj másik kártyát használni.', 'error', 'Sikertelen fizetés');
      }
    }, 2000);
  };
  
  return (
    <Box sx={{ 
      backgroundColor: '#222', 
      minHeight: '100vh',
      backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      pt: 4, 
      pb: 8 
    }}>
      <Container maxWidth="md">
        <Paper 
          elevation={6} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold', 
              color: '#90caf9',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
            }}>
              Fizetési oldal
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#aaa' }}>
              Biztonságos bankkártyás fizetés
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              {paymentSuccess ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: 2
                }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ color: '#fff' }}>
                    Fizetés sikeres!
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ccc' }}>
                    A rendelésed feldolgozás alatt van. Hamarosan emailben értesítünk a részletekről.
                  </Typography>
                </Box>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Card sx={{ 
                    mb: 3, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    backgroundColor: '#333',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CreditCardIcon sx={{ mr: 1, color: '#90caf9' }} />
                        <Typography variant="h6" sx={{ color: '#fff' }}>
                          Kártyaadatok
                        </Typography>
                      </Box>
                      
                      <FormControl fullWidth margin="normal" error={!!errors.cardNumber}>
                        <InputLabel htmlFor="card-number" sx={{ color: '#aaa' }}>Kártyaszám</InputLabel>
                        <OutlinedInput
                          id="card-number"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          label="Kártyaszám"
                          placeholder="1234 5678 9012 3456"
                          inputProps={{ maxLength: 19 }}
                          sx={{
                            color: '#fff',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.3)'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.5)'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#90caf9'
                            }
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <CreditCardIcon sx={{ color: '#aaa' }} />
                            </InputAdornment>
                          }
                        />
                        {errors.cardNumber && (
                          <FormHelperText error>{errors.cardNumber}</FormHelperText>
                        )}
                      </FormControl>
                      
                      <FormControl fullWidth margin="normal" error={!!errors.cardName}>
                        <InputLabel htmlFor="card-name" sx={{ color: '#aaa' }}>Kártyatulajdonos neve</InputLabel>
                        <OutlinedInput
                          id="card-name"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          label="Kártyatulajdonos neve"
                          placeholder="Kovács János"
                          sx={{
                            color: '#fff',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.3)'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.5)'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#90caf9'
                            }
                          }}
                        />
                        {errors.cardName && (
                          <FormHelperText error>{errors.cardName}</FormHelperText>
                        )}
                      </FormControl>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <FormControl fullWidth margin="normal" error={!!errors.expiryDate}>
                            <InputLabel htmlFor="expiry-date" sx={{ color: '#aaa' }}>Lejárati dátum</InputLabel>
                            <OutlinedInput
                              id="expiry-date"
                              value={expiryDate}
                              onChange={handleExpiryDateChange}
                              label="Lejárati dátum"
                              placeholder="MM/YY"
                              inputProps={{ maxLength: 5 }}
                              sx={{
                                color: '#fff',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,255,255,0.3)'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,255,255,0.5)'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#90caf9'
                                }
                              }}
                            />
                            {errors.expiryDate && (
                              <FormHelperText error>{errors.expiryDate}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" error={!!errors.cvv}>
                            <InputLabel htmlFor="cvv" sx={{ color: '#aaa' }}>CVV/CVC</InputLabel>
                            <OutlinedInput
                              id="cvv"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                              label="CVV/CVC"
                              placeholder="123"
                              type="password"
                              inputProps={{ maxLength: 4 }}
                              sx={{
                                color: '#fff',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,255,255,0.3)'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,255,255,0.5)'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#90caf9'
                                }
                              }}
                              endAdornment={
                                <InputAdornment position="end">
                                  <LockIcon sx={{ color: '#aaa' }} />
                                </InputAdornment>
                              }
                            />
                            {errors.cvv && (
                              <FormHelperText error>{errors.cvv}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isProcessing}
                    sx={{
                      py: 1.2,
                      px: 3,
                      fontSize: '1rem',
                      borderRadius: 1,
                      backgroundColor: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      }
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                        Feldolgozás...
                      </>
                    ) : (
                      `Fizetés (${new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(amount)})`
                    )}
                  </Button>
                    
                    <Typography variant="caption" display="block" sx={{ mt: 2, color: '#aaa' }}>
                      A fizetés biztonságos, titkosított kapcsolaton keresztül történik.
                    </Typography>
                  </Box>
                </form>
              )}
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Card sx={{ 
                backgroundColor: '#2a2a2a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#90caf9', 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    pb: 1
                  }}>
                    Rendelés összegzése
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1 }}>
                      Rendelési azonosító:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      #{orderId}
                    </Typography>
                  </Box>
                  
                  {shippingDetails && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#ccc', mb: 1 }}>
                        Szállítási adatok:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        {shippingDetails.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        {shippingDetails.zipCode} {shippingDetails.city}, {shippingDetails.address}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        Tel: {shippingDetails.phoneNumber}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                  
                  <Box sx={{ maxHeight: '200px', overflowY: 'auto', mb: 2, pr: 1 }}>
                    {items && items.map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mb: 1,
                        pb: 1,
                        borderBottom: index < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                      }}>
                        <Typography variant="body2" sx={{ color: '#ccc' }}>
                          {item.nev} ({item.mennyiseg} db)
                          {item.size && <span> - {item.size}</span>}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                          {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(item.ar * item.mennyiseg)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(144, 202, 249, 0.1)',
                    p: 2,
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                      Fizetendő összeg:
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 'bold' }}>
                      {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(amount)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mt: 3,
                    gap: 1
                  }}>
                    <LockIcon sx={{ color: '#aaa', fontSize: 16 }} />
                    <Typography variant="caption" sx={{ color: '#aaa' }}>
                      Biztonságos fizetés
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Button
                onClick={() => navigate(-1)}
                variant="outlined"
                sx={{
                  mt: 2,
                  color: '#90caf9',
                  borderColor: 'rgba(144, 202, 249, 0.5)',
                  '&:hover': {
                    borderColor: '#90caf9',
                    backgroundColor: 'rgba(144, 202, 249, 0.08)'
                  }
                }}
              >
                Vissza a rendeléshez
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {alertTitle && (
            <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {alertTitle}
            </Typography>
          )}
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentSimulation;
