import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MenuIcon from '@mui/icons-material/Menu';
import InventoryIcon from '@mui/icons-material/Inventory';
import Menu from '../menu2';

export default function Termadmin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleDelete = async (productId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a terméket?')) {
      try {
        const response = await fetch(`https://adaliclothing.onrender.com/termekek/${productId}`, {
          method: 'DELETE'
        });
  
        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId));
          setSnackbar({
            open: true,
            message: 'Termék sikeresen törölve!',
            severity: 'success'
          });
        }
      } catch (error) {
        console.log('Törlési hiba:', error);
        setSnackbar({
          open: true,
          message: 'Hiba történt a törlés során!',
          severity: 'error'
        });
      }
    }
  };
  
  const [sideMenuActive, setSideMenuActive] = useState(false);

  const toggleSideMenu = () => {
    setSideMenuActive(!sideMenuActive);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://adaliclothing.onrender.com/termekek');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.log('Hiba:', error);
        setSnackbar({
          open: true,
          message: 'Hiba a termékek betöltése során!',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  
  const handleEdit = (product) => {
    setEditingProduct({
      id: product.id,
      nev: product.nev,
      ar: product.ar,
      termekleiras: product.termekleiras,
      keszlet: product.keszlet || 0
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`https://adaliclothing.onrender.com/termekek/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ar: editingProduct.ar,
          termekleiras: editingProduct.termekleiras
        }),
      });

      if (response.ok) {
    
        const stockResponse = await fetch(`https://adaliclothing.onrender.com/termekek/${editingProduct.id}/set-stock`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newStock: parseInt(editingProduct.keszlet)
          }),
        });

        if (stockResponse.ok) {
          setProducts(products.map(p => 
            p.id === editingProduct.id ? {
              ...p,
              ar: editingProduct.ar,
              termekleiras: editingProduct.termekleiras,
              keszlet: parseInt(editingProduct.keszlet)
            } : p
          ));
          setEditingProduct(null);
          setSnackbar({
            open: true,
            message: 'Termék sikeresen frissítve!',
            severity: 'success'
          });
        } else {
          throw new Error('Készlet frissítési hiba');
        }
      } else {
        throw new Error('Termék frissítési hiba');
      }
    } catch (error) {
      console.log('Hiba:', error);
      setSnackbar({
        open: true,
        message: 'Hiba a termék frissítése során!',
        severity: 'error'
      });
    }
  };


  const handleBulkStockUpdate = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://adaliclothing.onrender.com/termekek/set-all-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minStock: 10,
          maxStock: 50
        }),
      });

      if (response.ok) {
        const result = await response.json();

        const updatedProducts = await fetch('https://adaliclothing.onrender.com/termekek').then(res => res.json());
        setProducts(updatedProducts);
        
        setSnackbar({
          open: true,
          message: `${result.products.length} termék készlete sikeresen feltöltve!`,
          severity: 'success'
        });
      } else {
        throw new Error('Készlet feltöltési hiba');
      }
    } catch (error) {
      console.log('Hiba:', error);
      setSnackbar({
        open: true,
        message: 'Hiba a készletek feltöltése során!',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: darkMode ? '#333' : '#333',
        padding: '10px 20px',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <IconButton
          onClick={toggleSideMenu}
          style={{ color: darkMode ? 'white' : 'white' }}
        >
          <MenuIcon />
        </IconButton>
  
        <Typography
          variant="h1"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
            fontSize: '2rem',
            color: 'white',
            margin: 0,
          }}
        >
          Adali Clothing
        </Typography>
      </div>
  
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
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: darkMode ? '#333' : '#f5f5f5',
      backgroundImage: darkMode 
        ? 'radial-gradient(#444 1px, transparent 1px)'
        : 'radial-gradient(#e0e0e0 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      pt: 4,
      pb: 4
    }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          sx={{ 
            color: '#fff',
            mb: 4,
            textAlign: 'center',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Termékek Kezelése
        </Typography>

      
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<InventoryIcon />}
            onClick={handleBulkStockUpdate}
            disabled={loading}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: '8px',
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#388E3C' }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Összes termék készletének feltöltése (10-50 db)'
            )}
          </Button>
        </Box>

        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} md={6} key={product.id}>
              <Card sx={{ 
                p: 3, 
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0,0,0,0.3)'
                  : '0 8px 32px rgba(0,0,0,0.1)',
                backgroundColor: darkMode ? '#444' : '#fff',
                borderRadius: '15px',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                {editingProduct?.id === product.id ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Ár"
                      type="number"
                      value={editingProduct.ar}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        ar: e.target.value
                      })}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.23)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: darkMode ? 'rgba(255,255,255,0.7)' : 'inherit',
                        },
                        '& .MuiInputBase-input': {
                          color: darkMode ? '#fff' : 'inherit',
                        }
                      }}
                    />
                    <TextField
                      label="Leírás"
                      multiline
                      rows={4}
                      value={editingProduct.termekleiras}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        termekleiras: e.target.value
                      })}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.23)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: darkMode ? 'rgba(255,255,255,0.7)' : 'inherit',
                        },
                        '& .MuiInputBase-input': {
                          color: darkMode ? '#fff' : 'inherit',
                        }
                      }}
                    />
          
                    <TextField
                      label="Készlet (db)"
                      type="number"
                      value={editingProduct.keszlet}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        keszlet: e.target.value
                      })}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.23)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: darkMode ? 'rgba(255,255,255,0.7)' : 'inherit',
                        },
                        '& .MuiInputBase-input': {
                          color: darkMode ? '#fff' : 'inherit',
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button 
                        startIcon={<SaveIcon />}
                        variant="contained" 
                        onClick={handleSave}
                        sx={{ 
                          flex: 1,
                          bgcolor: '#4CAF50',
                          '&:hover': { bgcolor: '#388E3C' }
                        }}
                      >
                        Mentés
                      </Button>
                      <Button 
                        startIcon={<CancelIcon />}
                        variant="outlined"
                        onClick={() => setEditingProduct(null)}
                        sx={{ 
                          flex: 1,
                          borderColor: darkMode ? '#fff' : '#333',
                          color: darkMode ? '#fff' : '#333'
                        }}
                      >
                        Mégse
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ height: '100%' }}>
                    <Typography variant="h5" sx={{ 
                      mb: 2, 
                      color: darkMode ? '#fff' : '#333',
                      fontWeight: 500 
                    }}>
                      {product.nev}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography sx={{ 
                      mb: 2,
                      color: darkMode ? '#90caf9' : '#1976d2',
                      fontSize: '1.2rem'
                    }}>
                      {product.ar} Ft
                    </Typography>
                    <Typography sx={{ 
                      mb: 2,
                      color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                      fontSize: '0.95rem'
                    }}>
                      {product.termekleiras}
                    </Typography>
                    
            
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      p: 1.5,
                      borderRadius: '8px',
                      backgroundColor: (product.keszlet <= 5) 
                        ? 'rgba(244, 67, 54, 0.1)' 
                        : 'rgba(76, 175, 80, 0.1)'
                    }}>
                      <InventoryIcon sx={{ 
                        mr: 1, 
                        color: (product.keszlet <= 5) 
                          ? '#f44336' 
                          : '#4caf50'
                      }} />
                      <Typography sx={{ 
                        color: (product.keszlet <= 5) 
                          ? '#f44336' 
                          : (darkMode ? '#8bc34a' : '#4caf50'),
                        fontWeight: 500
                      }}>
                        {product.keszlet === undefined || product.keszlet === null
                          ? 'Nincs készletadat'
                          : product.keszlet <= 0
                            ? 'Nincs készleten'
                            : product.keszlet <= 5
                              ? `Alacsony készlet: ${product.keszlet} db`
                              : `Készleten: ${product.keszlet} db`
                        }
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                      <Tooltip title="Szerkesztés">
                        <IconButton 
                          onClick={() => handleEdit(product)}
                          sx={{ 
                            color: darkMode ? '#90caf9' : '#1976d2'
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Törlés">
                        <IconButton 
                          onClick={() => handleDelete(product.id)}
                          sx={{ 
                            color: '#f44336'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
    
        <Button
          onClick={() => navigate('/admin')}
          variant="contained"
          sx={{ 
            mt: 4,
            bgcolor: darkMode ? '#555' : '#333',
            '&:hover': { bgcolor: darkMode ? '#666' : '#444' }
          }}
        >
          Vissza az admin felületre
        </Button>
      </Container>
    </Box>
    
 
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
    </>
  );
}

