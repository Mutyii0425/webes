class ProductController {
  constructor(productModel) {
    this.productModel = productModel;
  }

  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!id || quantity === undefined) {
        return res.status(400).json({ error: 'Hiányzó termék ID vagy mennyiség' });
      }
      
      const product = await this.productModel.updateStock(id, quantity);
      

      let lowStockWarning = null;
      if (product.keszlet <= 5) {
        lowStockWarning = `Figyelem! A(z) "${product.nev}" termék készlete alacsony: ${product.keszlet} db`;
      }
      
      res.json({
        success: true,
        product,
        lowStockWarning
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ error: error.message || 'Adatbázis hiba' });
    }
  }


  async getLowStockProducts(req, res) {
    try {
      const threshold = parseInt(req.query.threshold) || 5;
      const products = await this.productModel.getLowStockProducts(threshold);
      
      res.json({
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Error getting low stock products:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }


  async setStock(req, res) {
    try {
      const { id } = req.params;
      const { newStock } = req.body;
      
      if (!id || newStock === undefined) {
        return res.status(400).json({ error: 'Hiányzó termék ID vagy új készlet érték' });
      }
      
      const product = await this.productModel.setStock(id, newStock);
      
      res.json({
        success: true,
        product
      });
    } catch (error) {
      console.error('Error setting stock:', error);
      res.status(500).json({ error: error.message || 'Adatbázis hiba' });
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await this.productModel.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async getAllUserProducts(req, res) {
    try {
      const products = await this.productModel.getAllUserProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching user products:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await this.productModel.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Termék nem található' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async getUserProductById(req, res) {
    try {
      const product = await this.productModel.getUserProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Termék nem található' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching user product:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async createProduct(req, res) {
    try {
      const { nev, ar, termekleiras, kategoria, imageUrl, kategoriaId, keszlet } = req.body;
      const productId = await this.productModel.createProduct({
        nev, ar, termekleiras, kategoria, imageUrl, kategoriaId, keszlet
      });
      
      res.status(201).json({ 
        success: true,
        id: productId,
        message: 'Termék sikeresen létrehozva' 
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }


  async createUserProduct(req, res) {
    try {
      console.log('Beérkezett adatok:', req.body);
      

      const { kategoriaId, ar, nev, leiras, meret, imageUrl, images, feltolto } = req.body;
      
      if (!kategoriaId || !ar || !nev || !leiras || !meret || !imageUrl) {
        return res.status(400).json({ 
          error: 'Hiányzó adatok', 
          received: req.body,
          missing: {
            kategoriaId: !kategoriaId,
            ar: !ar,
            nev: !nev,
            leiras: !leiras,
            meret: !meret,
            imageUrl: !imageUrl
          }
        });
      }
      
      const productId = await this.productModel.createUserProduct({
        kategoriaId, ar, nev, leiras, meret, imageUrl, images, feltolto
      });
      
      res.status(201).json({ 
        success: true,
        id: productId,
        message: 'Termék sikeresen létrehozva' 
      });
    } catch (error) {
      console.error('Error creating user product:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async updateProduct(req, res) {
    try {
      const { ar, termekleiras } = req.body;
      await this.productModel.updateProduct(req.params.id, { ar, termekleiras });
      
      res.json({ message: 'Termék sikeresen frissítve' });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Hiba a frissítés során' });
    }
  }

  async updateUserProduct(req, res) {
    try {
      const { ar, nev, leiras, meret } = req.body;
      await this.productModel.updateUserProduct(req.params.id, { ar, nev, leiras, meret });
      
      res.json({ message: 'Termék sikeresen frissítve' });
    } catch (error) {
      console.error('Error updating user product:', error);
      res.status(500).json({ error: 'Hiba a frissítés során' });
    }
  }

  async deleteProduct(req, res) {
    try {
      await this.productModel.deleteProduct(req.params.id);
      res.json({ message: 'Termék sikeresen törölve' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Hiba a törlés során' });
    }
  }

  async deleteUserProduct(req, res) {
    try {
      await this.productModel.deleteUserProduct(req.params.id);
      res.json({ message: 'Termék sikeresen törölve' });
    } catch (error) {
      console.error('Error deleting user product:', error);
      res.status(500).json({ error: 'Hiba a törlés során' });
    }
  }

  async setAllStock(req, res) {
    try {
      const { minStock = 10, maxStock = 50 } = req.body;
      

      if (minStock < 0 || maxStock < minStock) {
        return res.status(400).json({ 
          error: 'Érvénytelen készlet értékek. A minimum nem lehet negatív, és a maximum nem lehet kisebb a minimumnál.' 
        });
      }
      
      const products = await this.productModel.setAllStock(minStock, maxStock);
      
      res.json({
        success: true,
        message: `${products.length} termék készlete sikeresen frissítve ${minStock}-${maxStock} közötti értékekkel.`,
        products
      });
    } catch (error) {
      console.error('Error setting all stock:', error);
      res.status(500).json({ error: error.message || 'Adatbázis hiba' });
    }
  }
}

export default ProductController;
