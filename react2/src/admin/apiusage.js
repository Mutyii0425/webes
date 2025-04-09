import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  Card,
  Grid,
  Divider,
  IconButton,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '../menu2';

export default function ApiUsage() {
  const navigate = useNavigate();
  const [apiUsage, setApiUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const toggleSideMenu = () => {
    setSideMenuActive(!sideMenuActive);
  };

  const fetchApiUsage = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://adaliclothing.onrender.com/api/usage');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API usage error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('API usage data received:', data);
      
   
      if (!Array.isArray(data)) {
        console.warn('API usage data is not an array:', data);
        setApiUsage([]);
      } else {
        setApiUsage(data);
      }
    } catch (error) {
      console.log('Hiba:', error);
      setSnackbar({
        open: true,
        message: 'Hiba történt az adatok betöltésekor: ' + error.message,
        severity: 'error'
      });
      setApiUsage([]);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchApiUsage();
  }, []);

  const handleReset = async (apiName) => {
    if (window.confirm(`Biztosan nullázni szeretnéd a(z) ${apiName} használati számlálóját?`)) {
      try {
        const response = await fetch('https://adaliclothing.onrender.com/api/usage/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiName }),
        });

        if (response.ok) {
          fetchApiUsage();
          setSnackbar({
            open: true,
            message: 'Számláló sikeresen nullázva!',
            severity: 'success'
          });
        }
      } catch (error) {
        console.log('Hiba:', error);
        setSnackbar({
          open: true,
          message: 'Hiba történt a számláló nullázásakor',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              mb: 2,
              textAlign: 'center',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            API Használat Figyelése
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mb: 2 
          }}>
            <Button 
              startIcon={<RefreshIcon />}
              variant="contained"
              onClick={fetchApiUsage}
              sx={{ 
                bgcolor: darkMode ? '#555' : '#333',
                '&:hover': { bgcolor: darkMode ? '#666' : '#444' }
              }}
            >
              Frissítés
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress sx={{ color: '#fff' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {Array.isArray(apiUsage) && apiUsage.length > 0 ? (
  apiUsage.map((api) => (
    <Grid item xs={12} key={api.id}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" sx={{ 
                        color: darkMode ? '#fff' : '#333',
                        fontWeight: 500 
                      }}>
                       {api.api_name === 'vision_api' ? 'Google Vision API (1. fiók)' : 
                       api.api_name === 'style_api' ? 'Google Vision API (2. fiók)' :    
                        api.api_name}
                      </Typography>
                      <Tooltip title="Számláló nullázása">
                        <IconButton 
                          onClick={() => handleReset(api.api_name)}
                          sx={{ 
                            color: darkMode ? '#90caf9' : '#1976d2'
                          }}
                        >
                          <RestartAltIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ 
                          color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                        }}>
                          Használat:
                        </Typography>
                        <Typography sx={{ 
                          color: api.usage_count > 900 ? '#f44336' : (api.usage_count > 700 ? '#ff9800' : '#4caf50'),
                          fontWeight: 'bold'
                        }}>
                          {api.usage_count} / 1000
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={(api.usage_count / 1000) * 100}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: api.usage_count > 900 ? '#f44336' : (api.usage_count > 700 ? '#ff9800' : '#4caf50'),
                            borderRadius: 5
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Typography sx={{ 
                        color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                      }}>
                        Következő nullázás: {formatDate(api.reset_date)}
                      </Typography>
                      <Typography sx={{ 
                        color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                      }}>
                        Utolsó frissítés: {new Date(api.last_updated).toLocaleString('hu-HU')}
                      </Typography>
                    </Box>
                    
                    {api.usage_count > 900 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Figyelem! Közel jársz az ingyenes kvóta (1000 kép/hó) határához.
                      </Alert>
                    )}
                  </Card>
                </Grid>
              ))
            ) : (
                <Grid item xs={12}>
                  <Card sx={{ 
                    p: 3, 
                    boxShadow: darkMode 
                      ? '0 8px 32px rgba(0,0,0,0.3)'
                      : '0 8px 32px rgba(0,0,0,0.1)',
                    backgroundColor: darkMode ? '#444' : '#fff',
                    borderRadius: '15px',
                  }}>
                    <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#333' }}>
                      Nincs elérhető API használati adat
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
          
          <Box sx={{ mt: 4 }}>
            <Card sx={{ 
              p: 3, 
              boxShadow: darkMode 
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              backgroundColor: darkMode ? '#444' : '#fff',
              borderRadius: '15px',
            }}>
              <Typography variant="h6" sx={{ 
                color: darkMode ? '#fff' : '#333',
                mb: 2
              }}>
                Google Vision API információk
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography sx={{ 
                color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                mb: 1
              }}>
                • Ingyenes kvóta: 1000 kép / hónap
              </Typography>
              <Typography sx={{ 
                color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                mb: 1
              }}>
                • Díj a kvóta túllépése esetén: $1.50 USD / 1000 kép (kb. 525 Ft / 1000 kép)
              </Typography>
              <Typography sx={{ 
                color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                mb: 1
              }}>
                • A számláló minden hónap elején automatikusan nullázódik
              </Typography>
              <Typography sx={{ 
                color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
              }}>
                • Ha eléred a kvótát, az AI képelemzés automatikusan kikapcsol a következő hónapig
              </Typography>
            </Card>
          </Box>
    
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
