import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Rating as MuiRating, useMediaQuery, useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Tabs, Tab } from '@mui/material';
import Menu from '../menu2';

const RateAdmin = () => {
  const [ratings, setRatings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRating, setEditingRating] = useState(null);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');
  const [shopRatings, setShopRatings] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery('(max-width:400px)');

  const fetchShopRatings = async () => {
    try {
      const response = await fetch('https://adaliclothing.onrender.com/ratings/get-all-ratings');
      const data = await response.json();
     
      
      if (Array.isArray(data)) {
        setShopRatings(data);
      } else {
        console.error('Unexpected response format:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
 
  const fetchUserRatings = async () => {
    try {
      const response = await fetch('https://adaliclothing.onrender.com/ratings/admin/all-user-ratings');
     
      if (!response.ok) {
        console.error('Server error:', response.status);
        setUserRatings([]);
        return;
      }
     
      const data = await response.json();
      console.log('Fetched user ratings:', data);
      setUserRatings(data);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      setUserRatings([]);
    }
  };

  useEffect(() => {
    fetchShopRatings();
    fetchUserRatings();
  }, []);

  const handleEditUserRating = (rating) => {
    setEditingRating(rating);
    setFormData({
      raterUsername: rating.rater_username,
      ratedUsername: rating.rated_username,
      rating: rating.rating,
      velemeny: rating.velemeny
    });
    setOpenDialog(true);
  };

  const handleDeleteUserRating = async (id) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a felhasználói értékelést?')) {
      try {
        const response = await fetch(`https://adaliclothing.onrender.com/ratings/admin/delete-user-rating/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchUserRatings();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const [formData, setFormData] = useState({
    id: null,
    felhasznalonev: '',  
    f_azonosito: null,   
    rating: 0,
    velemeny: '',
    
    raterUsername: '',
    ratedUsername: ''
  });

  const fetchRatings = async () => {
    try {
      const response = await fetch('https://adaliclothing.onrender.com/ratings/get-all-ratings');
      const data = await response.json();
      setRatings(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleEdit = (rating) => {
    if (activeTab === 'shop') {
     
      setFormData({
        id: rating.rating_id,
        felhasznalonev: rating.felhasznalonev,
        f_azonosito: rating.f_azonosito,
        rating: rating.rating,
        velemeny: rating.velemeny || ''
      });
    } else {
     
      setFormData({
        id: rating.rating_id,
        raterUsername: rating.rater_username,
        ratedUsername: rating.rated_username,
        rating: rating.rating,
        velemeny: rating.velemeny || ''
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'shop') {
        
        if (formData.id) {
        
        
        } else {
       
          console.log('Adding new shop rating:', formData);
         
        
          if (!formData.felhasznalonev) {
            alert('Kérlek add meg a felhasználónevet!');
            return;
          }
         
         
          if (!formData.rating) {
            alert('Kérlek add meg az értékelést!');
            return;
          }
         
          const response = await fetch('https://adaliclothing.onrender.com/ratings/add-rating', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              felhasznalonev: formData.felhasznalonev,
              rating: formData.rating,
              velemeny: formData.velemeny
            })
          });
         
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
          }
         
          const data = await response.json();
          console.log('Response from add-rating:', data);
         
          if (data.success) {
            fetchShopRatings();
            setOpenDialog(false);
            setFormData({
              id: null,
              felhasznalonev: '',
              f_azonosito: null,
              rating: 0,
              velemeny: ''
            });
          } else {
            console.error('Failed to add rating:', data.error);
            alert('Hiba történt az értékelés hozzáadásakor: ' + (data.error || 'Ismeretlen hiba'));
          }
        }
      } else {
        
        handleSaveUserRating();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hiba történt: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (activeTab === 'shop') {
       
        const response = await fetch(`https://adaliclothing.onrender.com/ratings/delete-rating/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
       
        if (data.success) {
          fetchShopRatings();
        }
      } else {
       
        const response = await fetch(`https://adaliclothing.onrender.com/ratings/admin/delete-user-rating/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
       
        if (data.success) {
          fetchUserRatings();
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveUserRating = async () => {
    try {
      if (formData.id) {
      
        
      } else {
       
        console.log('Sending user rating data:', {
          raterUsername: formData.raterUsername,
          ratedUsername: formData.ratedUsername,
          rating: formData.rating,
          velemeny: formData.velemeny
        });
       
        const response = await fetch('https://adaliclothing.onrender.com/ratings/admin/add-user-rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            raterUsername: formData.raterUsername,
            ratedUsername: formData.ratedUsername,
            rating: formData.rating,
            velemeny: formData.velemeny
          })
        });
       
       
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', response.status, errorText);
         
          try {
           
            const errorData = JSON.parse(errorText);
            alert('Hiba: ' + (errorData.error || 'Ismeretlen hiba'));
          } catch (e) {
          
            alert('Szerver hiba: ' + response.status + ' - ' + errorText);
          }
          return;
        }
       
        const data = await response.json();
        console.log('Response from add-user-rating:', data);
       
        if (data.success) {
          fetchUserRatings();
          setOpenDialog(false);
          setFormData({
            id: null,
            raterUsername: '',
            ratedUsername: '',
            rating: 0,
            velemeny: ''
          });
        } else {
          console.error('Failed to add user rating:', data.error);
          alert('Hiba történt az értékelés hozzáadásakor: ' + (data.error || 'Ismeretlen hiba'));
        }
      }
    } catch (error) {
      console.error('Error in handleSaveUserRating:', error);
      alert('Hiba történt: ' + error.message);
    }
  };

  return (
    <Box sx={{
      backgroundColor: '#333',
      minHeight: '100vh',
      transition: 'all 0.3s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 0,
      margin: 0,
      overflow: 'hidden'
    }}>
      
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#333',
        padding: { xs: '8px 12px', sm: '10px 20px' },
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <IconButton
          onClick={() => setSideMenuActive(true)}
          sx={{ color: 'white' }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h1" sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 'bold',
          color: 'white',
          fontSize: {
            xs: '1rem',
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
        boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1200,
        transition: 'left 0.3s ease-in-out',
      }}>
        <Menu sideMenuActive={sideMenuActive} toggleSideMenu={() => setSideMenuActive(false)} />
      </Box>

   
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 },
        mt: { xs: 1, sm: 2 }
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-selected': { color: '#60BA97' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minWidth: { xs: 0, sm: 90 },
              padding: { xs: '6px 8px', sm: '12px 16px' }
            },
            '& .MuiTabs-indicator': { backgroundColor: '#60BA97' }
          }}
        >
          <Tab label="Webshop értékelések" value="shop" />
          <Tab label="Felhasználói értékelések" value="user" />
        </Tabs>
      </Box>

      <Box sx={{ 
        p: { xs: 1.5, sm: 3, md: 4 }, 
        mt: { xs: 1, sm: 2, md: 4 } 
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: { xs: 2, sm: 3, md: 4 },
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h4" sx={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
            mb: { xs: 1, sm: 0 }
          }}>
                     {activeTab === 'shop' ? 'Webshop értékelések' : 'Felhasználói értékelések'}
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingRating(null);
              setFormData({
                id: null,
                felhasznalonev: '',
                rating: 0,
                velemeny: '',
                raterUsername: '',
                ratedUsername: ''
              });
              setOpenDialog(true);
            }}
            variant="contained"
            size={isMobile ? "small" : "medium"}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.5, sm: 1 },
              px: { xs: 1, sm: 2 },
              whiteSpace: 'nowrap'
            }}
          >
            Új értékelés
          </Button>
        </Box>

        {activeTab === 'shop' ? (
       
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, minmax(280px, 1fr))',
              md: 'repeat(auto-fill, minmax(300px, 1fr))'
            },
            gap: { xs: 2, sm: 3 }
          }}>
            {shopRatings.length === 0 ? (
              <Typography sx={{ color: '#fff', textAlign: 'center', gridColumn: '1/-1', py: 4 }}>
                Nincsenek webshop értékelések
              </Typography>
            ) : (
              shopRatings.map((rating) => (
                <Card
                  key={rating.rating_id}
                  sx={{
                    backgroundColor: '#444',
                    color: '#fff',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-5px)' }
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ 
                      mb: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>
                      {rating.felhasznalonev}
                    </Typography>
                    <MuiRating
                      value={Number(rating.rating)}
                      readOnly
                      sx={{ mb: 2 }}
                      size={isMobile ? "small" : "medium"}
                    />
                    <Typography sx={{ 
                      mb: 2, 
                      minHeight: { xs: '40px', sm: '60px' },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      {rating.velemeny}
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: '#aaa',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}>
                        {new Date(rating.date).toLocaleDateString()}
                      </Typography>
                      <Box>
                        <IconButton
                          onClick={() => handleEdit(rating)}
                          sx={{
                            color: '#60BA97',
                            '&:hover': { backgroundColor: 'rgba(96, 186, 151, 0.1)' },
                            padding: { xs: 0.5, sm: 1 }
                          }}
                          size={isMobile ? "small" : "medium"}
                        >
                          <EditIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(rating.rating_id)}
                          sx={{
                            color: '#ff4444',
                            '&:hover': { backgroundColor: 'rgba(255, 68, 68, 0.1)' },
                            padding: { xs: 0.5, sm: 1 }
                          }}
                          size={isMobile ? "small" : "medium"}
                        >
                          <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        ) : (
        
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, minmax(280px, 1fr))',
              md: 'repeat(auto-fill, minmax(300px, 1fr))'
            },
            gap: { xs: 2, sm: 3 }
          }}>
            {userRatings.length === 0 ? (
              <Typography sx={{ color: '#fff', textAlign: 'center', gridColumn: '1/-1', py: 4 }}>
                Nincsenek felhasználói értékelések
              </Typography>
            ) : (
              userRatings.map((rating) => (
                <Card
                  key={rating.rating_id}
                  sx={{
                    backgroundColor: '#444',
                    color: '#fff',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-5px)' }
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      mb: 1,
                      gap: { xs: 0.5, sm: 0 }
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1.25rem' }
                      }}>
                        {rating.rater_username}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#aaa',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        értékelte: {rating.rated_username}
                      </Typography>
                    </Box>
                    <MuiRating
                      value={Number(rating.rating)}
                      readOnly
                      sx={{ mb: 2 }}
                      size={isMobile ? "small" : "medium"}
                    />
                    <Typography sx={{ 
                      mb: 2, 
                      minHeight: { xs: '40px', sm: '60px' },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      {rating.velemeny}
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: '#aaa',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}>
                        {new Date(rating.date).toLocaleDateString()}
                      </Typography>
                      <Box>
                        <IconButton
                          onClick={() => handleEdit(rating)}
                          sx={{
                            color: '#60BA97',
                            '&:hover': { backgroundColor: 'rgba(96, 186, 151, 0.1)' },
                            padding: { xs: 0.5, sm: 1 }
                          }}
                          size={isMobile ? "small" : "medium"}
                        >
                          <EditIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(rating.rating_id)}
                          sx={{
                            color: '#ff4444',
                            '&:hover': { backgroundColor: 'rgba(255, 68, 68, 0.1)' },
                            padding: { xs: 0.5, sm: 1 }
                          }}
                          size={isMobile ? "small" : "medium"}
                        >
                          <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isExtraSmall}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          py: { xs: 1.5, sm: 2 }
        }}>
          {formData.id
            ? (activeTab === 'shop' ? 'Webshop értékelés szerkesztése' : 'Felhasználói értékelés szerkesztése')
            : (activeTab === 'shop' ? 'Új webshop értékelés' : 'Új felhasználói értékelés')
          }
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
          {activeTab === 'shop' ? (
         
            <>
              <TextField
                fullWidth
                label="Felhasználónév"
                value={formData.felhasznalonev || ''}
                onChange={(e) => setFormData({...formData, felhasznalonev: e.target.value})}
                margin="normal"
                disabled={formData.id !== null} 
                size={isMobile ? "small" : "medium"}
              />
              <Box sx={{ my: { xs: 1, sm: 2 } }}>
                <Typography component="legend" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Értékelés
                </Typography>
                <MuiRating
                  name="rating"
                  value={Number(formData.rating) || 0}
                  onChange={(event, newValue) => {
                    setFormData({...formData, rating: newValue});
                  }}
                  size={isMobile ? "medium" : "large"}
                />
              </Box>
              <TextField
                fullWidth
                label="Vélemény"
                value={formData.velemeny || ''}
                onChange={(e) => setFormData({...formData, velemeny: e.target.value})}
                margin="normal"
                multiline
                rows={isMobile ? 3 : 4}
                size={isMobile ? "small" : "medium"}
              />
            </>
          ) : (
           
            <>
              <TextField
                fullWidth
                label="Értékelő felhasználó"
                value={formData.raterUsername || ''}
                onChange={(e) => setFormData({...formData, raterUsername: e.target.value})}
                margin="normal"
                disabled={formData.id !== null}
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                fullWidth
                label="Értékelt felhasználó"
                value={formData.ratedUsername || ''}
                onChange={(e) => setFormData({...formData, ratedUsername: e.target.value})}
                margin="normal"
                disabled={formData.id !== null} 
                size={isMobile ? "small" : "medium"}
              />
              <Box sx={{ my: { xs: 1, sm: 2 } }}>
                <Typography component="legend" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Értékelés
                </Typography>
                <MuiRating
                  name="rating"
                  value={Number(formData.rating) || 0}
                  onChange={(event, newValue) => {
                    setFormData({...formData, rating: newValue});
                  }}
                  size={isMobile ? "medium" : "large"}
                />
              </Box>
              <TextField
                fullWidth
                label="Vélemény"
                value={formData.velemeny || ''}
                onChange={(e) => setFormData({...formData, velemeny: e.target.value})}
                margin="normal"
                multiline
                rows={isMobile ? 3 : 4}
                size={isMobile ? "small" : "medium"}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            size={isMobile ? "small" : "medium"}
          >
            Mégse
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            size={isMobile ? "small" : "medium"}
          >
            Mentés
          </Button>
        </DialogActions>
      </Dialog>

    
      <Box sx={{ 
  display: 'flex', 
  justifyContent: 'flex-start',
  mt: { xs: 2, sm: 3 },
  mb: { xs: 3, sm: 4 },
  px: { xs: 2, sm: 3 }
}}>
  <Button
    onClick={() => navigate('/admin')}
    variant="contained"
    startIcon={<ArrowBackIcon />}
    sx={{
      backgroundColor: '#444',
      '&:hover': {
        backgroundColor: '#555'
      },
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      py: { xs: 0.75, sm: 1 },
      color: 'white',
      borderColor: '#555'
    }}
    size={isMobile ? "small" : "medium"}
  >
    Vissza az admin felületre
  </Button>
</Box>
    </Box>
  );
};

export default RateAdmin;

