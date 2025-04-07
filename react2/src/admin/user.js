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
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '../menu2';

export default function User() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sideMenuActive, setSideMenuActive] = useState(false);

  const toggleSideMenu = () => {
    setSideMenuActive(!sideMenuActive);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
        if (user && user.email === 'adaliclothing@gmail.com') {
          navigate('/vinted');
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://adaliclothing.onrender.com/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.log('Hiba:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a terméket?')) {
      try {
        const response = await fetch(`https://adaliclothing.onrender.com/products/${productId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId));
          alert('Termék sikeresen törölve!');
        }
      } catch (error) {
        console.log('Törlési hiba:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({
      id: product.id,
      nev: product.nev,
      ar: product.ar,
      leiras: product.leiras,
      meret: product.meret
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`https://adaliclothing.onrender.com/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ar: editingProduct.ar,
          nev: editingProduct.nev,
          leiras: editingProduct.leiras,
          meret: editingProduct.meret
        
        }),
      });

      if (response.ok) {
        setProducts(products.map(p =>
          p.id === editingProduct.id ? editingProduct : p
        ));
        setEditingProduct(null);
        alert('Termék sikeresen frissítve!');
      }
    } catch (error) {
      console.log('Hiba:', error);
    }
  };

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#333',
        padding: '10px 20px',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <IconButton
          onClick={toggleSideMenu}
          style={{ color: 'white' }}
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
        backgroundColor: '#333',
        backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
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
            Felhasználói Termékek Kezelése
          </Typography>

          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} md={6} key={product.id}>
                <Card sx={{
                  p: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  backgroundColor: '#444',
                  borderRadius: '15px',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}>
                  {editingProduct?.id === product.id ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Név"
                        value={editingProduct.nev}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          nev: e.target.value
                        })}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.5)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                          '& .MuiInputBase-input': {
                            color: '#fff',
                          }
                        }}
                      />
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
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.5)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                          '& .MuiInputBase-input': {
                            color: '#fff',
                          }
                        }}
                      />
                      <TextField
                        label="Méret"
                        value={editingProduct.meret}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          meret: e.target.value
                        })}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.5)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                          '& .MuiInputBase-input': {
                            color: '#fff',
                          }
                        }}
                      />
                     
                      <TextField
                        label="Leírás"
                        multiline
                        rows={4}
                        value={editingProduct.leiras}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          leiras: e.target.value
                        })}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.5)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                          '& .MuiInputBase-input': {
                            color: '#fff',
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
                            borderColor: '#fff',
                            color: '#fff'
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
                        color: '#fff',
                        fontWeight: 500
                      }}>
                        {product.nev}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography sx={{
                        mb: 2,
                        color: '#90caf9',
                        fontSize: '1.2rem'
                      }}>
                        {product.ar} Ft
                      </Typography>
                      <Typography sx={{
                        mb: 2,
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.95rem'
                      }}>
                        Méret: {product.meret}
                      </Typography>
                      <Typography sx={{
                        mb: 3,
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.95rem'
                      }}>
                        {product.leiras}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                        <Tooltip title="Szerkesztés">
                          <IconButton
                            onClick={() => handleEdit(product)}
                            sx={{
                              color: '#90caf9'
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
              bgcolor: '#555',
              '&:hover': { bgcolor: '#666' }
            }}
          >
            Vissza az admin felületre
          </Button>
        </Container>
      </Box>
    </>
  );
}