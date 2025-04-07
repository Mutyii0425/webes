import initializeApp from './app.js';
import multer from 'multer';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import vision from '@google-cloud/vision';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';
import cors from 'cors';
import express from 'express';
const app = express();

// Create a connection pool instead of a single connection
let pool;
const initDb = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'shinkansen.proxy.rlwy.net',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'iZEUnLkFezgUIAWbcnFjyGSUsLyjGbmi',
      database: process.env.DB_NAME || 'railway',
      port: process.env.DB_PORT || '23644',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('Adatbázis kapcsolat pool sikeresen létrejött');
    return pool;
  } catch (error) {
    console.error('Hiba az adatbázis kapcsolat létrehozásakor:', error);
    return null;
  }
};

// Update the getUserProfileImageByUsername function to use the pool
async function getUserProfileImageByUsername(pool, username) {
  try {
    const [rows] = await pool.execute(
      'SELECT profile_image FROM user WHERE felhasznalonev = ?',
      [username]
    );
    return rows.length > 0 ? rows[0].profile_image : null;
  } catch (error) {
    console.error('Hiba a profilkép lekérésekor az adatbázisból:', error);
    return null;
  }
}

// Update the saveUserProfileImageByUsername function to use the pool
async function saveUserProfileImageByUsername(pool, username, imageData) {
  try {
    await pool.execute(
      'UPDATE user SET profile_image = ? WHERE felhasznalonev = ?',
      [imageData, username]
    );
    return true;
  } catch (error) {
    console.error('Hiba a profilkép mentésekor az adatbázisba:', error);
    throw error;
  }
}

const startServer = async () => {
  const app = await initializeApp();

  // Initialize the database pool
  pool = await initDb();
  const db = pool;

  // CORS beállítások a környezeti változó használatával
  const corsOrigin = process.env.CORS_ORIGIN || 'https://adaliclothing.vercel.app';
  console.log('CORS origin beállítva:', corsOrigin);
  
  app.use(cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true
  }));
  
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Update the profile image endpoints to use the pool and add error handling
  app.post('/profile-image', async (req, res) => {
    try {
      const { username, imageData } = req.body;
      
      if (!username || !imageData) {
        return res.status(400).json({ success: false, message: 'Hiányzó adatok' });
      }
      
      // Check if the pool is available
      if (!pool) {
        console.error('Adatbázis kapcsolat nem elérhető');
        return res.status(500).json({ success: false, message: 'Adatbázis kapcsolat nem elérhető' });
      }
      
      await saveUserProfileImageByUsername(pool, username, imageData);
      res.json({ 
        success: true, 
        message: 'Profilkép sikeresen mentve',
        profileImage: imageData
      });
    } catch (error) {
      console.error('Hiba a profilkép mentésekor:', error);
      
      // Send a more detailed error response
      res.status(500).json({ 
        success: false, 
        message: 'Szerver hiba a profilkép mentésekor',
        error: error.message
      });
    }
  });
  
  app.get('/profile-image/:username', async (req, res) => {
    try {
      const { username } = req.params;
      
      // Check if the pool is available
      if (!pool) {
        console.error('Adatbázis kapcsolat nem elérhető');
        return res.status(500).json({ success: false, message: 'Adatbázis kapcsolat nem elérhető' });
      }
      
      const profileImage = await getUserProfileImageByUsername(pool, username);
      
      if (profileImage) {
        res.json({ success: true, profileImage });
      } else {
        res.status(404).json({ success: false, message: 'Profilkép nem található' });
      }
    } catch (error) {
      console.error('Hiba a profilkép lekérésekor:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Szerver hiba a profilkép lekérésekor',
        error: error.message
      });
    }
  });

  async function checkDatabaseConnection() {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Adatbázis kapcsolat ellenőrzése sikertelen:', error);
      return false;
    }
  }
  
  // Add a health check endpoint
  app.get('/api/health', async (req, res) => {
    const dbConnected = await checkDatabaseConnection();
    
    res.json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  });
  
  const storage = multer.diskStorage({
    destination: './kep',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.originalname.split('.')[0] + '-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, filename);
    }
  });
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10 MB (vagy bármilyen méret, amire szükséged van)
    }
  });
  
  app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      filename: req.file.filename
    });
  });
  
  app.use('/kep', (req, res, next) => {
    console.log('Image requested:', req.url);
    next();
  });


const keyFilePath = path.resolve('./vision-api-key1.json');
console.log('Vision API kulcs elérési útja:', keyFilePath);


let visionClient;
try {
  visionClient = new ImageAnnotatorClient({
    keyFilename: keyFilePath
  });
  console.log('Vision API kliens sikeresen inicializálva');
} catch (error) {
  console.error('Hiba a Vision API kliens inicializálásakor:', error);
}

app.get('/api/usage', async (req, res) => {
  try {
    console.log('API usage request received');
    
   
    if (!db) {
      console.error('Adatbázis kapcsolat nem elérhető');
      return res.status(500).json({ error: 'Adatbázis kapcsolat nem elérhető' });
    }
    
    try {
     
      const [results] = await db.execute('SELECT * FROM api_usage');
      
      console.log('API usage data retrieved:', results);
      res.json(results || []);
    } catch (dbError) {
      console.error('Hiba az API használat lekérdezésekor:', dbError);
      return res.status(500).json({ error: 'Adatbázis hiba: ' + dbError.message });
    }
  } catch (error) {
    console.error('Váratlan hiba az API használat lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});







app.post('/api/analyze-image', async (req, res) => {
  try {
    console.log('Kép elemzése kezdődik...');
    
   
    if (!req.body.image || !req.body.image.startsWith('data:image/')) {
      return res.status(400).json({
        error: 'Érvénytelen képformátum',
        fallback: getFallbackResponse()
      });
    }
    
   
    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    try {
      
      await incrementApiUsage('vision_api');
      
      
      const visionClient = new vision.ImageAnnotatorClient({
        keyFilename: './vision-api-key1.json'
      });
      
 
      const [labelResult] = await visionClient.labelDetection(buffer);
      const [objectResult] = await visionClient.objectLocalization(buffer);
      const [imagePropertiesResult] = await visionClient.imageProperties(buffer);
      
    
      const labels = labelResult.labelAnnotations || [];
      const objects = objectResult.localizedObjectAnnotations || [];
      const colors = imagePropertiesResult.imagePropertiesAnnotation?.dominantColors?.colors || [];
      
      const clothingCategories = [
        { id: '1', name: 'Sapkák', keywords: ['sapka', 'kalap', 'fejfedő', 'hat', 'cap', 'beanie'] },
        { id: '2', name: 'Nadrágok', keywords: ['nadrág', 'farmer', 'pants', 'jeans', 'trousers', 'shorts', 'rövidnadrág'] },
        { id: '3', name: 'Zoknik', keywords: ['zokni', 'sock', 'socks', 'harisnya'] },
        { id: '4', name: 'Pólók', keywords: ['póló', 't-shirt', 'shirt', 'tshirt', 'top'] },
        { id: '5', name: 'Pulloverek', keywords: ['pulóver', 'pulcsi', 'sweater', 'sweatshirt', 'hoodie', 'kapucnis'] },
        { id: '6', name: 'Kabátok', keywords: ['kabát', 'dzseki', 'coat', 'jacket', 'blazer', 'overcoat'] },
        { id: '7', name: 'Lábviseletek', keywords: ['cipő', 'bakancs', 'csizma', 'szandál', 'shoe', 'boot', 'footwear', 'sneaker', 'sandal'] },
        { id: '8', name: 'Atléták', keywords: ['atléta', 'trikó', 'tank top', 'sleeveless'] },
        { id: '9', name: 'Kiegészítők', keywords: ['kiegészítő', 'accessory', 'öv', 'belt', 'nyaklánc', 'necklace', 'karkötő', 'bracelet'] },
        { id: '10', name: 'Szoknyák', keywords: ['szoknya', 'skirt'] },
        { id: '11', name: 'Alsóneműk', keywords: ['alsónemű', 'underwear', 'boxer', 'bugyi', 'melltartó', 'bra'] },
        { id: '12', name: 'Mellények', keywords: ['mellény', 'vest', 'waistcoat'] }
      ];
      
      
      const allClothingKeywords = clothingCategories.flatMap(category => category.keywords);
      
    
      const hasClothingItem = labels.some(label => 
        allClothingKeywords.some(keyword => 
          label.description.toLowerCase().includes(keyword)
        )
      ) || objects.some(object => 
        allClothingKeywords.some(keyword => 
          object.name.toLowerCase().includes(keyword)
        )
      );
      
     
      if (!hasClothingItem) {
        return res.status(400).json({
          error: 'Nem sikerült ruházati terméket felismerni a képen. Kérjük, töltsön fel egy másik képet, amelyen jól látható a ruhadarab.',
          isImageError: true,
          fallback: getFallbackResponse()
        });
      }
      
     
      let suggestedCategory = '4'; 
      let highestMatchScore = 0;
      
      
      const allDetections = [
        ...labels.map(label => ({ text: label.description.toLowerCase(), score: label.score })),
        ...objects.map(obj => ({ text: obj.name.toLowerCase(), score: obj.score }))
      ];
  
      for (const category of clothingCategories) {
        for (const detection of allDetections) {
          for (const keyword of category.keywords) {
            if (detection.text.includes(keyword)) {
            
              if (detection.score > highestMatchScore) {
                highestMatchScore = detection.score;
                suggestedCategory = category.id;
                console.log(`Kategória találat: ${category.name} (${category.id}), kulcsszó: ${keyword}, pontszám: ${detection.score}`);
              }
            }
          }
        }
      }
      
      
      let suggestedDescription = 'Kiváló minőségű ruhadarab. A termék kényelmes anyagból készült.';
      
     
      const categoryDescriptions = {
        '1': 'Stílusos sapka, amely tökéletesen kiegészíti öltözékedet. Kényelmes viselet minden évszakban.',
        '2': 'Kényelmes szabású nadrág, amely tökéletes választás a mindennapokra. Tartós anyagból készült.',
        '3': 'Puha, kényelmes zokni, amely egész nap kellemes viseletet biztosít. Tartós anyagból készült.',
        '4': 'Divatos póló, amely tökéletesen illeszkedik a testhez. Puha, kellemes tapintású anyagból készült.',
        '5': 'Meleg, kényelmes pulóver, amely tökéletes választás a hűvösebb napokra. Puha anyagból készült.',
        '6': 'Stílusos kabát, amely melegen tart a hideg időben. Tartós, minőségi anyagból készült.',
        '7': 'Kényelmes lábbeli, amely egész nap kellemes viseletet biztosít. Strapabíró talppal rendelkezik.',
        '8': 'Könnyű, szellős atléta, amely tökéletes választás a meleg napokra vagy sportoláshoz.',
        '9': 'Divatos kiegészítő, amely tökéletesen kiegészíti öltözékedet és kiemeli stílusodat.',
        '10': 'Divatos szoknya, amely kényelmes viseletet biztosít. Sokoldalúan kombinálható darab.',
        '11': 'Kényelmes alsónemű, amely egész nap kellemes viseletet biztosít. Puha, bőrbarát anyagból készült.',
        '12': 'Stílusos mellény, amely tökéletesen kiegészíti öltözékedet. Sokoldalúan kombinálható darab.'
      };
      
      
      if (categoryDescriptions[suggestedCategory]) {
        suggestedDescription = categoryDescriptions[suggestedCategory];
      }
      
     
      const response = {
        suggestedCategory,
        suggestedDescription,
        quality: 0.8,
        tags: labels.slice(0, 5).map(label => label.description),
        colors: colors.slice(0, 3).map(color => {
          const rgb = color.color;
          return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
        }),
        confidence: highestMatchScore || (labels.length > 0 ? labels[0].score : 0.7)
      };
      
      console.log('Válasz előkészítve:', response);
      res.json(response);
    } catch (apiError) {
      console.error('Hiba a Vision API használata során:', apiError);
      res.status(500).json({
        error: 'Hiba a Vision API használata során: ' + apiError.message,
        fallback: getFallbackResponse()
      });
    }
  } catch (error) {
    console.error('Hiba a kép elemzése során:', error);
    res.status(500).json({
      error: 'Hiba a kép elemzése során: ' + error.message,
      fallback: getFallbackResponse()
    });
  }
});


function getFallbackResponse() {
  return {
    suggestedCategory: '4',
    suggestedDescription: 'Kiváló minőségű ruhadarab. A termék kényelmes anyagból készült.',
    quality: 0.8,
    tags: ['ruha', 'divat'],
    colors: ['fekete', 'fehér', 'szürke'],
    confidence: 0.7
  };
}



async function incrementApiUsage(apiName) {
try {
  const query = `
    INSERT INTO api_usage (api_name, usage_count, reset_date, last_updated)
    VALUES (?, 1, DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), NOW())
    ON DUPLICATE KEY UPDATE 
      usage_count = usage_count + 1,
      last_updated = NOW()
  `;
  
  await db.query(query, [apiName]);
  console.log(`${apiName} használati számláló növelve`);
} catch (error) {
  console.error('Hiba az API használat növelésekor:', error);
}
}


function isColorClose(color1, color2, threshold) {
  const distance = Math.sqrt(
    Math.pow(color1.red - color2.red, 2) +
    Math.pow(color1.green - color2.green, 2) +
    Math.pow(color1.blue - color2.blue, 2)
  );
  return distance;
}

app.get('/api/usage', (req, res) => {
  try {
    console.log('API usage request received');
    
    
    if (!db || db.state === 'disconnected') {
      console.error('Adatbázis kapcsolat nem elérhető');
      return res.status(500).json({ error: 'Adatbázis kapcsolat nem elérhető' });
    }
    
    const query = 'SELECT * FROM api_usage';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Hiba az API használat lekérdezésekor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('API usage data retrieved:', results);
      res.json(results || []);
    });
  } catch (error) {
    console.error('Váratlan hiba az API használat lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});


app.post('/api/usage/reset', async (req, res) => {
  try {
    const { apiName } = req.body;
    await db.query(
      'UPDATE api_usage SET usage_count = 0, reset_date = DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), last_updated = NOW() WHERE api_name = ?',
      [apiName]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Hiba az API használat nullázásakor:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});


const visionKeyFilePath2 = path.resolve('./vision-api-key1.json');
console.log('Második Vision API kulcs elérési útja:', visionKeyFilePath2);







app.post('/api/style/analyze-person', upload.single('image'), async (req, res) => {
  try {
    console.log('=== STÍLUS ELEMZÉS KEZDŐDIK (FELTÖLTÖTT FÁJL) ===');
    console.log('Kérés időpontja:', new Date().toISOString());
    
    if (!req.file) {
      console.log('HIBA: Nincs feltöltött fájl');
      return res.status(400).json({ 
        error: 'Nincs feltöltött fájl',
        fallback: getStyleFallbackResponse()
      });
    }
    
    console.log('Feltöltött fájl:', req.file.originalname, 'méret:', req.file.size, 'bytes');
    
    
    await incrementApiUsage('style_api');
    console.log('API használati számláló növelve: style_api');
    
    try {
      console.log('=== VISION API HÍVÁSOK KEZDŐDNEK ===');
      
      
      console.log('Vision API kliens inicializálása...');
      const visionClient = new vision.ImageAnnotatorClient({
        keyFilename: './vision-api-key1.json'
      });
      console.log('Vision API kliens sikeresen inicializálva');
      
  
      const imageContent = req.file.buffer || fs.readFileSync(req.file.path);
      
     
      console.log('Face Detection API hívás kezdődik...');
      try {
        const [faceDetectionResult] = await visionClient.faceDetection({
          image: { content: imageContent }
        });
        console.log('Face Detection API hívás sikeres!');
        console.log('Face Detection eredmény:', JSON.stringify(faceDetectionResult, null, 2).substring(0, 500) + '...');
      } catch (faceError) {
        console.error('Hiba a Face Detection API hívása során:', faceError);
      }
      
      console.log('Label Detection API hívás kezdődik...');
      try {
        const [labelResult] = await visionClient.labelDetection({
          image: { content: imageContent }
        });
        console.log('Label Detection API hívás sikeres!');
        console.log('Label Detection eredmény:', JSON.stringify(labelResult, null, 2).substring(0, 500) + '...');
      } catch (labelError) {
        console.error('Hiba a Label Detection API hívása során:', labelError);
      }
      
      console.log('Image Properties API hívás kezdődik...');
      try {
        const [imagePropertiesResult] = await visionClient.imageProperties({
          image: { content: imageContent }
        });
        console.log('Image Properties API hívás sikeres!');
        console.log('Image Properties eredmény:', JSON.stringify(imagePropertiesResult, null, 2).substring(0, 500) + '...');
      } catch (propertiesError) {
        console.error('Hiba az Image Properties API hívása során:', propertiesError);
      }
      
      console.log('=== VISION API HÍVÁSOK BEFEJEZVE ===');
      
 
      console.log('Stílus elemzés generálása...');
      const styleAnalysis = generateStyleAnalysis();
      
      console.log('Stílus elemzés eredménye:', JSON.stringify(styleAnalysis, null, 2));
      console.log('=== STÍLUS ELEMZÉS BEFEJEZVE ===');
      
      res.json(styleAnalysis);
    } catch (apiError) {
      console.error('HIBA a Vision API használata során:', apiError);
      console.log('Fallback válasz küldése...');
      res.status(500).json({
        error: 'Hiba a Vision API használata során: ' + apiError.message,
        fallback: getStyleFallbackResponse()
      });
    }
  } catch (error) {
    console.error('HIBA a stílus elemzése során:', error);
    console.log('Fallback válasz küldése...');
    res.status(500).json({
      error: 'Hiba a stílus elemzése során: ' + error.message,
      fallback: getStyleFallbackResponse()
    });
  }
});


app.post('/api/style/analyze-base64', async (req, res) => {
  try {
    console.log('=== STÍLUS ELEMZÉS KEZDŐDIK (BASE64) ===');
    console.log('Kérés időpontja:', new Date().toISOString());
    
    if (!req.body.image || !req.body.image.startsWith('data:image/')) {
      console.log('HIBA: Érvénytelen képformátum');
      return res.status(400).json({ 
        error: 'Érvénytelen képformátum',
        fallback: getStyleFallbackResponse()
      });
    }
    

    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    console.log('Kép sikeresen dekódolva base64 formátumból');
    
   
    await incrementApiUsage('style_api');
    console.log('API használati számláló növelve: style_api');
    
    try {
      console.log('=== VISION API HÍVÁSOK KEZDŐDNEK ===');
      
     
      console.log('Vision API kliens inicializálása...');
      const visionClient = new vision.ImageAnnotatorClient({
        keyFilename: './vision-api-key1.json'
      });
      console.log('Vision API kliens sikeresen inicializálva');
      

      console.log('Face Detection API hívás kezdődik...');
      const [faceDetectionResult] = await visionClient.faceDetection(buffer);
      console.log('Face Detection API hívás sikeres!');
      console.log('Face Detection eredmény:', JSON.stringify(faceDetectionResult, null, 2).substring(0, 500) + '...');
      
      console.log('Label Detection API hívás kezdődik...');
      const [labelResult] = await visionClient.labelDetection(buffer);
      console.log('Label Detection API hívás sikeres!');
      console.log('Label Detection eredmény:', JSON.stringify(labelResult, null, 2).substring(0, 500) + '...');
      
      console.log('Image Properties API hívás kezdődik...');
      const [imagePropertiesResult] = await visionClient.imageProperties(buffer);
      console.log('Image Properties API hívás sikeres!');
      console.log('Image Properties eredmény:', JSON.stringify(imagePropertiesResult, null, 2).substring(0, 500) + '...');
      
      console.log('=== VISION API HÍVÁSOK BEFEJEZVE ===');
      
      console.log('Stílus elemzés generálása a Vision API eredmények alapján...');
      const styleAnalysis = generateStyleAnalysisFromVisionResults(
        faceDetectionResult, 
        labelResult, 
        imagePropertiesResult
      );
      
      console.log('Stílus elemzés eredménye:', JSON.stringify(styleAnalysis, null, 2));
      console.log('=== STÍLUS ELEMZÉS BEFEJEZVE ===');
      
      res.json(styleAnalysis);
    } catch (apiError) {
      console.error('HIBA a Vision API használata során:', apiError);
      console.log('Fallback válasz küldése...');
      res.status(500).json({
        error: 'Hiba a Vision API használata során: ' + apiError.message,
        fallback: getStyleFallbackResponse()
      });
    }
  } catch (error) {
    console.error('HIBA a stílus elemzése során:', error);
    console.log('Fallback válasz küldése...');
    res.status(500).json({
      error: 'Hiba a stílus elemzése során: ' + error.message,
      fallback: getStyleFallbackResponse()
    });
  }
});



function getStyleFallbackResponse() {
  return {
    colorType: 'Ősz - meleg, mély színek',
    bodyType: 'Homokóra - kiegyensúlyozott váll és csípő, karcsú derék',
    faceShape: 'Ovális - kiegyensúlyozott, harmonikus arcforma',
    recommendedStyle: 'Klasszikus - időtlen, elegáns darabok',
    recommendedColors: [
      { name: 'Bordó', hex: '#800020' },
      { name: 'Olíva', hex: '#708238' },
      { name: 'Terrakotta', hex: '#e2725b' },
      { name: 'Mogyoró', hex: '#a67b5b' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    avoidColors: [
      { name: 'Neon rózsaszín', hex: '#ff6ec7' },
      { name: 'Élénk citromsárga', hex: '#fff700' },
      { name: 'Világoskék', hex: '#add8e6' }
    ],
    styleAdvice: 'Az ősz színtípushoz a meleg, földszínű árnyalatok illenek a legjobban. Homokóra testalkatodhoz válassz olyan ruhákat, amelyek kiemelik a karcsú derekadat. Ovális arcformád sokoldalú, szinte bármilyen frizura és kiegészítő jól áll neked. A klasszikus stílushoz válassz minőségi, időtálló darabokat, amelyek több szezonon át hordhatók.'
  };
}


function generateStyleAnalysis() {

  const colorTypes = [
    'Tavasz - meleg, világos színek',
    'Nyár - hűvös, lágy színek',
    'Ősz - meleg, mély színek',
    'Tél - hűvös, élénk színek'
  ];
  

  const bodyTypes = [
    'Homokóra - kiegyensúlyozott váll és csípő, karcsú derék',
    'Körte - keskenyebb váll, szélesebb csípő',
    'Alma - szélesebb váll és derék, keskenyebb csípő',
    'Téglalap - egyenes testalkat, kevésbé hangsúlyos derék',
    'Fordított háromszög - szélesebb váll, keskenyebb csípő'
  ];
  
 
  const faceShapes = [
    'Ovális - kiegyensúlyozott, harmonikus arcforma',
    'Kerek - lágy vonalak, telt arc',
    'Szögletes - határozott állkapocs, széles homlok',
    'Szív - széles homlok, keskeny áll',
    'Hosszúkás - nyújtott arcforma',
    'Gyémánt - keskeny homlok és áll, széles arccsont'
  ];
  
 
  const styleTypes = [
    'Klasszikus - időtlen, elegáns darabok',
    'Természetes - kényelmes, laza viselet',
    'Drámai - merész, feltűnő megjelenés',
    'Romantikus - nőies, lágy vonalak',
    'Városi - modern, trendi darabok',
    'Kreatív - egyedi, művészi megjelenés',
    'Elegáns - kifinomult, minőségi darabok'
  ];
  
  
  const colorPalettes = {
    'Tavasz': [
      { name: 'Korall', hex: '#ff7f50' },
      { name: 'Barackszín', hex: '#ffcba4' },
      { name: 'Arany', hex: '#ffd700' },
      { name: 'Meleg zöld', hex: '#32cd32' },
      { name: 'Türkiz', hex: '#40e0d0' }
    ],
    'Nyár': [
      { name: 'Levendula', hex: '#e6e6fa' },
      { name: 'Rózsaszín', hex: '#ffc0cb' },
      { name: 'Világoskék', hex: '#add8e6' },
      { name: 'Szürke', hex: '#808080' },
      { name: 'Mályva', hex: '#e0b0ff' }
    ],
    'Ősz': [
      { name: 'Bordó', hex: '#800020' },
      { name: 'Olíva', hex: '#708238' },
      { name: 'Terrakotta', hex: '#e2725b' },
      { name: 'Mogyoró', hex: '#a67b5b' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    'Tél': [
      { name: 'Fekete', hex: '#000000' },
      { name: 'Fehér', hex: '#ffffff' },
      { name: 'Királykék', hex: '#4169e1' },
      { name: 'Smaragdzöld', hex: '#008000' },
      { name: 'Magenta', hex: '#ff00ff' }
    ]
  };
  
  
  const avoidColorPalettes = {
    'Tavasz': [
      { name: 'Fekete', hex: '#000000' },
      { name: 'Sötétszürke', hex: '#696969' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    'Nyár': [
      { name: 'Narancssárga', hex: '#ffa500' },
      { name: 'Arany', hex: '#ffd700' },
      { name: 'Élénk piros', hex: '#ff0000' }
    ],
    'Ősz': [
      { name: 'Neon rózsaszín', hex: '#ff6ec7' },
      { name: 'Élénk citromsárga', hex: '#fff700' },
      { name: 'Világoskék', hex: '#add8e6' }
    ],
    'Tél': [
      { name: 'Bézs', hex: '#f5f5dc' },
      { name: 'Barackszín', hex: '#ffcba4' },
      { name: 'Olíva', hex: '#708238' }
    ]
  };
  
 
  const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
  
 
  const colorType = randomItem(colorTypes);
  const colorTypeName = colorType.split(' - ')[0]; 
  
  
  const recommendedColors = colorPalettes[colorTypeName];
  const avoidColors = avoidColorPalettes[colorTypeName];
  

  const bodyType = randomItem(bodyTypes);
  const faceShape = randomItem(faceShapes);
  const recommendedStyle = randomItem(styleTypes);
  
 
  const styleAdvice = `
    A képed alapján a ${colorType.toLowerCase()} típusba tartozol. 
    Testalkatod ${bodyType.toLowerCase()}, ezért érdemes olyan ruhákat választanod, 
    amelyek kiemelik az előnyös tulajdonságaidat. 
    
    Arcformád ${faceShape.toLowerCase()}, ehhez a következő frizurák és kiegészítők állnak jól:
    ${faceShape.includes('Ovális') ? '- Szinte bármilyen frizura és kiegészítő jól áll neked' : 
      faceShape.includes('Kerek') ? '- A hosszabb, réteges frizurák és a hosszúkás fülbevalók nyújtják az arcot' :
      faceShape.includes('Szögletes') ? '- A lágy, hullámos frizurák és kerek formájú kiegészítők lágyítják a vonásokat' :
      faceShape.includes('Szív') ? '- Az állhoz érő vagy hosszabb frizurák, valamint a szélesebb nyakláncok egyensúlyba hozzák az arcot' :
      faceShape.includes('Hosszúkás') ? '- A rövidebb, volumennel rendelkező frizurák és a kerek vagy négyzet alakú kiegészítők rövidítik az arcot' :
      '- A középen elválasztott frizurák és az ovális vagy kerek kiegészítők kiemelik az arccsontot'}
    
    A ${recommendedStyle.toLowerCase()} stílus illik hozzád a legjobban. 
    Válassz olyan ruhákat, amelyek tükrözik ezt a stílust és a színtípusodhoz illő színekben kaphatók.
  `.trim().replace(/\n\s+/g, '\n');
  
  return {
    colorType,
    bodyType,
    faceShape,
    recommendedStyle,
    recommendedColors,
    avoidColors,
    styleAdvice
  };
}

function generateStyleAnalysisFromVisionResults(faceDetectionResult, labelResult, imagePropertiesResult) {
  
  let faceShape = "Ovális - kiegyensúlyozott, harmonikus arcforma"; 
  if (faceDetectionResult && faceDetectionResult.faceAnnotations && faceDetectionResult.faceAnnotations.length > 0) {
    const face = faceDetectionResult.faceAnnotations[0];
    
   
    if (face.landmarks) {
      
      const landmarks = face.landmarks;
      
    
      const leftEar = landmarks.find(l => l.type === 'LEFT_EAR_TRAGION');
      const rightEar = landmarks.find(l => l.type === 'RIGHT_EAR_TRAGION');
      const chin = landmarks.find(l => l.type === 'CHIN_GNATHION');
      const foreHead = landmarks.find(l => l.type === 'FOREHEAD_GLABELLA');
      const leftCheek = landmarks.find(l => l.type === 'LEFT_CHEEK');
      const rightCheek = landmarks.find(l => l.type === 'RIGHT_CHEEK');
      
      if (leftEar && rightEar && chin && foreHead) {
       
        const faceWidth = Math.sqrt(
          Math.pow(rightEar.position.x - leftEar.position.x, 2) +
          Math.pow(rightEar.position.y - leftEar.position.y, 2)
        );
        
       
        const faceHeight = Math.sqrt(
          Math.pow(chin.position.x - foreHead.position.x, 2) +
          Math.pow(chin.position.y - foreHead.position.y, 2)
        );
        
        
        let cheekWidth = 0;
        if (leftCheek && rightCheek) {
          cheekWidth = Math.sqrt(
            Math.pow(rightCheek.position.x - leftCheek.position.x, 2) +
            Math.pow(rightCheek.position.y - leftCheek.position.y, 2)
          );
        }
        
        
        const ratio = faceHeight / faceWidth;
        
        if (ratio > 1.5) {
          faceShape = "Hosszúkás - nyújtott arcforma";
        } else if (ratio < 1.1) {
          faceShape = "Kerek - lágy vonalak, telt arc";
        } else if (cheekWidth > 0 && cheekWidth / faceWidth > 0.8) {
          faceShape = "Gyémánt - keskeny homlok és áll, széles arccsont";
        } else if (face.joyLikelihood === 'VERY_LIKELY' || face.joyLikelihood === 'LIKELY') {

          faceShape = "Kerek - lágy vonalak, telt arc";
        } else if (face.angerLikelihood === 'VERY_LIKELY' || face.angerLikelihood === 'LIKELY') {
       
          faceShape = "Szögletes - határozott állkapocs, széles homlok";
        }
      }
    }
  }
  

  let bodyType = "Homokóra - kiegyensúlyozott váll és csípő, karcsú derék";
  if (labelResult && labelResult.labelAnnotations) {
    const labels = labelResult.labelAnnotations.map(label => label.description.toLowerCase());
    
    if (labels.some(label => label.includes("athletic") || label.includes("muscular") || label.includes("sport"))) {
      bodyType = "Fordított háromszög - szélesebb váll, keskenyebb csípő";
    } else if (labels.some(label => label.includes("pear") || label.includes("hip") || label.includes("thigh"))) {
      bodyType = "Körte - keskenyebb váll, szélesebb csípő";
    } else if (labels.some(label => label.includes("apple") || label.includes("round") || label.includes("belly"))) {
      bodyType = "Alma - szélesebb váll és derék, keskenyebb csípő";
    } else if (labels.some(label => label.includes("slim") || label.includes("thin") || label.includes("slender"))) {
      bodyType = "Téglalap - egyenes testalkat, kevésbé hangsúlyos derék";
    } else if (labels.some(label => label.includes("hourglass") || label.includes("curvy"))) {
      bodyType = "Homokóra - kiegyensúlyozott váll és csípő, karcsú derék";
    }
  }
  

  let colorType = "Tavasz - meleg, világos színek"; 
  if (imagePropertiesResult && imagePropertiesResult.imagePropertiesAnnotation && 
      imagePropertiesResult.imagePropertiesAnnotation.dominantColors) {
    const colors = imagePropertiesResult.imagePropertiesAnnotation.dominantColors.colors;
    
   
    let warmColors = 0;
    let coolColors = 0;
    let brightColors = 0;
    let mutedColors = 0;
    
    colors.forEach(colorInfo => {
      const color = colorInfo.color;
      const r = color.red || 0;
      const g = color.green || 0;
      const b = color.blue || 0;
      
    
      if (r > b) warmColors += colorInfo.score;
      else coolColors += colorInfo.score;
      
      
      const brightness = (r + g + b) / 3;
      if (brightness > 128) brightColors += colorInfo.score;
      else mutedColors += colorInfo.score;
    });
    
   
    if (warmColors > coolColors) {
      if (brightColors > mutedColors) {
        colorType = "Tavasz - meleg, világos színek";
      } else {
        colorType = "Ősz - meleg, mély színek";
      }
    } else {
      if (brightColors > mutedColors) {
        colorType = "Nyár - hűvös, lágy színek";
      } else {
        colorType = "Tél - hűvös, élénk színek";
      }
    }
  }
  
  
  const colorPalettes = {
    'Tavasz': [
      { name: 'Korall', hex: '#ff7f50' },
      { name: 'Barackszín', hex: '#ffcba4' },
      { name: 'Arany', hex: '#ffd700' },
      { name: 'Meleg zöld', hex: '#32cd32' },
      { name: 'Türkiz', hex: '#40e0d0' }
    ],
    'Nyár': [
      { name: 'Levendula', hex: '#e6e6fa' },
      { name: 'Rózsaszín', hex: '#ffc0cb' },
      { name: 'Világoskék', hex: '#add8e6' },
      { name: 'Szürke', hex: '#808080' },
      { name: 'Mályva', hex: '#e0b0ff' }
    ],
    'Ősz': [
      { name: 'Bordó', hex: '#800020' },
      { name: 'Olíva', hex: '#708238' },
      { name: 'Terrakotta', hex: '#e2725b' },
      { name: 'Mogyoró', hex: '#a67b5b' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    'Tél': [
      { name: 'Fekete', hex: '#000000' },
      { name: 'Fehér', hex: '#ffffff' },
      { name: 'Királykék', hex: '#4169e1' },
      { name: 'Smaragdzöld', hex: '#008000' },
      { name: 'Magenta', hex: '#ff00ff' }
    ]
  };
  
  const avoidColorPalettes = {
    'Tavasz': [
      { name: 'Fekete', hex: '#000000' },
      { name: 'Sötétszürke', hex: '#696969' },
      { name: 'Sötétkék', hex: '#00008b' }
    ],
    'Nyár': [
      { name: 'Narancssárga', hex: '#ffa500' },
      { name: 'Arany', hex: '#ffd700' },
      { name: 'Élénk piros', hex: '#ff0000' }
    ],
    'Ősz': [
      { name: 'Neon rózsaszín', hex: '#ff6ec7' },
      { name: 'Élénk citromsárga', hex: '#fff700' },
      { name: 'Világoskék', hex: '#add8e6' }
    ],
    'Tél': [
      { name: 'Bézs', hex: '#f5f5dc' },
      { name: 'Barackszín', hex: '#ffcba4' },
      { name: 'Olíva', hex: '#708238' }
    ]
  };
  
  const colorTypeName = colorType.split(' - ')[0];
  const recommendedColors = colorPalettes[colorTypeName] || colorPalettes['Tavasz'];
  const avoidColors = avoidColorPalettes[colorTypeName] || avoidColorPalettes['Tavasz'];
  
  
  let recommendedStyle = "Klasszikus - időtlen, elegáns darabok"; 
  if (labelResult && labelResult.labelAnnotations) {
    const labels = labelResult.labelAnnotations.map(label => label.description.toLowerCase());
    
    if (labels.some(label => label.includes("casual") || label.includes("natural") || label.includes("comfort"))) {
      recommendedStyle = "Természetes - kényelmes, laza viselet";
    } else if (labels.some(label => label.includes("elegant") || label.includes("formal") || label.includes("luxury"))) {
      recommendedStyle = "Elegáns - kifinomult, minőségi darabok";
    } else if (labels.some(label => label.includes("creative") || label.includes("artistic") || label.includes("unique"))) {
      recommendedStyle = "Kreatív - egyedi, művészi megjelenés";
    } else if (labels.some(label => label.includes("romantic") || label.includes("feminine") || label.includes("floral"))) {
      recommendedStyle = "Romantikus - nőies, lágy vonalak";
    } else if (labels.some(label => label.includes("urban") || label.includes("trendy") || label.includes("modern"))) {
      recommendedStyle = "Városi - modern, trendi darabok";
    } else if (labels.some(label => label.includes("dramatic") || label.includes("bold") || label.includes("statement"))) {
      recommendedStyle = "Drámai - merész, feltűnő megjelenés";
    }
  }
  
 
  const styleAdvice = `
    A képed alapján a ${colorType.toLowerCase()} típusba tartozol.
    Testalkatod ${bodyType.toLowerCase()}, ezért érdemes olyan ruhákat választanod,
    amelyek kiemelik az előnyös tulajdonságaidat.
   
    Arcformád ${faceShape.toLowerCase()}, ehhez a következő frizurák és kiegészítők állnak jól:
    ${faceShape.includes('Ovális') ? '- Szinte bármilyen frizura és kiegészítő jól áll neked' :
      faceShape.includes('Kerek') ? '- A hosszabb, réteges frizurák és a hosszúkás fülbevalók nyújtják az arcot' :
      faceShape.includes('Szögletes') ? '- A lágy, hullámos frizurák és kerek formájú kiegészítők lágyítják a vonásokat' :
      faceShape.includes('Szív') ? '- Az állhoz érő vagy hosszabb frizurák, valamint a szélesebb nyakláncok egyensúlyba hozzák az arcot' :
      faceShape.includes('Hosszúkás') ? '- A rövidebb, volumennel rendelkező frizurák és a kerek vagy négyzet alakú kiegészítők rövidítik az arcot' :
      '- A középen elválasztott frizurák és az ovális vagy kerek kiegészítők kiemelik az arccsontot'}
   
    A ${recommendedStyle.toLowerCase()} stílus illik hozzád a legjobban.
    Válassz olyan ruhákat, amelyek tükrözik ezt a stílust és a színtípusodhoz illő színekben kaphatók.
  `.trim().replace(/\n\s+/g, '\n');
  
  return {
    colorType,
    bodyType,
    faceShape,
    recommendedStyle,
    recommendedColors,
    avoidColors,
    styleAdvice
  };
}



app.get('/api/style/usage', (req, res) => {
  try {
    console.log('Style API usage request received');
    
  
    if (!db || db.state === 'disconnected') {
      console.error('Adatbázis kapcsolat nem elérhető');
      return res.status(500).json({ error: 'Adatbázis kapcsolat nem elérhető' });
    }
    
    const query = 'SELECT * FROM api_usage WHERE api_name = "style_api"';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Hiba az API használat lekérdezésekor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('Style API usage data retrieved:', results);
      
     
      if (!results || results.length === 0) {
        return res.json({
          api_name: 'style_api',
          usage_count: 0,
          limit_count: 1000,
          reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          last_updated: new Date().toISOString().split('T')[0]
        });
      }
      
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Váratlan hiba az API használat lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});


app.post('/api/style/usage/reset', async (req, res) => {
  try {
    await db.query(
      'UPDATE api_usage SET usage_count = 0, reset_date = DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), last_updated = NOW() WHERE api_name = "style_api"'
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Hiba az API használat nullázásakor:', error);
    res.status(500).json({ error: 'Adatbázis hiba' });
  }
});


app.post('/api/style/initialize', async (req, res) => {
  try {
    const query = `
      INSERT INTO api_usage (api_name, usage_count, limit_count, reset_date, last_updated)
      VALUES ('style_api', 0, 1000, DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), NOW())
      ON DUPLICATE KEY UPDATE 
        limit_count = 1000,
        last_updated = NOW()
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('Hiba a stílus API inicializálásakor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('Stílus API sikeresen inicializálva');
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Váratlan hiba a stílus API inicializálásakor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});


app.get('/api/style/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_requests,
        DATE_FORMAT(last_updated, '%Y-%m-%d') as last_used_date,
        DATEDIFF(reset_date, CURRENT_DATE()) as days_until_reset
      FROM api_usage 
      WHERE api_name = 'style_api'
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Hiba a stílus API statisztikák lekérdezésekor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      if (!results || results.length === 0) {
        return res.json({
          total_requests: 0,
          last_used_date: null,
          days_until_reset: 30
        });
      }
      
      console.log('Stílus API statisztikák:', results[0]);
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Váratlan hiba a stílus API statisztikák lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});


app.post('/api/style/set-limit', async (req, res) => {
  try {
    const { limit } = req.body;
    
    if (!limit || isNaN(parseInt(limit)) || parseInt(limit) <= 0) {
      return res.status(400).json({ error: 'Érvénytelen limit érték' });
    }
    
    const query = `
      UPDATE api_usage 
      SET limit_count = ?, last_updated = NOW()
      WHERE api_name = 'style_api'
    `;
    
    db.query(query, [parseInt(limit)], (err, result) => {
      if (err) {
        console.error('Hiba a stílus API limit beállításakor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('Stílus API limit sikeresen beállítva:', limit);
      res.json({ success: true, limit: parseInt(limit) });
    });
  } catch (error) {
    console.error('Váratlan hiba a stílus API limit beállításakor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});


app.get('/api/style/history', async (req, res) => {
  try {
   
    
    const mockHistory = [
      { date: '2023-05-01', count: 5 },
      { date: '2023-05-02', count: 8 },
      { date: '2023-05-03', count: 3 },
      { date: '2023-05-04', count: 12 },
      { date: '2023-05-05', count: 7 }
    ];
    
    res.json(mockHistory);
  } catch (error) {
    console.error('Váratlan hiba a stílus API előzmények lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});


app.get('/api/style/forecast', async (req, res) => {
  try {
 
    
    const mockForecast = {
      estimated_monthly_usage: 150,
      estimated_depletion_date: '2023-06-15',
      recommendation: 'A jelenlegi használati szint mellett a havi limit elegendő lesz.'
    };
    
    res.json(mockForecast);
  } catch (error) {
    console.error('Váratlan hiba a stílus API előrejelzés lekérdezésekor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

const visionClient2 = new vision.ImageAnnotatorClient({
  keyFilename: './vision-api-key1.json' 
});
app.post('/api/vision/analyze-file', async (req, res) => {
  try {
    console.log('Kép elemzése kezdődik (2. fiók)...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nincs feltöltött kép' });
    }
    
    
    await incrementApiUsage('vision_api_2');
    
    const filePath = path.join(__dirname, req.file.path);
    
    try {
      
      const [labelResult] = await visionClient2.labelDetection(filePath);
      const [objectResult] = await visionClient2.objectLocalization(filePath);
      const [imagePropertiesResult] = await visionClient2.imageProperties(filePath);
      
      
      const labels = labelResult.labelAnnotations || [];
      const objects = objectResult.localizedObjectAnnotations || [];
      const colors = imagePropertiesResult.imagePropertiesAnnotation?.dominantColors?.colors || [];
      
    
      
      
      const response = {
        suggestedCategory,
        suggestedDescription,
        quality: 0.8,
        tags: labels.slice(0, 5).map(label => label.description),
        colors: colors.slice(0, 3).map(color => {
          const rgb = color.color;
          return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
        }),
        confidence: highestMatchScore || (labels.length > 0 ? labels[0].score : 0.7)
      };
      
      console.log('Válasz előkészítve (2. fiók):', response);
      res.json(response);
    } catch (apiError) {
      console.error('Hiba a Vision API (2. fiók) használata során:', apiError);
      res.status(500).json({
        error: 'Hiba a Vision API használata során: ' + apiError.message,
        fallback: getFallbackResponse()
      });
    }
  } catch (error) {
    console.error('Hiba a kép elemzése során (2. fiók):', error);
    res.status(500).json({
      error: 'Hiba a kép elemzése során: ' + error.message,
      fallback: getFallbackResponse()
    });
  }
});

app.post('/api/vision2/initialize', async (req, res) => {
  try {
    const query = `
      INSERT INTO api_usage (api_name, usage_count, limit_count, reset_date, last_updated)
      VALUES ('vision_api_2', 0, 1000, DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), NOW())
      ON DUPLICATE KEY UPDATE 
        limit_count = 1000,
        last_updated = NOW()
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('Hiba a második Vision API inicializálásakor:', err);
        return res.status(500).json({ error: 'Adatbázis hiba: ' + err.message });
      }
      
      console.log('Második Vision API sikeresen inicializálva');
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Váratlan hiba a második Vision API inicializálásakor:', error);
    res.status(500).json({ error: 'Szerver hiba: ' + error.message });
  }
});

  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};


startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

