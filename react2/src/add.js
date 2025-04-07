import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton,
  TextField,
  Paper,
  Container,
  FormGroup,
  FormControlLabel,
  Switch,
  Popper,
  Grow,
  
  useMediaQuery,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Badge,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { FormHelperText } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Menu from './menu2';
import Footer from './footer';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import InactivityAlert from './InactivityAlert';




function Add() {
const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
const cartItemCount = cartItems.reduce((total, item) => total + item.mennyiseg, 0);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [showUploadInfo, setShowUploadInfo] = useState(true);
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [sideMenuActive, setSideMenuActive] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorAlertShown, setErrorAlertShown] = useState(false);
    const isExtraSmall = useMediaQuery('(max-width:400px)');
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const fileInputRef = React.useRef(null);
  const anchorRef = React.useRef(null);




  const navigate = useNavigate();

  const handleSubmit = async () => {
    // Check if user is logged in first
    if (!isLoggedIn) {
      // Show login required message
      const alertBox = document.createElement('div');
      alertBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${darkMode ? '#333' : '#fff'};
        color: ${darkMode ? '#fff' : '#333'};
        padding: 30px 50px;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: fadeIn 0.5s ease-in-out;
        text-align: center;
        min-width: 300px;
        border: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
        backdrop-filter: blur(10px);
      `;
      alertBox.innerHTML = `
        <div style="
          width: 60px;
          height: 60px;
          background: #f44336;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 style="
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 600;
          color: ${darkMode ? '#ff6b6b' : '#f44336'};
        ">Bejelentkezés szükséges</h3>
        <p style="
          margin: 0;
          font-size: 16px;
          color: ${darkMode ? '#aaa' : '#666'};
        ">A ruha feltöltéshez be kell jelentkezni.</p>
        <button style="
          margin-top: 20px;
          background: ${darkMode ? '#555' : '#eee'};
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          color: ${darkMode ? '#fff' : '#333'};
        ">Bejelentkezés</button>
      `;
      
      document.body.appendChild(alertBox);
      
    
      const button = alertBox.querySelector('button');
      button.onclick = () => {
        navigate('/sign');
        document.body.removeChild(alertBox);
      };
      
      
      setTimeout(() => {
        if (document.body.contains(alertBox)) {
          alertBox.style.animation = 'fadeOut 0.5s ease-in-out';
          setTimeout(() => {
            if (document.body.contains(alertBox)) {
              document.body.removeChild(alertBox);
            }
          }, 500);
        }
      }, 5000);
      
      return; 
    }
  
    if (!validateForm()) {
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const feltolto = user ? (user.username || user.felhasznalonev) : null;
    
    console.log('Felhasználó adatok:', user);
    console.log('Feltöltő:', feltolto);
  
  if (!feltolto) {
   
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${darkMode ? '#333' : '#fff'};
      color: ${darkMode ? '#fff' : '#333'};
      padding: 30px 50px;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      animation: fadeIn 0.5s ease-in-out;
      text-align: center;
      min-width: 300px;
      border: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      backdrop-filter: blur(10px);
    `;
    alertBox.innerHTML = `
      <div style="
        width: 60px;
        height: 60px;
        background: #f44336;
        border-radius: 50%;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 style="
        margin: 0 0 10px 0;
        font-size: 24px;
        font-weight: 600;
        color: ${darkMode ? '#ff6b6b' : '#f44336'};
      ">Hiba</h3>
      <p style="
        margin: 0;
        font-size: 16px;
        color: ${darkMode ? '#aaa' : '#666'};
      ">Nem sikerült azonosítani a felhasználót. Kérjük, jelentkezz be újra.</p>
      <button style="
        margin-top: 20px;
        background: ${darkMode ? '#555' : '#eee'};
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        color: ${darkMode ? '#fff' : '#333'};
      ">Bejelentkezés</button>
    `;
    
    document.body.appendChild(alertBox);
    
    const button = alertBox.querySelector('button');
    button.onclick = () => {
      navigate('/sign');
      document.body.removeChild(alertBox);
    };
    
    setTimeout(() => {
      if (document.body.contains(alertBox)) {
        alertBox.style.animation = 'fadeOut 0.5s ease-in-out';
        setTimeout(() => {
          if (document.body.contains(alertBox)) {
            document.body.removeChild(alertBox);
          }
        }, 500);
      }
    }, 5000);
    
    return;
  }
    
  const termekAdatok = {
    kategoriaId: parseInt(selectedCategory),
    ar: parseInt(price),
    nev: title,
    leiras: description,
    meret: size,
    imageUrl: selectedImages[0],
    images: selectedImages,
    feltolto: feltolto
  };
  
  console.log('Küldendő adatok:', termekAdatok);
  
  try {
    const response = await fetch('https://adaliclothing.onrender.com/usertermekek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(termekAdatok)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Szerver hiba:', errorData);
      alert(`Hiba történt a termék feltöltése során: ${errorData.error || 'Ismeretlen hiba'}`);
      return;
    }
    
    const data = await response.json();
    console.log('Sikeres válasz:', data);
  
    if (response.ok) {
      const alertBox = document.createElement('div');
      alertBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${darkMode ? '#333' : '#fff'};
        color: ${darkMode ? '#fff' : '#333'};
        padding: ${isExtraSmall ? '15px 20px' : '30px 50px'};
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: fadeIn 0.5s ease-in-out;
        text-align: center;
        min-width: ${isExtraSmall ? '200px' : '300px'};
        max-width: ${isExtraSmall ? '85%' : '90%'};
        width: ${isExtraSmall ? 'auto' : 'auto'};
        border: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
        backdrop-filter: blur(10px);
      `;
      alertBox.innerHTML = `
        <div style="
          width: ${isExtraSmall ? '30px' : '30px'};
          height: ${isExtraSmall ? '30px' : '30px'};
          background: #4CAF50;
          border-radius: 50%;
          margin: 0 auto ${isExtraSmall ? '8px' : '8px'};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="${isExtraSmall ? '15px' : '15px'}" height="${isExtraSmall ? '15px' : '15px'}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 style="
          margin: 0 0 4px 0;
          font-size: ${isExtraSmall ? '14px' : '14px'};
          font-weight: 600;
          color: ${darkMode ? '#90caf9' : '#1976d2'};
          padding: 0 5px;
        ">Sikeres feltöltés!</h3>
        <p style="
          margin: 0;
          font-size: ${isExtraSmall ? '11px' : '11px'};
          color: ${darkMode ? '#aaa' : '#666'};
          padding: 0 5px;
          max-width: ${isExtraSmall ? '130px' : '130px'};
          margin: 0 auto;
        ">Köszönjük, hogy használod az Adali Clothing-ot!</p>
      `;
    

  
        document.body.appendChild(alertBox);
  
        setTimeout(() => {
          alertBox.style.animation = 'fadeOut 0.5s ease-in-out';
          setTimeout(() => {
            document.body.removeChild(alertBox);
            navigate('/vinted');
          }, 500);
        }, 2000);
  
  
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeIn {
            from { 
              opacity: 0; 
              transform: translate(-50%, -60%) scale(0.8); 
            }
            to { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(1); 
            }
          }
          @keyframes fadeOut {
            from { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(1); 
            }
            to { 
              opacity: 0; 
              transform: translate(-50%, -40%) scale(0.8); 
            }
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error('Hiba:', error);
    }
  };
  
  
  
  useEffect(() => {
    const checkLoginStatus = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserName(user.username || user.felhasznalonev || 'Felhasználó');
      } else {
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    setShowUploadInfo(true);
  }, []);

  useEffect(() => { 
    setSize('');
  }, [selectedCategory]);

  useEffect(() => {
    fetch('https://adaliclothing.onrender.com/categories')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.log('Error:', error));
  }, []);

useEffect(() => {
  if (sideMenuActive) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}, [sideMenuActive]);

const [selectedImages, setSelectedImages] = useState([]);

const [errors, setErrors] = useState({
  title: false,
  price: false,
  description: false,
  size: false,
  selectedCategory: false
});

const validateForm = () => {
  const newErrors = {};
  let isValid = true;

  if (!title.trim()) {
    newErrors.title = true;
    isValid = false;
  }
  if (!price.trim()) {
    newErrors.price = true;
    isValid = false;
  }
  if (!description.trim()) {
    newErrors.description = true;
    isValid = false;
  }
  if (!size.trim()) {
    newErrors.size = true;
    isValid = false;
  }
  if (!selectedCategory) {
    newErrors.selectedCategory = true;
    isValid = false;
  }
  if (!selectedImages || selectedImages.length < 2) {
    newErrors.images = true;
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};

const analyzeImageWithAI = async (imageData) => {
  if (isAnalyzing) return;
  try {
    console.log('AI elemzés indítása...');
    setIsAnalyzing(true);

    const response = await fetch('https://adaliclothing.onrender.com/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error) {
        console.error('API hiba:', data.error);
        showErrorMessage(data.error);
      }
      setIsAnalyzing(false);
      return;
    }

    console.log('AI elemzés eredménye:', data);
    
    // Ellenőrizzük, hogy az AI talált-e ruhát a képen
    if (data.noClothingDetected || !data.suggestedCategory) {
      console.error('Nem ismerhető fel ruha a képen');
      // Vizuális figyelmeztetés megjelenítése
      showErrorMessage('Nem ismerhető fel ruha a képen. Kérjük, töltsön fel egy másik képet!');
      setIsAnalyzing(false);
      return;
    }

    // Az eredmények beállítása a form mezőkbe
    setSelectedCategory(data.suggestedCategory);
    setDescription(data.suggestedDescription);
    
    setIsAnalyzing(false);
  } catch (error) {
    console.error('Hiba az AI elemzés során:', error);
    showErrorMessage('Hiba történt a kép elemzése során. Kérjük, próbálja újra.');
    setIsAnalyzing(false);
  }
};




// Új state változó a hibaüzenet állapotának nyomon követéséhez


// Módosított showErrorMessage függvény
const showErrorMessage = (message) => {
  // Ha már van megjelenített hibaüzenet, ne jelenítsen meg újat
  if (errorAlertShown) return;
  
  // Beállítjuk, hogy van megjelenített hibaüzenet
  setErrorAlertShown(true);
  
  const alertBox = document.createElement('div');
  alertBox.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${darkMode ? '#333' : '#fff'};
    color: ${darkMode ? '#fff' : '#333'};
    padding: 30px 50px;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    animation: fadeIn 0.5s ease-in-out;
    text-align: center;
    min-width: 300px;
    border: 1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    backdrop-filter: blur(10px);
  `;
  alertBox.innerHTML = `
    <div style="
      width: 60px;
      height: 60px;
      background: #f44336;
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h3 style="
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: 600;
      color: ${darkMode ? '#ff6b6b' : '#f44336'};
    ">Figyelmeztetés</h3>
    <p style="
      margin: 0;
      font-size: 16px;
      color: ${darkMode ? '#aaa' : '#666'};
    ">${message}</p>
    <button style="
      margin-top: 20px;
      background: ${darkMode ? '#555' : '#eee'};
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      color: ${darkMode ? '#fff' : '#333'};
    ">Rendben</button>
  `;

  document.body.appendChild(alertBox);
  
  // Amikor eltávolítjuk az alertet, visszaállítjuk az errorAlertShown értékét
  const removeAlert = () => {
    if (document.body.contains(alertBox)) {
      document.body.removeChild(alertBox);
    }
    setErrorAlertShown(false);
  };
  
  const button = alertBox.querySelector('button');
  button.onclick = () => {
    alertBox.style.animation = 'fadeOut 0.3s ease-in-out';
    setTimeout(removeAlert, 300);
  };
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -60%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translate(-50%, -50%); }
      to { opacity: 0; transform: translate(-50%, -40%); }
    }
  `;
  document.head.appendChild(style);
  
  // Automatikusan eltávolítjuk 5 másodperc után
  setTimeout(() => {
    if (document.body.contains(alertBox)) {
      alertBox.style.animation = 'fadeOut 0.3s ease-in-out';
      setTimeout(removeAlert, 300);
    }
  }, 5000);
};
    


const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  
  // Töröljük a korábbi hibaüzenet állapotot
  setErrorAlertShown(false);
  
  // Ha a feltöltött képek száma + a már meglévő képek száma csak 1 lesz,
  // akkor figyelmeztessük a felhasználót
  if (selectedImages.length === 0 && files.length === 1) {
    setTimeout(() => {
      showErrorMessage('Legalább 2 képet kell feltölteni az AI elemzés elindításához');
    }, 300);
  }
  
  // Tároljuk az összes új képet egy tömbben
  const newImages = [];
  let loadedCount = 0;
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
        
        newImages.push(compressedImage);
        loadedCount++;
        
        // Ha minden kép betöltődött, akkor frissítjük a state-et
        if (loadedCount === files.length) {
          setSelectedImages(prevImages => {
            const allImages = [...prevImages, ...newImages];
            console.log(`Képek száma: ${allImages.length}`);
            
            // Ha legalább 2 kép van, és korábban nem volt legalább 2 kép,
            // akkor indítsuk el az AI elemzést
            if (allImages.length >= 2 && prevImages.length < 2) {
              console.log('Legalább 2 kép feltöltve, AI elemzés indítása...');
              // Kis késleltetéssel indítjuk, hogy a state frissülhessen
              setTimeout(() => {
                if (!errorAlertShown) {
                  analyzeImageWithAI(allImages[0]);
                }
              }, 500);
            }
            
            return allImages;
          });
        }
      };
    };
    reader.readAsDataURL(file);
  });
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
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
};

const handleCartClick = () => {
    navigate('/kosar');
};

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    borderRadius: 2,
    color: darkMode ? '#fff' : '#000'
  },
  '& .MuiInputLabel-root': {
    color: darkMode ? '#fff' : '#000'
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255,255,255,0.3)'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255,255,255,0.5)'
  }
};

<input
    type="file"
    hidden
    multiple
    ref={fileInputRef}
    onChange={handleImageUpload}
    accept="image/*"
/>
const handleToggle = () => {
  setOpen((prevOpen) => !prevOpen);
};

const handleClose = (event = {}) => {
  if (event.target && anchorRef.current && anchorRef.current.contains(event.target)) {
    return;
  }
  setOpen(false);
};

const handleListKeyDown = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
    setOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setShowLogoutAlert(false);
    navigate('/sign');
  };

  const toggleSideMenu = () => {
    setSideMenuActive((prev) => !prev);
  };
  

  return (
<div style={{
  backgroundColor: darkMode ? '#333' : '#f5f5f5',
  backgroundImage: darkMode 
    ? 'radial-gradient(#444 1px, transparent 1px)'
    : 'radial-gradient(#aaaaaa 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  color: darkMode ? 'white' : 'black',
  minHeight: '100vh',
  paddingBottom: '100px',
  transition: 'all 0.3s ease-in-out' 
}}>
    
<Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: darkMode ? '#333' : '#333',
          padding: isExtraSmall ? '8px 12px' : '10px 20px',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          borderBottom: '3px solid #ffffff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
          marginBottom: '10px', 
        }}
      >
        <IconButton
          onClick={toggleSideMenu}
          sx={{ 
            color: darkMode ? 'white' : 'white',
            padding: isExtraSmall ? '4px' : '8px'
          }}
          aria-label="Menu"
        >
          <MenuIcon fontSize={isExtraSmall ? "small" : "medium"} />
        </IconButton>
      
        <Typography
          variant="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: {
              xs: isExtraSmall ? '0.9rem' : '1.1rem',
              sm: '1.5rem',   
              md: '2rem'      
            },
            textAlign: 'center',
            color: 'white',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'auto',
            pointerEvents: 'none'
          }}
        >
          Adali Clothing
        </Typography>
        <Box sx={{ display: 'flex', gap: isExtraSmall ? '5px' : '10px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', gap: isExtraSmall ? '5px' : '10px', alignItems: 'center' }}>
              <IconButton
                onClick={handleCartClick}
                sx={{
                  color: '#fff',
                  padding: isExtraSmall ? '4px' : '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                aria-label="Kosár"
              >
                <Badge 
                  badgeContent={cartItemCount} 
                  color="primary"
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: '#fff', 
                      color: '#333',
                      fontSize: isExtraSmall ? '0.6rem' : '0.75rem',
                      minWidth: isExtraSmall ? '14px' : '20px',
                      height: isExtraSmall ? '14px' : '20px'
                    } 
                  }}
                >
                  <ShoppingCartIcon fontSize={isExtraSmall ? "small" : "medium"} />
                </Badge>
              </IconButton>
              <IconButton
                ref={anchorRef}
                onClick={handleToggle}
                sx={{
                  color: '#fff',
                  zIndex: 1300,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  padding: isExtraSmall ? '4px' : '8px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
                  }
                }}
                aria-label="Felhasználói menü"
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
              >
                <PersonIcon fontSize={isExtraSmall ? "small" : "medium"} />
              </IconButton>
              <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                transition
                disablePortal
                sx={{ 
                  zIndex: 1300,
                  mt: 1, 
                  '& .MuiPaper-root': {
                    overflow: 'hidden',
                    borderRadius: '12px',
                    boxShadow: darkMode 
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: darkMode 
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.05)',
                  }
                }}
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                    }}
                  >
                    <Paper
                      sx={{
                        backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
                        minWidth: isExtraSmall ? '180px' : '200px',
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList 
                          autoFocusItem={open} 
                          id="menu-list-grow"
                          onKeyDown={handleListKeyDown}
                          sx={{ py: 1 }}
                        >
                          <MenuItem 
                            onClick={handleClose}
                            sx={{
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1" sx={{ 
                              fontWeight: 500,
                              fontSize: isExtraSmall ? '0.8rem' : 'inherit'
                            }}>
                              {userName} profilja
                            </Typography>
                          </MenuItem>

                          <MenuItem 
                            onClick={() => {
                              handleClose();
                              navigate('/fiokom');
                            }}
                            sx={{
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1" sx={{ fontSize: isExtraSmall ? '0.8rem' : 'inherit' }}>
                              Fiókom
                            </Typography>
                          </MenuItem>

                          <MenuItem 
                            onClick={handleClose}
                            sx={{
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: darkMode ? '#fff' : '#333',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                              },
                              gap: 2,
                            }}
                          >
                            <Typography variant="body1" sx={{ fontSize: isExtraSmall ? '0.8rem' : 'inherit' }}>
                            {(() => {
                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                if (user.kupon) {
                                  if (user.kupon_hasznalva) {
                                    return `Kupon: ${user.kupon} (Felhasználva)`;
                                  } else if (user.kupon === 'Nincs nyeremény') {
                                    return `Kupon: ${user.kupon} `;
                                  } else {
                                    return `Kupon: ${user.kupon} (Aktív)`;
                                  }
                                } else {
                                  return 'Nincs kuponod';
                                }
                              })()}
                            </Typography>
                          </MenuItem>
                          <MenuItem 
                            onClick={handleLogout}
                            sx={{
                              py: isExtraSmall ? 1 : 1.5,
                              px: isExtraSmall ? 1.5 : 2,
                              color: '#ff4444',
                              '&:hover': {
                                backgroundColor: 'rgba(255,68,68,0.1)',
                              },
                              gap: 2,
                              borderTop: '1px solid',
                              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              mt: 1,
                            }}
                          >
                            <Typography variant="body1" sx={{ fontSize: isExtraSmall ? '0.8rem' : 'inherit' }}>
                              Kijelentkezés
                            </Typography>
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
          ) : (
            <>
            <Button
              component={Link}
              to="/sign"
              sx={{
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '5px',
                padding: {
                  xs: isExtraSmall ? '1px 3px' : '2px 6px',
                  sm: '5px 10px'
                },
                fontSize: {
                  xs: isExtraSmall ? '0.55rem' : '0.7rem',
                  sm: '1rem'
                },
                whiteSpace: 'nowrap',
                minWidth: isExtraSmall ? '40px' : 'auto',
                height: isExtraSmall ? '24px' : 'auto',
                marginRight: isExtraSmall ? '2px' : 'auto',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#333',
                },
              }}
            >
              {isExtraSmall ? 'Sign In' : 'Sign In'}
            </Button>
            
            <Button
              component={Link}
              to="/signup"
              sx={{
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '5px',
                padding: {
                  xs: isExtraSmall ? '1px 3px' : '2px 6px',
                  sm: '5px 10px'
                },
                fontSize: {
                  xs: isExtraSmall ? '0.55rem' : '0.7rem',
                  sm: '1rem'
                },
                whiteSpace: 'nowrap',
                minWidth: isExtraSmall ? '40px' : 'auto',
                height: isExtraSmall ? '24px' : 'auto',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#333',
                },
              }}
            >
              {isExtraSmall ? 'Sign Up' : 'Sign Up'}
            </Button>
            </>
          )}
        </Box>
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
        transition: 'left 0.1s ease-in-out',
      }}>
        <Menu sideMenuActive={sideMenuActive} toggleSideMenu={toggleSideMenu} />
      </Box>

      <FormGroup sx={{ position: 'absolute', top: 60, right: 20 }}>
        <FormControlLabel
          control={
            <Switch
              color="default"
              checked={darkMode}
              onChange={() => setDarkMode((prev) => !prev)}
            />
          }
          label="Dark Mode"
        />
      </FormGroup>



   <Container maxWidth="lg" sx={{ mt: 10, mb: 2 }}>
  <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
    <Card elevation={8} sx={{
      flex: 2,
      backgroundColor: darkMode ? '#333' : '#fff',
      borderRadius: 3,
      padding: 4,
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)'
      }
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: darkMode ? '#fff' : '#333',
        borderBottom: '2px solid',
        borderColor: darkMode ? '#555' : '#ddd',
        paddingBottom: 2,
        marginBottom: 4
      }}>
        Ruha feltöltése
      </Typography>



      <input
  type="file"
  hidden
  multiple
  ref={fileInputRef}
  onChange={handleImageUpload}
  accept="image/*"
/>
<Box
  sx={{
    border: '2px dashed',
    borderColor: errors.images ? '#ff6b6b' : (darkMode ? 'grey.500' : 'grey.300'),
    borderRadius: 2,
    p: 3,
    mb: 3,
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    position: 'relative'
  }}
  onClick={() => fileInputRef.current.click()}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
>
  {isAnalyzing && (
    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 10,
      borderRadius: 2
    }}>
      <CircularProgress sx={{ color: '#fff', mb: 2 }} />
      <Typography sx={{ color: '#fff' }}>
        Kép elemzése folyamatban...
      </Typography>
    </Box>
  )}
  
  {selectedImages && selectedImages.length > 0 ? (
    <>
      <Grid container spacing={3}>
        {selectedImages.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box sx={{
              position: 'relative',
              height: '300px',
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <img
                src={image}
                alt={`Feltöltött kép ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
      {errors.images && (
        <Typography sx={{ color: '#ff6b6b', mt: 2 }}>
          Minimum 2 képet kell feltölteni
        </Typography>
      )}
    </>
  ) : (
    <Box>
      <CloudUploadIcon sx={{ fontSize: 60, mb: 2, color: errors.images ? '#ff6b6b' : (darkMode ? 'grey.400' : 'grey.600') }} />
      <Typography sx={{ color: errors.images ? '#ff6b6b' : (darkMode ? 'grey.400' : 'grey.600') }}>
        Húzd ide a képeket vagy kattints a feltöltéshez (minimum 2 kép)
      </Typography>
    </Box>
  )}
</Box>


      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormControl fullWidth error={errors.selectedCategory} sx={textFieldStyle}>
  <InputLabel>Kategória</InputLabel>
  <Select
    value={selectedCategory}
    onChange={(e) => {
      setSelectedCategory(e.target.value);
      setSize('');
    }}
    MenuProps={{
      PaperProps: {
        sx: {
          backgroundColor: darkMode ? 'rgba(51, 51, 51, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.6)',
          maxHeight: {
            xs: '200px',
            sm: '250px',
            md: '300px'
          },
          '& .MuiMenuItem-root': {
            fontSize: {
              xs: '0.85rem',
              sm: '0.9rem',
              md: '1rem'
            },
            padding: {
              xs: '6px 12px',
              sm: '8px 16px',
              md: '10px 20px'
            },
            color: darkMode ? '#fff' : '#333',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            '&.Mui-selected': {
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.1)',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.2)',
              }
            }
          }
        }
      }
    }}
  >
    {categories.map((category) => (
      <MenuItem key={category.cs_azonosito} value={category.cs_azonosito}>
        {category.cs_nev}
      </MenuItem>
    ))}
  </Select>
  {errors.selectedCategory && <FormHelperText>Válassza ki a termék kategoriáját!</FormHelperText>}
</FormControl>

<TextField
  fullWidth
  label="Ruha neve"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  error={errors.title}
  helperText={errors.title ? "Adja meg a ruha nevét!" : ""}
  sx={textFieldStyle}
/>

<TextField
  fullWidth
  label="Ár"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  error={errors.price}
  helperText={errors.price ? "Adja meg a ruha árát!" : ""}
  sx={textFieldStyle}
/>

<TextField
  fullWidth
  label="Leírás"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  error={errors.description}
  helperText={errors.description ? "Adja meg a ruha leírását!" : ""}
  sx={textFieldStyle}
/>
<FormControl fullWidth error={errors.size} sx={textFieldStyle}>
  <InputLabel>Méret</InputLabel>
  <Select
    value={size}
    onChange={(e) => setSize(e.target.value)}
    MenuProps={{
      PaperProps: {
        sx: {
          backgroundColor: darkMode ? 'rgba(51, 51, 51, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.6)',
          maxHeight: {
            xs: '200px',
            sm: '250px',
            md: '300px'
          },
          '& .MuiMenuItem-root': {
            fontSize: {
              xs: '0.85rem',
              sm: '0.9rem',
              md: '1rem'
            },
            padding: {
              xs: '6px 12px',
              sm: '8px 16px',
              md: '10px 20px'
            },
            color: darkMode ? '#fff' : '#333',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            '&.Mui-selected': {
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.1)',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.2)',
              }
            }
          }
        }
      }
    }}
  >
    {(selectedCategory === 3 || selectedCategory === '3') ?
      [
        <MenuItem key="35-38" value="35-38">35-38</MenuItem>,
        <MenuItem key="39-42" value="39-42">39-42</MenuItem>,
        <MenuItem key="43-46" value="43-46">43-46</MenuItem>
      ]
    :
    (selectedCategory === 7 || selectedCategory === '7') ?
      [
        <MenuItem key="35" value="35">35</MenuItem>,
        <MenuItem key="36" value="36">36</MenuItem>,
        <MenuItem key="37" value="37">37</MenuItem>,
        <MenuItem key="38" value="38">38</MenuItem>,
        <MenuItem key="39" value="39">39</MenuItem>,
        <MenuItem key="40" value="40">40</MenuItem>,
        <MenuItem key="41" value="41">41</MenuItem>,
        <MenuItem key="42" value="42">42</MenuItem>,
        <MenuItem key="43" value="43">43</MenuItem>,
        <MenuItem key="44" value="44">44</MenuItem>,
        <MenuItem key="45" value="45">45</MenuItem>,
        <MenuItem key="46" value="46">46</MenuItem>,
        <MenuItem key="47" value="47">47</MenuItem>,
        <MenuItem key="48" value="48">48</MenuItem>,
        <MenuItem key="49" value="49">49</MenuItem>
      ]
    :
      [
        <MenuItem key="XS" value="XS">XS</MenuItem>,
        <MenuItem key="S" value="S">S</MenuItem>,
        <MenuItem key="M" value="M">M</MenuItem>,
        <MenuItem key="L" value="L">L</MenuItem>,
        <MenuItem key="XL" value="XL">XL</MenuItem>,
        <MenuItem key="XXL" value="XXL">XXL</MenuItem>
      ]
    }
  </Select>
  {errors.size && <FormHelperText>Válassza ki a {selectedCategory === '3' ? 'zokni' : 'ruha'} méretét!</FormHelperText>}
</FormControl>

        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            py: 2,
            mt: 2,
            backgroundColor: darkMode ? '#90caf9' : '#1976d2',
            '&:hover': {
              backgroundColor: darkMode ? '#42a5f5' : '#1565c0',
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          Feltöltés
        </Button>
      </Box>
    </Card>
  </Box>
</Container>
{showLogoutAlert && (
  <Box
    sx={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1400,
      animation: 'popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      '@keyframes popIn': {
        '0%': {
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.5)',
        },
        '50%': {
          transform: 'translate(-50%, -50%) scale(1.05)',
        },
        '100%': {
          opacity: 1,
          transform: 'translate(-50%, -50%) scale(1)',
        },
      },
      width: { xs: 'calc(100% - 32px)', sm: 'auto' },
      maxWidth: '100%',
      px: { xs: 2, sm: 0 }
    }}
  >
    <Card
      sx={{
        minWidth: { xs: 'auto', sm: 350 },
        width: { xs: '100%', sm: 'auto' },
        backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: darkMode ? '#fff' : '#000',
        boxShadow: darkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        borderRadius: { xs: '16px', sm: '20px' },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: { xs: '3px', sm: '4px' },
          background: 'linear-gradient(90deg, #00C853, #B2FF59)',
          animation: 'loadingBar 2s ease-in-out',
          '@keyframes loadingBar': {
            '0%': { width: '0%' },
            '100%': { width: '100%' }
          }
        }}
      />
      <CardContent sx={{ 
        p: { xs: 2.5, sm: 4 },
        '@media (max-width: 320px)': {
          p: 2
        }
      }}>
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 2, sm: 3 },
          '@media (max-width: 320px)': {
            mb: 1.5
          }
        }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '1.1rem', sm: '1.5rem' },
              background: darkMode
                ? 'linear-gradient(45deg, #90caf9, #42a5f5)'
                : 'linear-gradient(45deg, #1976d2, #1565c0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '@media (max-width: 320px)': {
                fontSize: '1rem'
              }
            }}
          >
            Kijelentkezés
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: darkMode ? '#aaa' : '#666',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '@media (max-width: 320px)': {
                fontSize: '0.8rem'
              }
            }}
          >
            Biztosan ki szeretnél jelentkezni?
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, sm: 2 },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            '@media (min-width: 400px)': {
              flexDirection: 'row'
            }
          }}
        >
          <Button
            onClick={() => setShowLogoutAlert(false)}
            sx={{
              flex: 1,
              py: { xs: 1, sm: 1.5 },
              borderRadius: { xs: '8px', sm: '12px' },
              backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)',
              color: darkMode ? '#90caf9' : '#1976d2',
              transition: 'all 0.2s ease',
              fontSize: { xs: '0.9rem', sm: 'inherit' },
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                transform: { xs: 'none', sm: 'translateY(-2px)' },
              },
              '@media (max-width: 320px)': {
                py: 0.75,
                fontSize: '0.8rem'
              }
            }}
          >
            Mégse
          </Button>
          <Button
            onClick={confirmLogout}
            sx={{
              flex: 1,
              py: { xs: 1, sm: 1.5 },
              borderRadius: { xs: '8px', sm: '12px' },
              background: darkMode
                ? 'linear-gradient(45deg, #90caf9, #42a5f5)'
                : 'linear-gradient(45deg, #1976d2, #1565c0)',
              color: '#fff',
              transition: 'all 0.2s ease',
              fontSize: { xs: '0.9rem', sm: 'inherit' },
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                boxShadow: { xs: 'none', sm: '0 5px 15px rgba(0,0,0,0.3)' },
              },
              '@media (max-width: 320px)': {
                py: 0.75,
                fontSize: '0.8rem'
              }
            }}
          >
            Kijelentkezés
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
)}




{showUploadInfo && (
  <Box
  sx={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1400,
    width: {
      xs: '95%',
      sm: '85%',
      md: '70%'
    },
    maxWidth: {
      xs: 350,
      sm: 450,
      md: 600
    },
    animation: 'fadeIn 0.3s ease-out',
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translate(-50%, -55%)' },
      to: { opacity: 1, transform: 'translate(-50%, -50%)' }
    }
    }}>
    <Card sx={{
      backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.98)' : 'rgba(255, 255, 255, 0.98)',
      color: darkMode ? '#fff' : '#000',
      borderRadius: {
        xs: 3,
        sm: 4
      },
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden'
    }}>
      <Box sx={{
        height: {
          xs: '3px',
          sm: '4px'
        },
        background: 'linear-gradient(90deg, #2196F3, #64B5F6)',
      }} />
     
      <Box sx={{
        p: {
          xs: 2.5,
          sm: 3,
          md: 4
        }
      }}>
        <Typography variant="h4" sx={{
          mb: {
            xs: 2,
            sm: 2.5,
            md: 3
          },
          fontWeight: 'bold',
          textAlign: 'center',
          color: darkMode ? '#90CAF9' : '#1976D2',
          fontSize: {
            xs: '1.5rem',
            sm: '1.75rem',
            md: '2rem'
          }
        }}>
          Feltöltési követelmények
        </Typography>
    
        <Box sx={{
          mb: {
            xs: 2,
            sm: 2.5,
            md: 3
          }
        }}>
          <Typography variant="h6" sx={{
            mb: {
              xs: 1,
              sm: 1.5,
              md: 2
            },
            color: darkMode ? '#81D4FA' : '#0D47A1',
            fontSize: {
              xs: '1.1rem',
              sm: '1.2rem',
              md: '1.25rem'
            }
          }}>
            Képfeltöltés:
          </Typography>
          <Box sx={{
            pl: {
              xs: 1,
              sm: 1.5,
              md: 2
            },
            mb: 2
          }}>
            <Typography sx={{
              mb: 1,
              fontSize: {
                xs: '0.9rem',
                sm: '0.95rem',
                md: '1rem'
              }
            }}>• Ajánlott képméret: 1200x1200 pixel</Typography>
            <Typography sx={{
              mb: 1,
              fontSize: {
                xs: '0.9rem',
                sm: '0.95rem',
                md: '1rem'
              }
            }}>• Maximum fájlméret: 8MB</Typography>
            <Typography sx={{
              fontSize: {
                xs: '0.9rem',
                sm: '0.95rem',
                md: '1rem'
              }
            }}>• Elfogadott formátumok: JPG, PNG</Typography>
          </Box>
        </Box>
    
        <Box sx={{
          mb: {
            xs: 3,
            sm: 3.5,
            md: 4
          }
        }}>
          <Typography variant="h6" sx={{
            mb: {
              xs: 1,
              sm: 1.5,
              md: 2
            },
            color: darkMode ? '#81D4FA' : '#0D47A1',
            fontSize: {
              xs: '1.1rem',
              sm: '1.2rem',
              md: '1.25rem'
            }
          }}>
            Termékadatok:
          </Typography>
          <Box sx={{
            pl: {
              xs: 1,
              sm: 1.5,
              md: 2
            }
          }}>
            <Typography sx={{
              mb: 1,
              fontSize: {
                xs: '0.9rem',
                sm: '0.95rem',
                md: '1rem'
              }
            }}>• Pontos terméknév megadása</Typography>
            <Typography sx={{
              mb: 1,
              fontSize: {
                xs: '0.9rem',
                sm: '0.95rem',
                md: '1rem'
              }
            }}>• Valós ár feltüntetése</Typography>
            <Typography sx={{
              mb: 1,
              fontSize: {
                xs: '0.9rem',
                sm: '0.95rem',
                md: '1rem'
              }
            }}>• Részletes termékleírás</Typography>
            <Typography sx={{
              fontSize: {
                xs: '0.9rem',
                sm: '0.95rem',
                md: '1rem'
              }
            }}>• Megfelelő méret kiválasztása</Typography>
          </Box>
        </Box>
    
        <Button
          fullWidth
          variant="contained"
          onClick={() => setShowUploadInfo(false)}
          sx={{
            mt: {
              xs: 2,
              sm: 2.5,
              md: 3
            },
            py: {
              xs: 1.5,
              sm: 1.75,
              md: 2
            },
            backgroundColor: darkMode ? '#90CAF9' : '#1976D2',
            fontSize: {
              xs: '0.95rem',
              sm: '1rem',
              md: '1.1rem'
            }
    ,
          '&:hover': {
            backgroundColor: darkMode ? '#64B5F6' : '#1565C0',
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          },
          transition: 'all 0.2s ease'
        }}
      >
        Értettem
      </Button>
    </Box>
  </Card>
</Box>

)}

<InactivityAlert darkMode={darkMode} inactivityTimeout={120000} />
      

      <Footer />
    </div>
  );
}

export default Add;