import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Dialog, Zoom, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Rating } from '@mui/material';
import InactivityAlert from './InactivityAlert';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Divider,
  createTheme,
  ThemeProvider,
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormHelperText,
  Paper
} from '@mui/material';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';


export default function Shipping() {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems = [], totalPrice = 0 } = location.state || {};
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const validTotalPrice = !isNaN(totalPrice) && totalPrice !== null ? totalPrice : 0;
    const validDiscountPercentage = !isNaN(discountPercentage) && discountPercentage !== null ? discountPercentage : 0;
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [setTotal] = useState(0);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success'); 
    const [alertTitle, setAlertTitle] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [orderId, setOrderId] = useState(null);
    const [orderItems, setOrderItems] = useState([]); 
    const [finalPriceState, setFinalPriceState] = useState(0);
    const [orderData, setOrderData] = useState({
      nev: '',
      telefonszam: '',
      email: '',
      irsz: '',
      telepules: '',
      kozterulet: '',
      fizetesi_mod: 'utanvet'
    });

const showAlert = (message, severity = 'error', title = '') => {
  setAlertMessage(message);
  setAlertSeverity(severity);
  setAlertTitle(title);
  setAlertOpen(true);
};

const discountAmount = Math.round((validTotalPrice * validDiscountPercentage) / 100);
const shippingCost = validTotalPrice > 19999 ? 0 : 1590;
const finalPrice = validTotalPrice - discountAmount + shippingCost;

const validateCoupon = async () => {
  if (!couponCode) {
    showAlert('Kérjük, add meg a kuponkódot!', 'warning', 'Hiányzó adat');
    return;
  }
  
  setIsValidatingCoupon(true);
  try {
    const response = await fetch('https://adaliclothing.onrender.com/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setCouponDiscount(data.discount);
      
      calculateTotalWithDiscount(data.discount);
      showAlert('Kupon sikeresen érvényesítve!', 'success', 'Siker');
    } else {
      showAlert(data.message || 'Érvénytelen kuponkód', 'error', 'Hiba');
      setCouponDiscount(0);
    }
  } catch (error) {
    console.error('Kupon érvényesítési hiba:', error);
    showAlert('Hiba történt a kupon érvényesítése során', 'error', 'Rendszerhiba');
  } finally {
    setIsValidatingCoupon(false);
  }
};

const calculateTotalWithDiscount = (discount) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.ar * item.mennyiseg), 0);
  const discountAmount = subtotal * (discount / 100);
  setTotal(subtotal - discountAmount);
};

const [errors, setErrors] = useState({
  nev: false,
  telefonszam: false,
  email: false,
  irsz: false,
  telepules: false,
  kozterulet: false
});
const validateForm = () => {
  const newErrors = {};
  let isValid = true;


  Object.keys(orderData).forEach(field => {
    if (!orderData[field].trim()) {
      newErrors[field] = true;
      isValid = false;
    } else {
      newErrors[field] = false;
    }
  });


  if (!orderData.email.includes('@')) {
    newErrors.email = true;
    isValid = false;
  }


  const irszRegex = /^\d{4}$/;
  if (!irszRegex.test(orderData.irsz)) {
    newErrors.irsz = true;
    isValid = false;
  }

 
  const phoneRegex = /^(\+36|06)[0-9]{9}$/;
  if (!phoneRegex.test(orderData.telefonszam)) {
    newErrors.telefonszam = true;
    isValid = false;
  }

  if (!orderData.fizetesi_mod) {
    newErrors.fizetesi_mod = 'Kérjük, válassz fizetési módot';
    isValid = false;
  }

  setErrors(newErrors);
  setFormErrors(newErrors);
  return isValid;
};

const handleApplyCoupon = async () => {
  if (!couponCode.trim()) {
    showAlert('Kérjük, add meg a kuponkódot!', 'warning', 'Hiányzó adat');
    return;
  }
  
  
  const normalizedCouponCode = couponCode.trim().toUpperCase();
  
  setIsApplyingCoupon(true);
  
  try {
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    
    if (!userData.f_azonosito) {
      showAlert('Bejelentkezés szükséges a kupon használatához!', 'warning', 'Figyelmeztetés');
      setIsApplyingCoupon(false);
      return;
    }
    
    
    const response = await fetch(`https://adaliclothing.onrender.com/api/coupons/check-coupon/${normalizedCouponCode}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Kupon ellenőrzés eredménye:', result);
    
  
    const regCoupons = result.regCoupons || [];
    const emailCoupons = result.emailCoupons || [];
    const separateCoupons = result.separateCoupons || [];
    
    
    const userRegCoupon = regCoupons.find(c => c.f_azonosito === userData.f_azonosito);
    const userEmailCoupon = emailCoupons.find(c => c.f_azonosito === userData.f_azonosito);
    const userSeparateCoupon = separateCoupons.find(c => c.user_id === userData.f_azonosito);
    
    if (userRegCoupon && !userRegCoupon.kupon_hasznalva) {
   
      const discountMatch = userRegCoupon.kupon ? userRegCoupon.kupon.match(/(\d+)%/) : null;
      const discount = discountMatch ? parseInt(discountMatch[1]) : 15;
      
      setAppliedCoupon({
        code: normalizedCouponCode,
        discount: discount,
        type: 'registration'
      });
      setDiscountPercentage(discount);
      showAlert(`${discount}% kedvezmény sikeresen alkalmazva!`, 'success', 'Kupon beváltva');
      
    } else if (userEmailCoupon && !userEmailCoupon.email_kupon_hasznalva) {
      
      const discountMatch = userEmailCoupon.email_kupon ? userEmailCoupon.email_kupon.match(/(\d+)%/) : null;
      const discount = discountMatch ? parseInt(discountMatch[1]) : 10;
      
      setAppliedCoupon({
        code: normalizedCouponCode,
        discount: discount,
        type: 'email'
      });
      setDiscountPercentage(discount);
      showAlert(`${discount}% kedvezmény sikeresen alkalmazva!`, 'success', 'Kupon beváltva');
      
    } else if (userSeparateCoupon && !userSeparateCoupon.is_used) {
   
      const discount = userSeparateCoupon.discount || 15;
      
      setAppliedCoupon({
        code: normalizedCouponCode,
        discount: discount,
        type: userSeparateCoupon.type || 'standard'
      });
      setDiscountPercentage(discount);
      showAlert(`${discount}% kedvezmény sikeresen alkalmazva!`, 'success', 'Kupon beváltva');
     
    } else if (regCoupons.length > 0 || emailCoupons.length > 0 || separateCoupons.length > 0) {
      
      showAlert('Ez a kupon nem a te fiókodhoz tartozik vagy már fel lett használva!', 'error', 'Érvénytelen kupon');
      setDiscountPercentage(0);
      setAppliedCoupon(null);
    } else {

      showAlert('A megadott kuponkód nem létezik!', 'error', 'Érvénytelen kupon');
      setDiscountPercentage(0);
      setAppliedCoupon(null);
    }
  } catch (error) {
    console.error('Hiba a kupon ellenőrzésekor:', error);
    showAlert('Hiba történt a kupon ellenőrzése során. Kérjük, próbáld újra később!', 'error', 'Rendszerhiba');
  } finally {
    setIsApplyingCoupon(false);
  }
};

const handleSubmitOrder = async () => {
  if (!validateForm()) {
    showAlert('Kérjük, töltsd ki helyesen az összes kötelező mezőt!', 'warning', 'Hiányos adatok');
    return;
  }

  setIsLoading(true);
  try {
    
    const vevoResponse = await fetch('https://adaliclothing.onrender.com/vevo/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nev: orderData.nev,
        telefonszam: orderData.telefonszam,
        email: orderData.email,
        irsz: orderData.irsz,
        telepules: orderData.telepules,
        kozterulet: orderData.kozterulet,
        fizetesi_mod: orderData.fizetesi_mod || 'utanvet'
      })
    });

    if (!vevoResponse.ok) {
      const errorData = await vevoResponse.json();
      throw new Error(errorData.error || 'Hiba történt a rendelés során');
    }

    const vevoResult = await vevoResponse.json();
    
    
    setOrderId(vevoResult.id);

 
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && appliedCoupon) {
      try {
       
        const endpoint = appliedCoupon.type === 'email' 
          ? 'https://adaliclothing.onrender.com/api/coupons/mark-email-coupon-used'
          : 'https://adaliclothing.onrender.com/api/coupons/mark-coupon-used';
          
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.f_azonosito,
            couponCode: appliedCoupon.code
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          
          if (appliedCoupon.type === 'email') {
            userData.email_kupon_hasznalva = 1;
          } else {
            userData.kupon_hasznalva = 1;
          }
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          console.error('Hiba a kupon használtként jelölésekor:', result.error);
        }
      } catch (error) {
        console.error('Hiba a kupon használtként jelölésekor:', error);
      }
    }

  
    const optimizedCartItems = cartItems.map(item => ({
      id: item.id,
      nev: item.nev,
      ar: item.ar,
      mennyiseg: item.mennyiseg,
      size: item.size || item.meret,
      imageUrl: item.imageUrl
    }));
    
    
    setOrderItems(optimizedCartItems);
    
  
    setFinalPriceState(finalPrice);

    
    for (const item of cartItems) {
      const orderResponse = await fetch('https://adaliclothing.onrender.com/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termek: item.id,
          statusz: 'Feldolgozás alatt',
          mennyiseg: item.mennyiseg,
          vevo_id: vevoResult.id,
          ar: item.ar
        })
      });
      
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        
        if (errorData.error === 'Nincs elég készleten') {
          throw new Error(`A(z) "${item.nev}" termékből csak ${errorData.available} db van készleten, de ${errorData.requested} db-ot próbált rendelni.`);
        }
        throw new Error(errorData.error || 'Hiba történt a rendelés során');
      }
     
    }

    const emailResponse = await fetch('https://adaliclothing.onrender.com/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: orderData.email,
        name: orderData.nev,
        orderId: vevoResult.id,
        orderItems: optimizedCartItems,
        shippingDetails: {
          phoneNumber: orderData.telefonszam,
          zipCode: orderData.irsz,
          city: orderData.telepules,
          address: orderData.kozterulet
        },
        totalPrice: finalPrice,
        discount: discountAmount, 
        shippingCost: validTotalPrice > 19999 ? "Ingyenes szállítás" : "1590 Ft",
        paymentMethod: orderData.fizetesi_mod === 'utanvet' ? 'Utánvét (készpénz átvételkor)' : 'Online bankkártyás fizetés'
      })
    });
    
   
    localStorage.removeItem('cartItems');
    
   
    setOrderSuccess(true);
    setIsLoading(false);
    
   
    if (orderData.fizetesi_mod === 'kartya') {
      showAlert('Rendelésed sikeresen elküldtük! Az értékelés után átirányítunk a fizetési oldalra.', 'success', 'Sikeres rendelés');
    } else {
      showAlert('Rendelésed sikeresen elküldtük! Hamarosan emailben értesítünk a részletekről.', 'success', 'Sikeres rendelés');
    }
    
  } catch (error) {
    setIsLoading(false);
    console.error('Rendelési hiba:', error);
    
    
    showAlert(error.message || 'Hiba történt a rendelés feldolgozása során. Kérjük, próbáld újra később!', 'error', 'Rendelési hiba');
  }
};

      
const saveRatingToDatabase = async (rating, comment) => {
  try {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    const response = await fetch('https://adaliclothing.onrender.com/ratings/order-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userData.email,
        username: userData.username || userData.felhasznalonev,
        rating,
        velemeny: comment || null
      })
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('Értékelés sikeresen mentve');
      

      if (orderData.fizetesi_mod === 'kartya') {
        navigate('/payment-simulation', { 
          state: { 
            orderId: orderId, 
            amount: finalPriceState, 
            items: orderItems,
            shippingDetails: {
              name: orderData.nev,
              phoneNumber: orderData.telefonszam,
              zipCode: orderData.irsz,
              city: orderData.telepules,
              address: orderData.kozterulet
            }
          } 
        });
      } else {
        navigate('/kezdolap'); 
      }
      return true;
    } else {
      console.error('Hiba az értékelés mentésekor:', responseData.error);
     
      if (orderData.fizetesi_mod === 'kartya') {
        navigate('/payment-simulation', { 
          state: { 
            orderId: orderId,
            amount: finalPriceState,
            items: orderItems,
            shippingDetails: {
              name: orderData.nev,
              phoneNumber: orderData.telefonszam,
              zipCode: orderData.irsz,
              city: orderData.telepules,
              address: orderData.kozterulet
            }
          } 
        });
      } else {
        navigate('/kezdolap');
      }
      return false;
    }
  } catch (error) {
    console.error('Hiba az értékelés mentésekor:', error);
    
    if (orderData.fizetesi_mod === 'kartya') {
      navigate('/payment-simulation', { 
        state: { 
          orderId: orderId,
          amount: finalPriceState,
          items: orderItems,
          shippingDetails: {
            name: orderData.nev,
            phoneNumber: orderData.telefonszam,
            zipCode: orderData.irsz,
            city: orderData.telepules,
            address: orderData.kozterulet
          }
        } 
      });
    } else {
      navigate('/kezdolap');
    }
    return false;
  }
};
    
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      borderRadius: 2,
      color: '#fff'
    },
    '& .MuiInputLabel-root': {
      color: '#fff'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255,255,255,0.3)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255,255,255,0.5)'
    }
  };

  const theme = createTheme({
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: darkMode ? '#666' : '#333',
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? '#888' : '#444',
              }
            }
          }
        }
      }
    }
  });     
  
  const [couponStatus, setCouponStatus] = useState({
    available: false,
    used: false
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      
   
      if (user.kupon && !user.kupon_hasznalva) {
       
        if (user.kupon.includes('%')) {
    
          const discountMatch = user.kupon.match(/(\d+)%/);
          if (discountMatch && discountMatch[1]) {
            const discountAmount = parseInt(discountMatch[1]);
            setDiscountPercentage(discountAmount);
            setCouponStatus({ 
              available: true, 
              used: false,
              type: 'registration'
            });
          }
        }
       
      } 
    
      else if (user.email_kupon && !user.email_kupon_hasznalva) {
     
        if (user.email_kupon.includes('%')) {
       
          const discountMatch = user.email_kupon.match(/(\d+)%/);
          if (discountMatch && discountMatch[1]) {
            const discountAmount = parseInt(discountMatch[1]);
            setDiscountPercentage(discountAmount);
            setCouponStatus({ 
              available: true, 
              used: false,
              type: 'email'
            });
          }
        }
      
      }
     
      else {
        setCouponStatus({ 
          available: false, 
          used: true 
        });
        setDiscountPercentage(0);
      }
    }
  }, []);
  

  const fetchUserCoupons = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      
      if (!userData.f_azonosito) {
        console.error('Nincs bejelentkezett felhasználó vagy hiányzik az azonosító');
        return;
      }
      
  
      const response = await fetch(`https://adaliclothing.onrender.com/api/coupons/user-coupons/${userData.f_azonosito}`);
      
      if (!response.ok) {
        throw new Error('Hiba a kupon adatok lekérésekor');
      }
      
      const data = await response.json();
  
      if (data && data.length > 0) {
 
        const activeRegCoupon = data.find(c => 
          c.type === 'registration' && !c.isUsed && !c.isExpired
        );
        
   
        const activeEmailCoupon = data.find(c => 
          c.type === 'email' && !c.isUsed && !c.isExpired
        );
   
        if (activeRegCoupon) {
          userData.kupon = `${activeRegCoupon.discountValue}% kedvezmény: ${activeRegCoupon.code}`;
          userData.kupon_kod = activeRegCoupon.code;
          userData.kupon_hasznalva = activeRegCoupon.isUsed ? 1 : 0;
          userData.kupon_lejar = activeRegCoupon.expiresAt;
        }
        
        if (activeEmailCoupon) {
          userData.email_kupon = `${activeEmailCoupon.discountValue}% kedvezmény: ${activeEmailCoupon.code}`;
          userData.email_kupon_kod = activeEmailCoupon.code;
          userData.email_kupon_hasznalva = activeEmailCoupon.isUsed ? 1 : 0;
          userData.email_kupon_lejar = activeEmailCoupon.expiresAt;
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return data;
    } catch (error) {
      console.error('Hiba a kupon adatok lekérésekor:', error);
      return null;
    }
  };
  

  
  

  useEffect(() => {
  
    fetchUserCoupons().then(coupons => {
      if (coupons && coupons.length > 0) {
   
        const activeCoupon = coupons.find(c => !c.isUsed && !c.isExpired);
        
        if (activeCoupon) {
 
          setCouponStatus({ 
            available: true, 
            used: false,
            type: activeCoupon.type
          });
          
   
          setDiscountPercentage(activeCoupon.discountValue);
        } else {
          setCouponStatus({ 
            available: false, 
            used: true 
          });
          setDiscountPercentage(0);
        }
      }
    });
  }, []);

    return (
      <ThemeProvider theme={theme}>
       <Box
  style={{
    backgroundColor: darkMode ? '#333' : '#f5f5f5',
    backgroundImage: darkMode 
      ? 'radial-gradient(#666 1px, transparent 1px)'
      : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    color: darkMode ? 'white' : 'black',
    minHeight: '100vh',
    transition: 'all 0.3s ease-in-out',
    display: 'flex',        
    alignItems: 'center',      
    justifyContent: 'center', 
    padding: '3rem 0'         
  }}
>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                gap: 4,
                flexDirection: { xs: 'column', md: 'row' }
              }}
            >
             
              <Card
                elevation={8}
                sx={{
                  flex: 2,
                  backgroundColor: darkMode ? '#333' : '#fff',
                  borderRadius: 3,
                  padding: 4,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    color: darkMode ? '#fff' : '#333',
                    borderBottom: '2px solid',
                    borderColor: darkMode ? '#555' : '#ddd',
                    paddingBottom: 2,
                    marginBottom: 4
                  }}
                >
                  Szállítási adatok
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
  <TextField
    fullWidth
    label="Név"
    value={orderData.nev}
    onChange={(e) => setOrderData({...orderData, nev: e.target.value})}
    error={errors.nev}
    helperText={errors.nev ? "Irja be a nevet!" : ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Telefonszám" 
    value={orderData.telefonszam}
    onChange={(e) => setOrderData({...orderData, telefonszam: e.target.value})}
    error={errors.telefonszam}
    inputProps={{ maxLength: 12 }}
    helperText={errors.telefonszam ?"Érvénytelen telefonszám (+36 vagy 06 kezdettel)!" : ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Email"
    value={orderData.email} 
    onChange={(e) => setOrderData({...orderData, email: e.target.value})}
    error={errors.email}
    helperText={errors.email ? "Érvénytelen email cím!" :  ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Irányítószám"
    value={orderData.irsz}
    onChange={(e) => setOrderData({...orderData, irsz: e.target.value})}
    error={errors.irsz} 
    inputProps={{ maxLength: 4 }}
    helperText={errors.irsz ? "Az irányítószámnak pontosan 4 számjegyből kell állnia!"  : ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Település"
    value={orderData.telepules}
    onChange={(e) => setOrderData({...orderData, telepules: e.target.value})}
    error={errors.telepules}
    helperText={errors.telepules ? "Irja be a település nevét!" : ""}
    sx={textFieldStyle}
  />
  <TextField
    fullWidth
    label="Közterület"
    value={orderData.kozterulet}
    onChange={(e) => setOrderData({...orderData, kozterulet: e.target.value})}
    error={errors.kozterulet}
    helperText={errors.kozterulet ? "Adja meg a közterületét!" : ""}
    sx={textFieldStyle}
  />
</Box>

<Box sx={{ mt: 2 }}>
  <Typography 
    sx={{ 
      color: darkMode ? '#fff' : '#333',
      mb: 2,
      fontWeight: 'medium',
      display: 'flex',
      alignItems: 'center'
    }}
  >
    <PaymentIcon sx={{ mr: 1, fontSize: '1.2rem', color: darkMode ? '#fff' : '#333' }} />
    Fizetési mód választása
  </Typography>
  
  <FormControl 
    component="fieldset" 
    error={!!formErrors?.fizetesi_mod} 
    sx={{ width: '100%' }}
  >
    <RadioGroup
      name="fizetesi_mod"
      value={orderData.fizetesi_mod || ''}
      onChange={(e) => {
        setOrderData({
          ...orderData,
          fizetesi_mod: e.target.value
        });
      }}
    >
      <Box 
        sx={{ 
          mb: 1.5, 
          p: 1,
          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: darkMode ? 
            (orderData.fizetesi_mod === 'utanvet' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)') : 
            (orderData.fizetesi_mod === 'utanvet' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'),
          transition: 'all 0.2s ease'
        }}
      >
        <FormControlLabel
          value="utanvet"
          control={
            <Radio 
              sx={{ 
                color: darkMode ? '#fff' : '#666',
                '&.Mui-checked': {
                  color: darkMode ? '#90caf9' : '#1976d2',
                },
                padding: '4px'
              }} 
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalAtmIcon sx={{ mr: 1, color: darkMode ? '#fff' : '#333', fontSize: '1rem' }} />
              <Typography sx={{ color: darkMode ? '#fff' : '#333', fontSize: '0.9rem' }}>
                Utánvét (készpénz átvételkor)
              </Typography>
            </Box>
          }
          sx={{ m: 0, py: 0.5 }}
        />
      </Box>

      <Box 
        sx={{ 
          p: 1,
          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: darkMode ? 
            (orderData.fizetesi_mod === 'kartya' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)') : 
            (orderData.fizetesi_mod === 'kartya' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'),
          transition: 'all 0.2s ease'
        }}
      >
        <FormControlLabel
          value="kartya"
          control={
            <Radio 
              sx={{ 
                color: darkMode ? '#fff' : '#666',
                '&.Mui-checked': {
                  color: darkMode ? '#90caf9' : '#1976d2',
                },
                padding: '4px'
              }} 
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CreditCardIcon sx={{ mr: 1, color: darkMode ? '#fff' : '#333', fontSize: '1rem' }} />
              <Typography sx={{ color: darkMode ? '#fff' : '#333', fontSize: '0.9rem' }}>
                Online bankkártyás fizetés
              </Typography>
            </Box>
          }
          sx={{ m: 0, py: 0.5 }}
        />
      </Box>
    </RadioGroup>
    {formErrors?.fizetesi_mod && (
      <FormHelperText error sx={{ ml: 1, mt: 1, color: '#ff6b6b' }}>
        {formErrors.fizetesi_mod}
      </FormHelperText>
    )}
  </FormControl>

  {orderData.fizetesi_mod === 'kartya' && (
    <Box sx={{ 
      mt: 2, 
      p: 1.5, 
      backgroundColor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
      borderRadius: 2,
      borderLeft: '3px solid',
      borderColor: darkMode ? '#90caf9' : '#1976d2'
    }}>
      <Typography variant="body2" sx={{ color: darkMode ? '#fff' : '#333', fontSize: '0.85rem' }}>
        A rendelés leadása után átirányítunk a biztonságos fizetési oldalra.
      </Typography>
    </Box>
  )}
  </Box>
              </Card>
             
              <Card
                elevation={8}
                sx={{
                  flex: 1,
                  backgroundColor: darkMode ? '#333' : '#fff',
                  borderRadius: 3,
                  padding: 4,
                  height: 'fit-content',
                  position: 'sticky',
                  top: 20
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: darkMode ? '#fff' : '#333',
                    marginBottom: 3,
                    borderBottom: '2px solid',
                    borderColor: darkMode ? '#555' : '#ddd',
                    paddingBottom: 2
                  }}
                >
                  Rendelés összegzése
                </Typography>

                <Box sx={{ mb: 4 }}>
                  {cartItems.map((item, index) => (
                    <Box 
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                        padding: 2,
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        borderRadius: 2
                      }}
                    >
           <Typography sx={{ color: '#fff' }}>
           {item.nev} - Méret: {item.size || item.meret} (x{item.mennyiseg})
    </Typography>

    <Typography sx={{ color: '#fff' }}>
    {(item.ar * item.mennyiseg).toLocaleString()} Ft
    </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
    <Typography sx={{ color: '#fff' }}>Részösszeg:</Typography>
    <Typography sx={{ color: '#fff' }}>
      {validTotalPrice.toLocaleString()} Ft
    </Typography>
  </Box>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
    <Typography sx={{ color: '#fff' }}>
      {validTotalPrice > 19999 ? 'Szállítási költség (ingyenes):' : 'Szállítási költség:'}
    </Typography>
    <Typography sx={{ color: '#fff' }}>
      {validTotalPrice > 19999 ? 'Ingyenes' : '1590 Ft'}
    </Typography>
  </Box>

  <Box sx={{ 
    mt: 3, 
    p: 2, 
    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    borderRadius: 2
  }}>
    <Typography sx={{ color: '#fff', mb: 1 }}>Kuponkód:</Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <TextField
        fullWidth
        size="small"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        placeholder="Add meg a kuponkódot"
        disabled={isApplyingCoupon || appliedCoupon !== null}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'white',
            color: darkMode ? 'white' : 'black'
          }
        }}
      />
      <Button
        variant="contained"
        onClick={handleApplyCoupon}
        disabled={isApplyingCoupon || appliedCoupon !== null}
        sx={{
          backgroundColor: darkMode ? '#666' : '#333',
          '&:hover': {
            backgroundColor: darkMode ? '#777' : '#444',
          }
        }}
      >
        {isApplyingCoupon ? 'Ellenőrzés...' : 'Beváltás'}
      </Button>
    </Box>
    
    {appliedCoupon && (
      <Box sx={{ 
        mt: 2, 
        p: 1, 
        backgroundColor: darkMode ? 'rgba(100,255,100,0.1)' : 'rgba(100,255,100,0.05)',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography sx={{ color: darkMode ? '#4caf50' : '#2e7d32', fontSize: '0.875rem' }}>
          {appliedCoupon.discount}% kedvezmény alkalmazva
        </Typography>
        <Button 
          size="small" 
          onClick={() => {
            setAppliedCoupon(null);
            setDiscountPercentage(0);
            setCouponCode('');
          }}
          sx={{ color: darkMode ? '#ff6b6b' : '#d32f2f', fontSize: '0.75rem' }}
        >
          Eltávolítás
        </Button>
      </Box>
    )}
  </Box>
  

  {appliedCoupon && (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      mb: 2,
      backgroundColor: darkMode ? 'rgba(100,255,100,0.1)' : 'rgba(100,255,100,0.05)',
      padding: 2,
      borderRadius: 2,
      mt: 2
    }}>
      <Typography sx={{ color: darkMode ? '#4caf50' : '#2e7d32' }}>
        Kedvezmény ({appliedCoupon.discount}%):
      </Typography>
      <Typography sx={{ color: darkMode ? '#4caf50' : '#2e7d32' }}>
        -{discountAmount.toLocaleString()} Ft
      </Typography>
    </Box>
  )}



  {totalPrice > 19999 && (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      mb: 2,
      backgroundColor: darkMode ? 'rgba(100,255,100,0.1)' : 'rgba(100,255,100,0.05)',
      padding: 2,
      borderRadius: 2
    }}>
      <Typography sx={{ color: darkMode ? '#4caf50' : '#2e7d32' }}>
        Ingyenes szállítás:
      </Typography>
      <Typography sx={{ color: darkMode ? '#4caf50' : '#2e7d32' }}>
        20 000 Ft feletti rendelés
      </Typography>
    </Box>
  )}

  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      mt: 3,
      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      padding: 2,
      borderRadius: 2
    }}
  >
    <Typography sx={{ color: '#fff' }} variant="h6">Végösszeg:</Typography>
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
  {!isNaN(finalPrice) ? finalPrice.toLocaleString() : "0"} Ft
</Typography>
  </Box>

  
</Box>


                <Box sx={{ 
    display: 'flex', 
    gap: 2, 
    mt: 3,
    justifyContent: 'space-between',
    alignItems: 'center' 
    }}>
   <Button
  variant="outlined"
  size="medium"
  startIcon={<ArrowBackIcon />}
  onClick={() => navigate('/kezdolap')}
  sx={{
    fontSize: {
      xs: '0.7rem',
      sm: '0.8rem',
      md: '0.9rem'
    },
    width: {
      xs: '45%',    
      sm: '42%',
      md: '40%'
    },
    py: {
      xs: 0.8,     
      sm: 1.2,
      md: 1.5
    },
    height: {
      xs: '36px',   
      sm: '40px',
      md: '44px'
    },
    borderColor: darkMode ? '#666' : '#333',
    color: darkMode ? '#fff' : '#333',
    '&:hover': {
      borderColor: darkMode ? '#777' : '#444',
      backgroundColor: 'rgba(255,255,255,0.05)',
      transform: 'scale(1.02)'
    },
    transition: 'all 0.3s ease',
    '& .MuiButton-startIcon': {
      marginRight: {
        xs: '4px', 
        sm: '8px'
      }
    },
    '& .MuiSvgIcon-root': {
      fontSize: {
        xs: '1rem',  
        sm: '1.2rem',
        md: '1.4rem'
      }
    },
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  Vissza
</Button>


    <Button
  variant="contained"
  size="medium"
  onClick={handleSubmitOrder}
  sx={{
    fontSize: {
      xs: '0.65rem',
      sm: '0.75rem',
      md: '0.85rem'
    },
    fontWeight: 500,
    width: 'fit-content',
    minWidth: {
      xs: '160px',
      sm: '180px',
      md: '200px'
    },
    maxWidth: {
      xs: '70%',
      sm: '50%',
      md: '40%'
    },
 
    py: {
      xs: 1,     
      sm: 1.2,    
      md: 1.5     
    },
    px: {
      xs: 1,
      sm: 1.5,
      md: 2
    },
   
    height: {
      xs: '36px',  
      sm: '40px',  
      md: '44px'   
    },
    backgroundColor: darkMode ? '#666' : '#333',
    '&:hover': {
      backgroundColor: darkMode ? '#777' : '#444',
      transform: 'scale(1.02)'
    },
    transition: 'all 0.3s ease',
    mx: 'auto',
    display: 'block',
    mt: {
      xs: 1,
      sm: 1.5
    },
    mb: {
      xs: 1.5,
      sm: 2
    },
    textTransform: 'none',
    lineHeight: 1.1,
    borderRadius: '3px',
    letterSpacing: '-0.01em',
 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  Rendelés véglegesítése
</Button>



    </Box>
              </Card>
            </Box>
            {isLoading && (
              <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CircularProgress />
              </Box>
            )}

            
<Dialog
  open={orderSuccess}
  TransitionComponent={Zoom}
  sx={{
    '& .MuiDialog-paper': {
      backgroundColor: darkMode ? '#333' : '#fff',
      borderRadius: { xs: 2, sm: 3 },
      padding: { xs: 1.5, sm: 2, md: 4 },
      textAlign: 'center',
      minWidth: { xs: '85%', sm: '400px' },
      maxWidth: { xs: '92%', sm: '90%', md: '500px' },
      margin: { xs: '8px', sm: 'auto' },
      overflowY: 'auto',
      maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' }
    },
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.7)'
    }
  }}
>
  <CheckCircleIcon sx={{
    fontSize: { xs: 32, sm: 40, md: 60 },
    color: '#4CAF50',
    mb: { xs: 0.5, sm: 1, md: 2 }
  }} />

  <Typography
    variant="h5"
    sx={{
      color: darkMode ? '#fff' : '#333',
      mb: { xs: 0.5, sm: 1, md: 2 },
      fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
      fontWeight: 600,
      lineHeight: 1.2
    }}
  >
    Köszönjük a rendelését!
  </Typography>

  <Typography sx={{
    color: darkMode ? '#ccc' : '#666',
    mb: { xs: 1, sm: 2, md: 3 },
    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
    px: { xs: 0.5, sm: 1 }
  }}>
    A rendelés visszaigazolását elküldtük emailben.
    {orderData.fizetesi_mod === 'kartya' && (
      <Box component="span" sx={{
        display: 'block',
        mt: { xs: 0.5, sm: 1 },
        fontWeight: 'bold',
        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' }
      }}>
        Az értékelés után átirányítunk a fizetési oldalra.
      </Box>
    )}
  </Typography>

  <Box sx={{ mb: { xs: 1.5, sm: 2, md: 3 } }}>
    <Typography sx={{
      color: darkMode ? '#ccc' : '#666',
      mb: { xs: 0.5, sm: 1, md: 2 },
      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
    }}>
      Értékelje az élményét:
    </Typography>
    
    <Rating
      size={window.innerWidth < 400 ? "small" : window.innerWidth < 600 ? "medium" : "large"}
      value={rating}
      onChange={(event, newValue) => setRating(newValue)}
    />
    
    <TextField
      multiline
      rows={window.innerWidth < 400 ? 2 : window.innerWidth < 600 ? 3 : 4}
      placeholder="Írd le véleményed..."
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      sx={{
        mt: { xs: 0.75, sm: 1, md: 2 },
        width: '100%',
        '& .MuiInputBase-input': {
          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
          padding: { xs: '8px 10px', sm: '10px 12px' }
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: { xs: '6px', sm: '8px' }
        }
      }}
    />
    
    <Button
  onClick={async () => {  
    if (rating === 0) {
      alert('Kérjük, válassz egy értékelést!');
      return;
    }
    
    setIsLoading(true);
    
    const success = await saveRatingToDatabase(rating, comment);
    
    if (success && orderData.fizetesi_mod === 'kartya') {
      navigate('/payment-simulation', {
        state: {
          orderId: orderId,
          amount: finalPriceState,
          items: orderItems,
          shippingDetails: {
            name: orderData.nev,
            phoneNumber: orderData.telefonszam,
            zipCode: orderData.irsz,
            city: orderData.telepules,
            address: orderData.kozterulet
          }
        }
      });
    } else if (success) {
      navigate('/kezdolap');
    }
    
    setOrderSuccess(false);
    setIsLoading(false);
  }}
  variant="contained"
  disabled={isLoading}
  sx={{
    mt: { xs: 1, sm: 1.5, md: 2 },
    fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' },
    padding: { xs: '6px 10px', sm: '8px 16px', md: '10px 20px' },
    borderRadius: { xs: '4px', sm: '6px' },
    textTransform: 'none',
    lineHeight: 1.2,
    height: { xs: '32px', sm: 'auto' },
    minHeight: { xs: '32px', sm: '36px', md: '40px' },
    whiteSpace: { xs: 'normal', md: 'nowrap' }
  }}
>
  {isLoading ? (
    <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
  ) : null}
  {orderData.fizetesi_mod === 'kartya' ? (
    window.innerWidth < 400 ? 'Tovább a fizetéshez' : 'Értékelés küldése és tovább a fizetéshez'
  ) : (
    'Értékelés küldése'
  )}
</Button>
  </Box>
</Dialog>


<Snackbar
  open={alertOpen}
  autoHideDuration={6000}
  onClose={() => setAlertOpen(false)}
  anchorOrigin={{ 
    vertical: 'top', 
    horizontal: 'center' 
  }}
  TransitionComponent={Slide}
  TransitionProps={{ direction: "down" }}
>
  <Alert
    elevation={6}
    variant="filled"
    onClose={() => setAlertOpen(false)}
    severity={alertSeverity}
    sx={{
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      '& .MuiAlert-icon': {
        fontSize: '1.5rem'
      },
      '& .MuiAlert-message': {
        fontSize: '0.95rem'
      }
    }}
  >
    {alertTitle && (
      <AlertTitle sx={{ fontWeight: 'bold' }}>{alertTitle}</AlertTitle>
    )}
    {alertMessage}
  </Alert>
</Snackbar>

<InactivityAlert darkMode={darkMode} inactivityTimeout={120000} />
      
          </Container>
        </Box>
      </ThemeProvider>
    )
  
};