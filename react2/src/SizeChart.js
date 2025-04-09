import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`size-tabpanel-${index}`}
      aria-labelledby={`size-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SizeChart = ({ open, onClose, productType, darkMode }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  const clothingSizes = [
    { size: 'S', chest: '88-96', waist: '73-81', hips: '88-96', height: '165-170' },
    { size: 'M', chest: '96-104', waist: '81-89', hips: '96-104', height: '170-175' },
    { size: 'L', chest: '104-112', waist: '89-97', hips: '104-112', height: '175-180' },
    { size: 'XL', chest: '112-120', waist: '97-105', hips: '112-120', height: '180-185' },
    { size: 'XXL', chest: '120-128', waist: '105-113', hips: '120-128', height: '185-190' }
  ];

  const pantSizes = [
    { size: 'S', waist: '73-81', hips: '88-96', inseam: '78-80', thigh: '54-58' },
    { size: 'M', waist: '81-89', hips: '96-104', inseam: '80-82', thigh: '58-62' },
    { size: 'L', waist: '89-97', hips: '104-112', inseam: '82-84', thigh: '62-66' },
    { size: 'XL', waist: '97-105', hips: '112-120', inseam: '84-86', thigh: '66-70' },
    { size: 'XXL', waist: '105-113', hips: '120-128', inseam: '86-88', thigh: '70-74' }
  ];

  const sockSizes = [
    { size: '36-39', footLength: '23-25', calfCircumference: '32-36' },
    { size: '40-44', footLength: '25-28', calfCircumference: '36-40' },
    { size: '45-50', footLength: '28-31', calfCircumference: '40-44' }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: darkMode ? '#333' : '#fff',
          color: darkMode ? '#fff' : '#333',
          borderRadius: '12px',
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Mérettáblázat
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="size chart tabs"
            textColor={darkMode ? 'inherit' : 'primary'}
            indicatorColor={darkMode ? 'secondary' : 'primary'}
          >
            <Tab label="Felsőruházat" />
            <Tab label="Nadrágok" />
            <Tab label="Zoknik" />
            <Tab label="Méretvételi útmutató" />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
            Felsőruházat mérettáblázat (méretek cm-ben)
          </Typography>
          <TableContainer component={Paper} sx={{ 
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'inherit',
            color: darkMode ? '#fff' : 'inherit'
          }}>
            <Table aria-label="clothing size table">
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }}>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Méret</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Mellbőség</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Derékbőség</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Csípőbőség</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Testmagasság</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clothingSizes.map((row) => (
                  <TableRow
                    key={row.size}
                    sx={{ 
                      '&:nth-of-type(odd)': { 
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' 
                      },
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 500 }}>{row.size}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.chest}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.waist}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.hips}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.height}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
            Nadrág mérettáblázat (méretek cm-ben)
          </Typography>
          <TableContainer component={Paper} sx={{ 
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'inherit',
            color: darkMode ? '#fff' : 'inherit'
          }}>
            <Table aria-label="pants size table">
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }}>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Méret</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Derékbőség</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Csípőbőség</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Belső hossz</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Combkerület</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pantSizes.map((row) => (
                  <TableRow
                    key={row.size}
                    sx={{ 
                      '&:nth-of-type(odd)': { 
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' 
                      },
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 500 }}>{row.size}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.waist}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.hips}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.inseam}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.thigh}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
            Zokni mérettáblázat (méretek cm-ben)
          </Typography>
          <TableContainer component={Paper} sx={{ 
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'inherit',
            color: darkMode ? '#fff' : 'inherit'
          }}>
            <Table aria-label="sock size table">
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }}>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Méret</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Lábhossz</TableCell>
                  <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 'bold' }}>Vádlikerület</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sockSizes.map((row) => (
                  <TableRow
                    key={row.size}
                    sx={{ 
                      '&:nth-of-type(odd)': { 
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' 
                      },
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: 500 }}>{row.size}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.footLength}</TableCell>
                    <TableCell sx={{ color: darkMode ? '#fff' : 'inherit' }}>{row.calfCircumference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={value} index={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Hogyan mérj helyesen?
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Mellbőség
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Mérd körbe a mellkasod a legszélesebb részen, a hónaljak alatt, egyenesen tartva a mérőszalagot.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Derékbőség
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Mérd körbe a derekadat a legkeskenyebb részen, általában a köldök felett, természetesen állva.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Csípőbőség
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Mérd körbe a csípődet a legszélesebb részen, általában a fenék legdomborúbb pontján át.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Belső hossz (nadrágokhoz)
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Mérd le a távolságot a lábad belső oldalán a lágyéktól a bokáig.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Lábhossz (zoknikhoz)
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Mérd le a távolságot a sarkadtól a leghosszabb lábujjad végéig.
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: '8px',
            mt: 2
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: darkMode ? '#90caf9' : '#1976d2' }}>
              Tipp a tökéletes mérethez:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Ha két méret között vagy, válaszd a nagyobbat a kényelmesebb viselet érdekében. 
              Pulóvereknél és felsőruházatnál, ha lazább viseletet szeretnél, egy mérettel nagyobbat is választhatsz.
            </Typography>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default SizeChart;
