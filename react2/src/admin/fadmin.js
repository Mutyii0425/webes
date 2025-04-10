import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import EmailIcon from '@mui/icons-material/Email';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HistoryIcon from '@mui/icons-material/History';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import Radio from '@mui/material/Radio';
import Tooltip from '@mui/material/Tooltip';
import Menu from '../menu2';

export default function Fadmin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [users, setUsers] = useState([]);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [isSendingCoupons, setIsSendingCoupons] = useState(false);
  const [couponResult, setCouponResult] = useState(null);
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [allCouponDialogOpen, setAllCouponDialogOpen] = useState(false);
  const [allExpiryDays, setAllExpiryDays] = useState(30);
  const [activeTab, setActiveTab] = useState(0);
  const [couponHistory, setCouponHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderStatusOptions] = useState(['Feldolgozás alatt', 'Csomagolás', 'Szállítás alatt', 'Kézbesítve', 'Törölve']);
  const [orderStatusDialogOpen, setOrderStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [deleteDataDialogOpen, setDeleteDataDialogOpen] = useState(false);
  const [couponStats, setCouponStats] = useState({
    totalCoupons: 0,
    usedCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    totalDiscount: 0
  });


  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.f_azonosito));
    }
  };


  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };


  const handleOpenCouponDialog = () => {
    if (selectedUsers.length === 0) {
      setSnackbarMessage('Válassz ki legalább egy felhasználót!');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    setCouponDialogOpen(true);
  };


  const handleCloseCouponDialog = () => {
    setCouponDialogOpen(false);
  };


  const handleSendSelectedCoupons = async () => {
    setIsSendingCoupons(true);
    setCouponResult(null);
    
    try {
      const response = await fetch('https://adaliclothing.onrender.com/api/coupons/send-selected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          expiryDays: parseInt(expiryDays)
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setCouponResult({
          success: true,
          message: result.message || `Sikeresen kiküldve ${result.dbSuccessCount || result.emailSuccessCount || 0} felhasználónak!`
        });
        setSnackbarMessage(result.message || `Sikeresen kiküldve ${result.dbSuccessCount || result.emailSuccessCount || 0} felhasználónak!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setSelectedUsers([]);
        

        fetchCouponStats();
        fetchCouponHistory();
      } else {
        setCouponResult({
          success: false,
          message: result.error || 'Hiba történt a kuponok küldésekor'
        });
        setSnackbarMessage(result.error || 'Hiba történt a kuponok küldésekor');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Hiba a kuponok küldésekor:', error);
      setCouponResult({
        success: false,
        message: error.message || 'Hálózati hiba történt a kuponok küldésekor'
      });
      setSnackbarMessage(error.message || 'Hálózati hiba történt a kuponok küldésekor');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSendingCoupons(false);
      setCouponDialogOpen(false);
    }
  };


  const handleSendCoupons = () => {
    setAllCouponDialogOpen(true);
  };
  

  const handleSendAllCoupons = async () => {
    setIsSendingCoupons(true);
    setCouponResult(null);
    
    try {
      const response = await fetch('https://adaliclothing.onrender.com/api/coupons/send-selected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: users.map(user => user.f_azonosito),
          expiryDays: parseInt(allExpiryDays)
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setCouponResult({
          success: true,
          message: result.message || `Sikeresen kiküldve minden felhasználónak!`
        });
        setSnackbarMessage(result.message || `Sikeresen kiküldve minden felhasználónak!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
  
        fetchCouponStats();
        fetchCouponHistory();
      } else {
        setCouponResult({
          success: false,
          message: result.error || 'Hiba történt a kuponok küldésekor'
        });
        setSnackbarMessage(result.error || 'Hiba történt a kuponok küldésekor');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Hiba a kuponok küldésekor:', error);
      setCouponResult({
        success: false,
        message: error.message || 'Hálózati hiba történt a kuponok küldésekor'
      });
      setSnackbarMessage(error.message || 'Hálózati hiba történt a kuponok küldésekor');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSendingCoupons(false);
      setAllCouponDialogOpen(false);
    }
  };


  const fetchCouponStats = async () => {
    try {
      const response = await fetch('https://adaliclothing.onrender.com/api/coupons/stats');
      
      if (response.ok) {
        const stats = await response.json();
        setCouponStats(stats);
      }
    } catch (error) {
      console.error('Hiba a kupon statisztikák lekérésekor:', error);
    }
  };


  const fetchCouponHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('https://adaliclothing.onrender.com/api/coupons/history');
      
      if (response.ok) {
        const history = await response.json();
        setCouponHistory(history);
      }
    } catch (error) {
      console.error('Hiba a kupon történet lekérésekor:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a kupont?')) {
      return;
    }
    
    try {
      const response = await fetch(`https://adaliclothing.onrender.com/api/coupons/${couponId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
   
        setCouponHistory(couponHistory.filter(coupon => coupon.id !== couponId));
        
        setSnackbarMessage('Kupon sikeresen törölve');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
    
        fetchCouponStats();
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.error || 'Hiba történt a kupon törlésekor');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Hiba a kupon törlésekor:', error);
      setSnackbarMessage('Hálózati hiba történt a kupon törlésekor');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleDeleteAllUsedCoupons = async () => {
    if (!window.confirm('Biztosan törölni szeretnéd az összes felhasznált kupont?')) {
      return;
    }
    
    try {
      const response = await fetch('https://adaliclothing.onrender.com/api/coupons/delete-used', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await response.json();
        
    
        setCouponHistory(couponHistory.filter(coupon => !coupon.isUsed));
        
        setSnackbarMessage(`Sikeresen törölve ${result.deletedCount} felhasznált kupon`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
   
        fetchCouponStats();
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.error || 'Hiba történt a kuponok törlésekor');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Hiba a kuponok törlésekor:', error);
      setSnackbarMessage('Hálózati hiba történt a kuponok törlésekor');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://adaliclothing.onrender.com/users');
        const data = await response.json();
        

        const usersWithCoupons = await Promise.all(data.map(async (user) => {
          try {
            const couponResponse = await fetch(`https://adaliclothing.onrender.com/api/coupons/user-coupons/${user.f_azonosito}`);
            
            if (couponResponse.ok) {
              const coupons = await couponResponse.json();
              

              const activeCoupon = coupons.find(coupon => !coupon.isUsed && !coupon.isExpired);
              
         
              const usedCouponsCount = coupons.filter(coupon => coupon.isUsed).length;
              
              return {
                ...user,
                activeCoupon,
                usedCouponsCount,
                coupons
              };
            }
            
            return user;
          } catch (error) {
            console.error(`Hiba a kupon adatok lekérésekor (${user.f_azonosito}):`, error);
            return user;
          }
        }));
        
        setUsers(usersWithCoupons);
      } catch (error) {
        console.log('Hiba:', error);
      }
    };
    
    fetchUsers();
    fetchCouponStats();
    fetchCouponHistory();
    fetchOrders();
  }, []);

  const handleDelete = async (userId) => {
    const confirmation = window.confirm("Biztosan törölni szeretnéd ezt a felhasználót?");
    
    if (confirmation) {
      try {
        const response = await fetch(`https://adaliclothing.onrender.com/users/${userId}`, {
          method: 'DELETE'
        });
      
        if (response.ok) {
          setUsers(users.filter(user => user.f_azonosito !== userId));
   
          if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
          }
        }
      } catch (error) {
        console.log('Törlési hiba:', error);
      }
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch('https://adaliclothing.onrender.com/api/orders');
      
      if (response.ok) {
        const ordersData = await response.json();
        

        const ordersWithCustomerDetails = await Promise.all(ordersData.map(async (order) => {
          try {
            const customerResponse = await fetch(`https://adaliclothing.onrender.com/api/customers/${order.vevo_id}`);
            
            if (customerResponse.ok) {
              const customer = await customerResponse.json();
              return { ...order, customer };
            }
            
            return order;
          } catch (error) {
            console.error(`Hiba a vevő adatok lekérésekor (${order.id}):`, error);
            return order;
          }
        }));
        
        setOrders(ordersWithCustomerDetails);
      }
    } catch (error) {
      console.error('Hiba a rendelések lekérésekor:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newOrderStatus) return;
    
    try {
      const response = await fetch(`https://adaliclothing.onrender.com/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newOrderStatus })
      });
      
      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === selectedOrder.id ? { ...order, statusz: newOrderStatus } : order
        ));
        
        setSnackbarMessage('Rendelés státusza sikeresen frissítve!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.error || 'Hiba történt a státusz frissítésekor');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Hiba a státusz frissítésekor:', error);
      setSnackbarMessage('Hálózati hiba történt a státusz frissítésekor');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setOrderStatusDialogOpen(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeletingData(true);
    
    try {
      const response = await fetch('https://adaliclothing.onrender.com/api/orders-and-customers', {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSnackbarMessage(`Sikeresen törölve ${result.deletedOrders} rendelés és ${result.deletedCustomers} vevő!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        

        setOrders([]);
      } else {
        setSnackbarMessage(result.error || 'Hiba történt az adatok törlésekor');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Hiba az adatok törlésekor:', error);
      setSnackbarMessage('Hálózati hiba történt az adatok törlésekor');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeletingData(false);
      setDeleteDataDialogOpen(false);
    }
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.statusz || '');
    setOrderStatusDialogOpen(true);
  };

  const toggleSideMenu = () => {
    setSideMenuActive(!sideMenuActive);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ backgroundColor: '#333', minHeight: '100vh' }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#333',
        padding: '10px 20px',
        position: 'relative',
      }}>
        <IconButton onClick={toggleSideMenu} sx={{ color: 'white' }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h1" sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 'bold',
          color: 'white',
          fontSize: {
            xs: '1.2rem',
            sm: '1.5rem', 
            md: '2rem'
          },
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}>
          Adali Clothing
        </Typography>
      </Box>

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

      <Container sx={{ pt: 8, px: { xs: 1, sm: 2, md: 3 } }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : "auto"}
          allowScrollButtonsMobile
          sx={{ 
            mb: 4,
            '& .MuiTab-root': { 
              color: 'white',
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
              minWidth: { xs: 'auto', sm: 'auto' },
              padding: { xs: '6px 8px', sm: '6px 12px', md: '6px 16px' }
            },
            '& .Mui-selected': { color: '#1976d2' },
            '& .MuiTabs-indicator': { backgroundColor: '#1976d2' }
          }}
          >
            <Tab 
              label={isMobile ? "Felhasználók" : "Felhasználók"} 
              icon={<EmailIcon fontSize={isMobile ? "small" : "medium"} />} 
              iconPosition="start" 
            />
            <Tab 
              label={isMobile ? "Statisztikák" : "Kupon Statisztikák"} 
              icon={<LocalOfferIcon fontSize={isMobile ? "small" : "medium"} />} 
              iconPosition="start" 
            />
            <Tab 
              label={isMobile ? "Történet" : "Kupon Történet"} 
              icon={<HistoryIcon fontSize={isMobile ? "small" : "medium"} />} 
              iconPosition="start" 
            />
            <Tab 
              label={isMobile ? "Rendelések" : "Rendelések kezelése"} 
              icon={<ShoppingBasketIcon fontSize={isMobile ? "small" : "medium"} />} 
              iconPosition="start" 
            />
          </Tabs>
  
          {activeTab === 0 && (
            <>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'column', md: 'row' }, 
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'flex-start', md: 'center' },
                mb: 4,
                gap: 2
              }}>
                <Typography variant="h4" sx={{ 
                  color: 'white',
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}>
                  Felhasználók
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  gap: 2,
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<EmailIcon />}
                    onClick={handleOpenCouponDialog}
                    disabled={selectedUsers.length === 0}
                    fullWidth={isMobile}
                    size={isMobile ? "small" : "medium"}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}
                  >
                    {isMobile ? "Kupon kiválasztottaknak" : "Kupon küldése kiválasztottaknak"}
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<EmailIcon />}
                    onClick={handleSendCoupons}
                    fullWidth={isMobile}
                    size={isMobile ? "small" : "medium"}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}
                  >
                    {isMobile ? "Kupon mindenkinek" : "Kupon küldése mindenkinek"}
                  </Button>
                </Box>
              </Box>
  
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUsers.length === users.length && users.length > 0}
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                      onChange={handleSelectAllUsers}
                      sx={{ color: 'white' }}
                    />
                  }
                  label={<Typography sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}>Összes kiválasztása</Typography>}
                />
              </Box>
  
              <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                {users.map((user) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={user.f_azonosito}>
                    <Card sx={{ 
                      height: '100%',
                      position: 'relative',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                      }
                    }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                          <Checkbox
                            checked={selectedUsers.includes(user.f_azonosito)}
                            onChange={() => handleSelectUser(user.f_azonosito)}
                            size={isMobile ? "small" : "medium"}
                          />
                        </Box>
                        <Typography variant="h6" gutterBottom sx={{ 
                          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                          mt: 1
                        }}>
                          {user.felhasznalonev}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' } 
                        }}>
                          {user.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' } 
                        }}>
                          Regisztrált: {new Date(user.reg_datum).toLocaleDateString()}
                        </Typography>
                        
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } 
                          }}>
                            Kupon információk:
                          </Typography>
                          
                          {user.activeCoupon ? (
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' }, 
                              gap: 1 
                            }}>
                              <Chip 
                                label={`${user.activeCoupon.discount}% kedvezmény`} 
                                color="success" 
                                size="small" 
                              />
                              <Typography variant="caption" sx={{ 
                                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } 
                              }}>
                                Lejárat: {new Date(user.activeCoupon.expiryDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary" sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' } 
                            }}>
                              Nincs aktív kupon
                            </Typography>
                          )}
                          
                          {user.usedCouponsCount > 0 && (
                            <Typography variant="caption" display="block" sx={{ 
                              mt: 1,
                              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } 
                            }}>
                              Felhasznált kuponok: {user.usedCouponsCount}
                            </Typography>
                          )}
                        </Box>
                        
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(user.f_azonosito)}
                            aria-label="delete"
                            size={isMobile ? "small" : "medium"}
                          >
                            <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
  
          {activeTab === 1 && (
            <Box sx={{ color: 'white' }}>
              <Typography variant="h4" gutterBottom sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } 
              }}>
                Kupon Statisztikák
              </Typography>
              
              <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ 
                    backgroundColor: '#1976d2',
                    color: 'white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
                      }}>
                        Összes kupon
                      </Typography>
                      <Typography variant="h3" sx={{ 
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
                      }}>
                        {couponStats.totalCoupons}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ 
                    backgroundColor: '#4caf50',
                    color: 'white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
                      }}>
                        Aktív kuponok
                      </Typography>
                      <Typography variant="h3" sx={{ 
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
                      }}>
                        {couponStats.activeCoupons}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ 
                    backgroundColor: '#f44336',
                    color: 'white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
                      }}>
                        Felhasznált kuponok
                      </Typography>
                      <Typography variant="h3" sx={{ 
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
                      }}>
                        {couponStats.usedCoupons}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                  <Card sx={{ 
                    backgroundColor: '#ff9800',
                    color: 'white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
                      }}>
                        Lejárt kuponok
                      </Typography>
                      <Typography variant="h3" sx={{ 
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
                      }}>
                        {couponStats.expiredCoupons}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                  <Card sx={{ 
                    backgroundColor: '#9c27b0',
                    color: 'white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
                      }}>
                        Összes kedvezmény értéke
                      </Typography>
                      <Typography variant="h3" sx={{ 
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
                      }}>
                        {couponStats.totalDiscount.toLocaleString()} Ft
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={fetchCouponStats}
                  size={isMobile ? "small" : "medium"}
                >
                  Statisztikák frissítése
                </Button>
              </Box>
            </Box>
          )}
  
  {activeTab === 2 && (
  <Box sx={{ color: 'white' }}>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      mb: 3,
      gap: 2
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } 
      }}>
        Kupon Történet
      </Typography>
      
      <Button 
        variant="contained" 
        color="error" 
        onClick={handleDeleteAllUsedCoupons}
        startIcon={<DeleteIcon />}
        size={isMobile ? "small" : "medium"}
        sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}
      >
        Összes használt kupon törlése
      </Button>
    </Box>
    
    {isLoadingHistory ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    ) : (
      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 3,
          overflowX: 'auto'
        }}
      >
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                display: { xs: 'none', sm: 'table-cell' },
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Felhasználó</TableCell>
              <TableCell sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Típus</TableCell>
              <TableCell sx={{ 
                display: { xs: 'none', md: 'table-cell' },
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Kód</TableCell>
              <TableCell sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Kedvezmény</TableCell>
              <TableCell sx={{ 
                display: { xs: 'none', sm: 'table-cell' },
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Létrehozva</TableCell>
              <TableCell sx={{ 
                display: { xs: 'none', md: 'table-cell' },
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Lejárat</TableCell>
              <TableCell sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Státusz</TableCell>
              <TableCell sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Műveletek</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {couponHistory.map((coupon, index) => (
              <TableRow key={coupon.id || `coupon-${index}`}>
                <TableCell sx={{ 
                  display: { xs: 'none', sm: 'table-cell' },
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                }}>{coupon.username}</TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                }}>{coupon.type === 'registration' ? 'Reg.' : 'Email'}</TableCell>
                <TableCell sx={{ 
                  display: { xs: 'none', md: 'table-cell' },
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                }}>{coupon.code}</TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                }}>{coupon.discount}%</TableCell>
                <TableCell sx={{ 
                  display: { xs: 'none', sm: 'table-cell' },
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                }}>{new Date(coupon.createdAt).toLocaleDateString()}</TableCell>
                <TableCell sx={{ 
                  display: { xs: 'none', md: 'table-cell' },
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                }}>{new Date(coupon.expiryDate).toLocaleDateString()}</TableCell>
                <TableCell sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                }}>
                  {coupon.isUsed ? (
                    <Chip label="Használt" color="error" size="small" />
                  ) : coupon.isExpired ? (
                    <Chip label="Lejárt" color="warning" size="small" />
                  ) : (
                    <Chip label="Aktív" color="success" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  {coupon.isUsed && (
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      aria-label="delete"
                      size={isMobile ? "small" : "medium"}
                    >
                      <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
    
    <Box sx={{ mt: 4 }}>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={fetchCouponHistory}
        disabled={isLoadingHistory}
        size={isMobile ? "small" : "medium"}
      >
        Történet frissítése
      </Button>
    </Box>
  </Box>
)}

{activeTab === 3 && (
    <Box sx={{ color: 'white' }}>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      mb: 3,
      gap: 2
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } 
      }}>
        Rendelések kezelése
      </Typography>
      
      <Button 
        variant="contained" 
        color="error" 
        onClick={() => setDeleteDataDialogOpen(true)}
        startIcon={<DeleteIcon />}
        size={isMobile ? "small" : "medium"}
        sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}
      >
        Összes rendelés és vevő törlése
      </Button>
    </Box>
    
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      mb: 3,
      gap: 2
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2,
        alignItems: { xs: 'flex-start', sm: 'center' }
      }}>
        <Typography variant="body1" sx={{ 
          fontSize: { xs: '0.875rem', sm: '1rem' } 
        }}>
          Szűrés státusz szerint:
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1 
        }}>
          <Chip 
            label="Összes" 
            color={orderStatusFilter === 'all' ? 'primary' : 'default'} 
            onClick={() => setOrderStatusFilter('all')}
            clickable
          />
          {orderStatusOptions.map(status => (
            <Chip 
              key={status}
              label={status} 
              color={orderStatusFilter === status ? 'primary' : 'default'} 
              onClick={() => setOrderStatusFilter(status)}
              clickable
            />
          ))}
        </Box>
      </Box>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={fetchOrders}
        disabled={isLoadingOrders}
        startIcon={isLoadingOrders ? <CircularProgress size={20} color="inherit" /> : null}
        size={isMobile ? "small" : "medium"}
      >
        {isLoadingOrders ? "Betöltés..." : "Frissítés"}
      </Button>
    </Box>
    
    {isLoadingOrders ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    ) : orders.length === 0 ? (
      <Alert severity="info" sx={{ mt: 2 }}>
        Nincsenek rendelések az adatbázisban.
      </Alert>
    ) : (
      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 3,
          overflowX: 'auto'
        }}
      >
        <Table size={isMobile ? "small" : "medium"}>
        <TableHead>
            <TableRow>
              <TableCell sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Rendelés ID</TableCell>
              <TableCell sx={{
                display: { xs: 'none', sm: 'table-cell' },
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Dátum</TableCell>
              <TableCell sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Vevő</TableCell>
              <TableCell sx={{
                display: { xs: 'none', md: 'table-cell' },
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Termék ID</TableCell>
              <TableCell sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Mennyiség</TableCell>
              <TableCell sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Teljes ár</TableCell>
              <TableCell sx={{
                display: { xs: 'none', md: 'table-cell' },
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Egységár</TableCell>
              <TableCell sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Státusz</TableCell>
              <TableCell sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
              }}>Műveletek</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .filter(order => orderStatusFilter === 'all' || order.statusz === orderStatusFilter)
              .map((order) => (
                <TableRow key={order.id}>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                  }}>{order.id}</TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', sm: 'table-cell' },
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                  }}>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                  }}>
                    {order.customer ? (
                      <Tooltip title={
                        <Box>
                          <Typography variant="body2">Email: {order.customer.email}</Typography>
                          <Typography variant="body2">Tel: {order.customer.telefonszam}</Typography>
                          <Typography variant="body2">
                            Cím: {order.customer.irsz}, {order.customer.telepules}, {order.customer.kozterulet}
                          </Typography>
                          <Typography variant="body2">Fizetési mód: {order.customer.fizetesi_mod}</Typography>
                        </Box>
                      }>
                        <span>{order.customer.nev}</span>
                      </Tooltip>
                    ) : (
                      `Vevő ID: ${order.vevo_id}`
                    )}
                  </TableCell>
                  <TableCell sx={{ 
                    display: { xs: 'none', md: 'table-cell' },
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                  }}>{order.termek}</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                  }}>{order.mennyiseg}</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                  }}>{order.teljes_ar.toLocaleString()} Ft</TableCell>
                  <TableCell sx={{ 
                      display: { xs: 'none', md: 'table-cell' },
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                    }}>{order.egysegar.toLocaleString()} Ft</TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
                  }}>
                    <Chip 
                      label={order.statusz || 'Feldolgozás alatt'} 
                      color={
                        order.statusz === 'Kézbesítve' ? 'success' :
                        order.statusz === 'Törölve' ? 'error' :
                        order.statusz === 'Szállítás alatt' ? 'primary' :
                        'warning'
                      } 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                  <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenStatusDialog(order)}
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } 
                      }}
                    >
                      Státusz módosítása
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
    

    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' } 
      }}>
        Rendelési statisztikák
      </Typography>
      
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#1976d2',
            color: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
              }}>
                Összes rendelés
              </Typography>
              <Typography variant="h3" sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
              }}>
                {orders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#4caf50',
            color: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
              }}>
                Kézbesített
              </Typography>
              <Typography variant="h3" sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
              }}>
                {orders.filter(order => order.statusz === 'Kézbesítve').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#ff9800',
            color: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
              }}>
                Folyamatban
              </Typography>
              <Typography variant="h3" sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
              }}>
                {orders.filter(order => 
                  order.statusz !== 'Kézbesítve' && order.statusz !== 'Törölve'
                ).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            backgroundColor: '#f44336',
            color: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }
          }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
              }}>
                Törölve
              </Typography>
              <Typography variant="h3" sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
              }}>
                {orders.filter(order => order.statusz === 'Törölve').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      

      <Box sx={{ mt: 3 }}>
        <Card sx={{ 
          backgroundColor: '#9c27b0',
          color: 'white',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }
        }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } 
            }}>
              Összes bevétel
            </Typography>
            <Typography variant="h3" sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } 
            }}>
              {orders
                .filter(order => order.statusz !== 'Törölve')
                .reduce((total, order) => total + (Number(order.teljes_ar) || 0), 0)
                .toLocaleString()} Ft
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  </Box>
)}


<Dialog 
  open={orderStatusDialogOpen} 
  onClose={() => setOrderStatusDialogOpen(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      width: { xs: '95%', sm: '80%', md: '60%' },
      maxWidth: '500px'
    }
  }}
>
  <DialogTitle sx={{ 
    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } 
  }}>
    Rendelés státuszának módosítása
  </DialogTitle>
  <DialogContent>
    {selectedOrder && (
      <>
        <Typography variant="body1" gutterBottom sx={{ 
          fontSize: { xs: '0.875rem', sm: '1rem' } 
        }}>
          Rendelés azonosító: {selectedOrder.id}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" gutterBottom sx={{ 
          fontSize: { xs: '0.75rem', sm: '0.875rem' } 
        }}>
          Jelenlegi státusz: {selectedOrder.statusz || 'Feldolgozás alatt'}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' } 
          }}>
            Új státusz kiválasztása:
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1, 
            mt: 1 
          }}>
            {orderStatusOptions.map(status => (
              <FormControlLabel
                key={status}
                control={
                  <Radio
                    checked={newOrderStatus === status}
                    onChange={() => setNewOrderStatus(status)}
                    value={status}
                    name="order-status-radio"
                  />
                }
                label={status}
              />
            ))}
          </Box>
        </Box>
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setOrderStatusDialogOpen(false)}
      size={isMobile ? "small" : "medium"}
    >
      Mégse
    </Button>
    <Button 
      onClick={updateOrderStatus}
      color="primary"
      disabled={!newOrderStatus || newOrderStatus === selectedOrder?.statusz}
      size={isMobile ? "small" : "medium"}
    >
      Státusz módosítása
    </Button>
  </DialogActions>
</Dialog>

                      <Button
          onClick={() => navigate('/admin')}
          variant="contained"
          sx={{ 
            mt: 4,
            bgcolor:  '#555' ,
            '&:hover': { bgcolor:  '#666'  }
          }}
        >
          Vissza az admin felületre
        </Button>
                    </Container>
              
                 
                    <Dialog 
                      open={couponDialogOpen} 
                      onClose={handleCloseCouponDialog}
                      maxWidth="sm"
                      fullWidth
                      PaperProps={{
                        sx: {
                          width: { xs: '95%', sm: '80%', md: '60%' },
                          maxWidth: '600px'
                        }
                      }}
                    >
                      <DialogTitle sx={{ 
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } 
                      }}>
                        Kupon küldése a kiválasztott felhasználóknak
                      </DialogTitle>
                      <DialogContent>
                        <Typography variant="body1" gutterBottom sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' } 
                        }}>
                          Kupon küldése {selectedUsers.length} kiválasztott felhasználónak.
                        </Typography>
                        
                        <TextField
                          label="Lejárati idő (napokban)"
                          type="number"
                          value={expiryDays}
                          onChange={(e) => setExpiryDays(e.target.value)}
                          fullWidth
                          margin="normal"
                          InputProps={{ inputProps: { min: 1 } }}
                          sx={{ mt: 2 }}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button 
                          onClick={handleCloseCouponDialog}
                          size={isMobile ? "small" : "medium"}
                        >
                          Mégse
                        </Button>
                        <Button 
                          onClick={handleSendSelectedCoupons}
                          color="primary"
                          disabled={isSendingCoupons}
                          size={isMobile ? "small" : "medium"}
                        >
                          {isSendingCoupons ? (
                            <>
                              <CircularProgress size={isMobile ? 16 : 24} sx={{ mr: 1 }} />
                              Küldés...
                            </>
                          ) : (
                            'Kuponok küldése'
                          )}
                        </Button>
                      </DialogActions>
                    </Dialog>
            
                    <Dialog 
                      open={allCouponDialogOpen} 
                      onClose={() => setAllCouponDialogOpen(false)}
                      maxWidth="sm"
                      fullWidth
                      PaperProps={{
                        sx: {
                          width: { xs: '95%', sm: '80%', md: '60%' },
                          maxWidth: '600px'
                        }
                      }}
                    >
                      <DialogTitle sx={{ 
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } 
                      }}>
                        Kupon küldése minden felhasználónak
                      </DialogTitle>
                      <DialogContent>
                        <Typography variant="body1" gutterBottom sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' } 
                        }}>
                          Kupon küldése mind a {users.length} felhasználónak.
                        </Typography>
                        
                        <TextField
                          label="Lejárati idő (napokban)"
                          type="number"
                          value={allExpiryDays}
                          onChange={(e) => setAllExpiryDays(e.target.value)}
                          fullWidth
                          margin="normal"
                          InputProps={{ inputProps: { min: 1 } }}
                          sx={{ mt: 2 }}
                        />
                        
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          Figyelem! Ez a művelet minden felhasználónak új kupont küld, függetlenül attól, hogy van-e már aktív kuponjuk.
                        </Alert>
                      </DialogContent>
                      <DialogActions>
                        <Button 
                          onClick={() => setAllCouponDialogOpen(false)}
                          size={isMobile ? "small" : "medium"}
                        >
                          Mégse
                        </Button>
                        <Button 
                          onClick={handleSendAllCoupons}
                          color="primary"
                          disabled={isSendingCoupons}
                          size={isMobile ? "small" : "medium"}
                        >
                          {isSendingCoupons ? (
                            <>
                              <CircularProgress size={isMobile ? 16 : 24} sx={{ mr: 1 }} />
                              Küldés...
                            </>
                          ) : (
                            'Kuponok küldése mindenkinek'
                          )}
                        </Button>
                      </DialogActions>
                    </Dialog>

                   <Dialog 
                      open={deleteDataDialogOpen} 
                      onClose={() => setDeleteDataDialogOpen(false)}
                      maxWidth="sm"
                      fullWidth
                      PaperProps={{
                        sx: {
                          width: { xs: '95%', sm: '80%', md: '60%' },
                          maxWidth: '500px'
                        }
                      }}
                    >
                      <DialogTitle sx={{ 
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                        color: 'error.main'
                      }}>
                        Összes rendelés és vevő törlése
                      </DialogTitle>
                      <DialogContent>
                        <Typography variant="body1" gutterBottom sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' } 
                        }}>
                          Biztosan törölni szeretnéd az összes rendelést és vevőt? Ez a művelet nem visszavonható!
                        </Typography>
                        
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          Ez a művelet az adatbázisból is törli az összes rendelést és vevőt, és nem állítható vissza!
                        </Alert>
                      </DialogContent>
                      <DialogActions>
                        <Button 
                          onClick={() => setDeleteDataDialogOpen(false)}
                          size={isMobile ? "small" : "medium"}
                        >
                          Mégse
                        </Button>
                        <Button 
                          onClick={handleDeleteAllData}
                          color="error"
                          disabled={isDeletingData}
                          size={isMobile ? "small" : "medium"}
                        >
                          {isDeletingData ? (
                            <>
                              <CircularProgress size={isMobile ? 16 : 24} sx={{ mr: 1 }} />
                              Törlés...
                            </>
                          ) : (
                            'Összes adat törlése'
                          )}
                        </Button>
                      </DialogActions>
                    </Dialog>
             
                    <Snackbar
                      open={snackbarOpen}
                      autoHideDuration={6000}
                      onClose={() => setSnackbarOpen(false)}
                      anchorOrigin={{ 
                        vertical: 'bottom', 
                        horizontal: isMobile ? 'center' : 'right' 
                      }}
                      sx={{
                        bottom: { xs: 16, sm: 24 }
                      }}
                    >
                      <Alert 
                        onClose={() => setSnackbarOpen(false)} 
                        severity={snackbarSeverity}
                        sx={{ 
                          width: '100%',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {snackbarMessage}
                      </Alert>
                    </Snackbar>

                    
         <Box sx={{ 
              backgroundColor: '#333' ,
              backgroundSize: '20px 20px',
              pb: 8 
            }}>
            </Box>
                  </Box>
                );
              }
              