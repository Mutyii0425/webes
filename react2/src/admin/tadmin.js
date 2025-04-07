import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '../menu2';


export default function Tadmin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nev: '',
    ar: '',
    termekleiras: '',
    kategoria: '',
    imageUrl: '',
    kategoriaId: ''
  });

  const [sideMenuActive, setSideMenuActive] = useState(false);

const toggleSideMenu = () => {
  setSideMenuActive((prev) => !prev);
};
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = React.useRef(null);
  


  const kategoriak = [
    { id: 2, name: 'Nadrágok' },
    { id: 3, name: 'Zokni' },
    { id: 4, name: 'Pólók' },
    { id: 5, name: 'Pulóverek' }
  ];

  const handleChange = (e) => {
    if (e.target.name === 'kategoria') {
      const selectedKategoria = kategoriak.find(k => k.name === e.target.value);
      setFormData({
        ...formData,
        kategoria: e.target.value,
        kategoriaId: selectedKategoria.id
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
  
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob(async (blob) => {
            const formData = new FormData();
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg'
            });
            formData.append('image', compressedFile);
  
            try {
              const uploadResponse = await fetch('https://adaliclothing.onrender.com/upload', {
                method: 'POST',
                body: formData
              });
  
              const result = await uploadResponse.json();
              setSelectedImages(prev => [...prev, `${result.filename}`]);
            } catch (error) {
              console.error('Upload error:', error);
            }
          }, 'image/jpeg', 0.7);
        };
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const updatedFormData = {
      ...formData,
      imageUrl: selectedImages[0]
    };

    try {
      const response = await fetch('https://adaliclothing.onrender.com/termekek/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData)
      });

      const data = await response.json();
  
      if (data.success) {
        alert('Termék sikeresen hozzáadva!');
        setFormData({
          nev: '',
          ar: '',
          termekleiras: '',
          kategoria: '',
          imageUrl: '',
          kategoriaId: ''
        });
      }
    } catch (error) {
      console.error('Hiba történt:', error);
    }
  };
 
  return (
    <Box sx={{ backgroundColor: '#333', minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#333',
        padding: '10px 20px',
        position: 'relative',
      }}>
        <IconButton onClick={toggleSideMenu} style={{ color: 'white' }}>
          <MenuIcon />
        </IconButton>
  
        <Typography variant="h1" sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 'bold',
          fontSize: '2rem',
          color: 'white',
        }}>
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
  
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', color: 'white' }}>
            Új termék hozzáadása
          </Typography>
  
          <Card sx={{ p: 4, backgroundColor: '#444', color: 'white' }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  name="nev"
                  label="Termék neve"
                  value={formData.nev}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#444',
                      color: 'white'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white'
                    }
                  }}
                />
  
                <TextField
                  name="ar"
                  label="Ár"
                  type="number"
                  value={formData.ar}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#444',
                      color: 'white'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white'
                    }
                  }}
                />
  
                <TextField
                  name="termekleiras"
                  label="Termék leírása"
                  multiline
                  rows={4}
                  value={formData.termekleiras}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#444',
                      color: 'white'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white'
                    }
                  }}
                />
  
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>Kategória</InputLabel>
                  <Select
                    name="kategoria"
                    value={formData.kategoria}
                    onChange={handleChange}
                    required
                    sx={{
                      backgroundColor: '#444',
                      color: 'white',
                      '& .MuiSvgIcon-root': {
                        color: 'white'
                      }
                    }}
                  >
                    {kategoriak.map((kategoria) => (
                      <MenuItem key={kategoria.id} value={kategoria.name}>
                        {kategoria.name} (ID: {kategoria.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
  
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>Kategória ID</InputLabel>
                  <Select
                    name="kategoriaId"
                    value={formData.kategoriaId}
                    onChange={handleChange}
                    required
                    sx={{
                      backgroundColor: '#444',
                      color: 'white',
                      '& .MuiSvgIcon-root': {
                        color: 'white'
                      }
                    }}
                  >
                    <MenuItem value={2}>2 - Nadrágok</MenuItem>
                    <MenuItem value={3}>3 - Zokni</MenuItem>
                    <MenuItem value={4}>4 - Pólók</MenuItem>
                    <MenuItem value={5}>5 - Pulóverek</MenuItem>
                  </Select>
                </FormControl>
  
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'grey.500',
                    borderRadius: 2,
                    p: 3,
                    mb: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#444'
                  }}
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    hidden
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
  
                  {selectedImages && selectedImages.length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedImages.map((image, index) => (
                        <Grid item xs={6} sm={4} key={index}>
                          <Box
                            sx={{
                              position: 'relative',
                              height: '200px',
                              width: '100%',
                              borderRadius: '8px',
                              overflow: 'hidden'
                            }}
                          >
                            <img
                              src={image}
                              alt={`Feltöltött kép ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box>
                      <CloudUploadIcon sx={{ fontSize: 60, mb: 2, color: 'white' }} />
                      <Typography sx={{ color: 'white' }}>
                        Húzd ide a képeket vagy kattints a feltöltéshez
                      </Typography>
                    </Box>
                  )}
                </Box>
  
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ 
                    mt: 2,
                    backgroundColor: '#666',
                    '&:hover': {
                      backgroundColor: '#777'
                    }
                  }}
                >
                  Termék hozzáadása
                </Button>
              </Box>
            </form>
          </Card>
        </Box>
  
        <Button
          onClick={() => navigate('/admin')}
          variant="contained"
          sx={{
            mb: 3,
            backgroundColor: '#666',
            '&:hover': {
              backgroundColor: '#777'
            }
          }}
        >
          Vissza az admin felületre
        </Button>
      </Container>
    </Box>
  );
}
