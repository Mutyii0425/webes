import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer'; 

import corsMiddleware from './src/middleware/corsMiddleware.js';
import errorHandler from './src/middleware/errorMiddleware.js';

import createConnection from './src/config/db.js';

import UserModel from './src/models/userModel.js';
import ProductModel from './src/models/productModel.js';
import CategoryModel from './src/models/categoryModel.js';
import OrderModel from './src/models/orderModel.js';
import RatingModel from './src/models/ratingModel.js';
import CouponModel from './src/models/couponModel.js'; 

import AuthController from './src/controllers/authController.js';
import ProductController from './src/controllers/productController.js';
import CategoryController from './src/controllers/categoryController.js';
import OrderController from './src/controllers/orderController.js';
import RatingController from './src/controllers/ratingController.js';
import UserController from './src/controllers/userController.js';
import CouponController from './src/controllers/couponController.js'; 

import setupRoutes from './src/routes/index.js';

dotenv.config({ path: './backend.env' });

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const initializeApp = async () => {
  try {
    const db = await createConnection();
    
    const userModel = new UserModel(db);
    const productModel = new ProductModel(db);
    const categoryModel = new CategoryModel(db);
    const orderModel = new OrderModel(db);
    const ratingModel = new RatingModel(db);
    const couponModel = new CouponModel(db);
    
    const authController = new AuthController(userModel);
    const productController = new ProductController(productModel);
    const categoryController = new CategoryController(categoryModel);
    const orderController = new OrderController(orderModel, productModel);  
    const ratingController = new RatingController(ratingModel);
    const userController = new UserController(userModel);
    const couponController = new CouponController(couponModel);
    
    
    const controllers = {
      authController,
      productController,
      categoryController,
      orderController,
      ratingController,
      userController,
      couponController 
    };
    
    setupRoutes(app, controllers);
    
    app.get('/', (req, res) => {
      res.send('Adali Clothing API server is running');
    });
    
    app.use(errorHandler);
    
    await checkAndFixDatabaseSchema(db);
    
    return app;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

async function checkAndFixDatabaseSchema(db) {
  try {
    const [columns] = await db.execute("SHOW COLUMNS FROM user LIKE 'reset_token'");
    
    if (columns.length === 0) {
      await db.execute("ALTER TABLE user ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL");
      console.log("Added reset_token column to user table");
    }
    
    const [expiryColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'reset_expires'");
    
    if (expiryColumns.length === 0) {
      await db.execute("ALTER TABLE user ADD COLUMN reset_expires DATETIME DEFAULT NULL");
      console.log("Added reset_expires column to user table");
    }
    
    const [kuponColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'kupon'");
    if (kuponColumns.length === 0) {
      await db.execute("ALTER TABLE user ADD COLUMN kupon VARCHAR(50) DEFAULT NULL");
      console.log("Added kupon column to user table");
    }
    
    const [kuponKodColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'kupon_kod'");
    if (kuponKodColumns.length === 0) {
      await db.execute("ALTER TABLE user ADD COLUMN kupon_kod VARCHAR(50) DEFAULT NULL");
      console.log("Added kupon_kod column to user table");
    }
    
    const [kuponHasznalvaColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'kupon_hasznalva'");
    if (kuponHasznalvaColumns.length === 0) {
      await db.execute("ALTER TABLE user ADD COLUMN kupon_hasznalva TINYINT(1) DEFAULT 0");
      console.log("Added kupon_hasznalva column to user table");
    }
    
    const [kuponLejarColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'kupon_lejar'");
    if (kuponLejarColumns.length === 0) {
      await db.execute("ALTER TABLE user ADD COLUMN kupon_lejar DATETIME DEFAULT NULL");
      console.log("Added kupon_lejar column to user table");
    }
    
    const [emailKuponColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'email_kupon'");
    if (emailKuponColumns.length === 0) {
      await db.execute("ALTER TABLE user ADD COLUMN email_kupon VARCHAR(50) DEFAULT NULL");
      console.log("Added email_kupon column to user table");
    }
    
    const [emailKuponHasznalvaColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'email_kupon_hasznalva'");
    if (emailKuponHasznalvaColumns.length === 0) {
      await db.execute("ALTER TABLE user ADD COLUMN email_kupon_hasznalva TINYINT(1) DEFAULT 0");
      console.log("Added email_kupon_hasznalva column to user table");
    }
    
    const [emailKuponLejarColumns] = await db.execute("SHOW COLUMNS FROM user LIKE 'email_kupon_lejar'");
    if (emailKuponLejarColumns.length === 0) {
      await db.execute("ALTER TABLE user ADD COLUMN email_kupon_lejar DATETIME DEFAULT NULL");
      console.log("Added email_kupon_lejar column to user table");
    }
    
    return true;
  } catch (error) {
    console.error("Database schema check error:", error);
    return false;
  }
}
    

export default initializeApp;
