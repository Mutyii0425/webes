import React, { useState } from 'react';
import {
  IconButton,
  Modal,
  Box,
  Typography,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Fade,
  Backdrop
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';

const ShareProduct = ({ product, darkMode, source }) => {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');


  const isOriginalProduct = product.hasOwnProperty('kategoriaId');
  

  const productUrl = window.location.origin + 
    (source === 'oterm' ? `/termek/${product.id}` : `/product/${product.id}`);
  
  

  const productTitle = product.nev || 'Adali Clothing termék';
  const productPrice = product.ar ? `${product.ar} Ft` : '';
  const shareText = `Nézd meg ezt a terméket: ${productTitle} - ${productPrice}`;

  const handleShareClick = (event) => {
 
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
    }
    
    setOpen(true);
  };

  const handleClose = (event) => {
   
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    setOpen(false);
  };

  const handleSnackbarClose = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    setSnackbarOpen(false);
  };

  const copyToClipboard = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
    }
    
    navigator.clipboard.writeText(productUrl)
      .then(() => {
        setSnackbarMessage('Link másolva a vágólapra!');
        setSnackbarOpen(true);
        handleClose();
      })
      .catch(err => {
        console.error('Nem sikerült másolni: ', err);
        setSnackbarMessage('Nem sikerült másolni a linket.');
        setSnackbarOpen(true);
      });
  };

  const shareToFacebook = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
    }
    
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
    handleClose();
  };

  const shareToTwitter = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
    }
    
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`, '_blank');
    handleClose();
  };

  const shareToWhatsApp = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
    }
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + productUrl)}`, '_blank');
    handleClose();
  };

  const shareByEmail = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
    }
    

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent('Nézd meg ezt a terméket az Adali Clothing oldalán!')}&body=${encodeURIComponent(shareText + '\n\n' + productUrl)}`;
    
    window.open(gmailUrl, '_blank');
    handleClose();
  };


  const shareOptions = [
    { 
      name: 'Facebook', 
      icon: <FacebookIcon />, 
      color: '#1877F2', 
      action: shareToFacebook,
      gradient: 'linear-gradient(45deg, #1877F2, #3b5998)'
    },
    { 
      name: 'Twitter', 
      icon: <TwitterIcon />, 
      color: '#1DA1F2', 
      action: shareToTwitter,
      gradient: 'linear-gradient(45deg, #1DA1F2, #14171A)'
    },
    { 
      name: 'WhatsApp', 
      icon: <WhatsAppIcon />, 
      color: '#25D366', 
      action: shareToWhatsApp,
      gradient: 'linear-gradient(45deg, #25D366, #128C7E)'
    },
    { 
      name: 'Gmail', 
      icon: <EmailIcon />, 
      color: darkMode ? '#f5f5f5' : '#555', 
      action: shareByEmail,
      gradient: darkMode 
        ? 'linear-gradient(45deg, #f5f5f5, #d7d7d7)' 
        : 'linear-gradient(45deg, #555, #333)'
    },
    { 
      name: 'Link másolása', 
      icon: <LinkIcon />, 
      color: darkMode ? '#f5f5f5' : '#555', 
      action: copyToClipboard,
      gradient: darkMode 
        ? 'linear-gradient(45deg, #f5f5f5, #d7d7d7)' 
        : 'linear-gradient(45deg, #555, #333)'
    }
  ];

  return (
    <Box 
      onClick={(e) => e.stopPropagation()} 
      onMouseDown={(e) => e.stopPropagation()}
      sx={{ zIndex: 1000 }}
    >
      <Tooltip title="Megosztás">
        <IconButton 
          onClick={handleShareClick}
          onMouseDown={(e) => e.stopPropagation()}
          sx={{
            color: darkMode ? '#fff' : '#333',
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
            zIndex: 1000
          }}
        >
          <ShareIcon />
        </IconButton>
      </Tooltip>


      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { 
            backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)'
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Fade in={open}>
          <Box
            sx={{
              backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: darkMode ? '#fff' : '#333',
              borderRadius: '16px',
              boxShadow: darkMode 
                ? '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                : '0 10px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              width: 320,
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              animation: 'scaleIn 0.3s ease-out',
              '@keyframes scaleIn': {
                from: { opacity: 0, transform: 'scale(0.9)' },
                to: { opacity: 1, transform: 'scale(1)' }
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
          
            <Box sx={{ 
              p: 2.5, 
              pb: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  background: darkMode 
                    ? 'linear-gradient(45deg, #90caf9, #42a5f5)' 
                    : 'linear-gradient(45deg, #1976d2, #1565c0)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Megosztás
              </Typography>
              
              <IconButton 
                size="small" 
                onClick={handleClose}
                sx={{
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                  '&:hover': {
                    color: darkMode ? '#fff' : '#000',
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Divider sx={{ 
              my: 1,
              opacity: 0.1
            }} />
            
       
            <Box sx={{ px: 2.5, py: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  fontSize: '0.85rem',
                  mb: 0.5
                }}
              >
                Megosztandó termék:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 500,
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {productTitle}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: darkMode ? '#90caf9' : '#1976d2',
                  fontWeight: 600
                }}
              >
                {productPrice}
              </Typography>
              
        
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  mt: 1,
                  color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                }}
              >
                Link típusa: {isOriginalProduct ? 'Eredeti termék' : 'Feltöltött termék'}
              </Typography>
            </Box>
            
            <Divider sx={{ 
              my: 1,
              opacity: 0.1
            }} />
            
          
            <Box sx={{ p: 2.5, pt: 1.5 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  fontSize: '0.85rem',
                  mb: 1.5
                }}
              >
                Válassz platformot:
              </Typography>
              
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1.5
              }}>
                {shareOptions.map((option, index) => (
                  <Box 
                    key={index}
                    onClick={option.action}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                      }
                    }}
                  >
                    <Box 
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: option.gradient,
                        color: option.name === 'Email' || option.name === 'Link másolása' 
                          ? (darkMode ? '#333' : '#fff')
                          : '#fff',
                        mb: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                        }
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        textAlign: 'center',
                        color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    }}
                  >
                    {option.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          
      
          <Box sx={{ 
            p: 2, 
            backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
            borderTop: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            mt: 1
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                fontSize: '0.7rem',
                display: 'block',
                textAlign: 'center'
              }}
            >
              Köszönjük, hogy megosztod termékeinket!
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Modal>

    <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={handleSnackbarClose}
      sx={{
        position: 'fixed',
        zIndex: 9999,
        top: '80%',
        transform: 'translateX(0)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Alert 
        onClose={handleSnackbarClose} 
        severity="success" 
        sx={{ 
          width: '100%',
          backgroundColor: darkMode ? '#2e7d32' : '#e8f5e9',
          color: darkMode ? '#fff' : '#2e7d32',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </Box>
);
};

export default ShareProduct;

