import React, { useState, useEffect } from 'react';
import { Box, Typography, Rating, Tooltip, CircularProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const UploaderRatingBadge = ({ username, darkMode, onClick }) => {
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      fetchUserId();
    }
  }, [username]);

  useEffect(() => {
    if (userId) {
      fetchRatings();
    }
  }, [userId]);

  const fetchUserId = async () => {
    try {
      console.log(`Felhasználó ID lekérése: ${username}`);
      const response = await fetch(`https://adaliclothing.onrender.com/ratings/user-id/${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Nem található felhasználó: ${username}`);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Felhasználó ID: ${data.userId} (${username})`);
        setUserId(data.userId);
      } else {
        console.log(`Hiba a felhasználó azonosító lekérésekor: ${data.error}`);
        setError(data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Hiba a felhasználó azonosító lekérésekor:', error);
      setError('Hiba történt az adatok lekérésekor');
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      console.log(`Értékelések lekérése: ${userId}`);
      // Módosítsd az URL-t, hogy az új végpontot használja
      const response = await fetch(`https://adaliclothing.onrender.com/ratings/user-ratings/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Értékelések száma: ${data.count}, átlag: ${data.avgRating}`);
        setAvgRating(data.avgRating);
        setRatingCount(data.count);
      } else {
        console.log(`Hiba az értékelések lekérésekor: ${data.error}`);
        setError(data.error);
      }
    } catch (error) {
      console.error('Hiba az értékelések lekérésekor:', error);
      setError('Hiba történt az adatok lekérésekor');
    } finally {
      setLoading(false);
    }
  };
  
  if (!username) return null;

  return (
    <Tooltip 
      title={
        loading 
          ? "Értékelések betöltése..." 
          : error
            ? `Hiba: ${error}`
            : `${avgRating.toFixed(1)} csillag ${ratingCount} értékelés alapján. Kattints a részletekért!`
      }
    >
      <Box 
        onClick={onClick}
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer',
          backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          borderRadius: '16px',
          padding: '4px 8px',
          '&:hover': {
            backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
          }
        }}
      >
        {loading ? (
          <CircularProgress size={16} sx={{ mr: 1, color: darkMode ? '#90caf9' : '#1976d2' }} />
        ) : (
          <StarIcon sx={{ fontSize: '16px', mr: 0.5, color: darkMode ? '#90caf9' : '#1976d2' }} />
        )}
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
          }}
        >
          {loading ? "..." : error ? "?" : avgRating.toFixed(1)}
        </Typography>
        
        <Typography 
          variant="caption" 
          sx={{ 
            ml: 0.5,
            color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          }}
        >
          ({loading ? "..." : error ? "0" : ratingCount})
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default UploaderRatingBadge;
