import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './backend.env' });

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'shinkansen.proxy.rlwy.net',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'iZEUnLkFezgUIAWbcnFjyGSUsLyjGbmi',
      database: process.env.DB_NAME || 'railway',
      port: process.env.DB_PORT || '23644'
    });
    
    console.log('Connected to database');
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export default createConnection;