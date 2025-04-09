class ProductModel {
  constructor(db) {
    this.db = db;
  }

  async getAllProducts() {
    const [rows] = await this.db.execute('SELECT * FROM termekek');
    return rows;
  }


  async getAllUserProducts() {
    const [rows] = await this.db.execute('SELECT * FROM usertermekek');
    return rows;
  }

  async getProductById(id) {
    const [rows] = await this.db.execute('SELECT * FROM termekek WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
  }

  async getUserProductById(id) {
    const [rows] = await this.db.execute('SELECT * FROM usertermekek WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async createProduct(productData) {
    const { nev, ar, termekleiras, kategoria, imageUrl, kategoriaId, keszlet = 10 } = productData;
    
    const [result] = await this.db.execute(
      'INSERT INTO termekek (nev, ar, termekleiras, kategoria, imageUrl, kategoriaId, keszlet) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nev, ar, termekleiras, kategoria, imageUrl, kategoriaId, keszlet]
    );
    
    return result.insertId;
  }

  async createUserProduct(productData) {
    console.log('Model received data:', productData);
    
    const { kategoriaId, ar, nev, leiras, meret, imageUrl, images, feltolto } = productData;
    
    try {
      const [result] = await this.db.execute(
        'INSERT INTO usertermekek (kategoriaId, ar, nev, leiras, meret, imageUrl, images, feltolto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [kategoriaId, ar, nev, leiras, meret, imageUrl, JSON.stringify(images || []), feltolto]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Database error in createUserProduct:', error);
      throw error;
    }
  }

  async getAllUserProductsWithUploaderInfo() {
    const [rows] = await this.db.execute(`
      SELECT ut.*, u.profile_image as feltoltoKep
      FROM usertermekek ut
      LEFT JOIN user u ON ut.feltolto = u.felhasznalonev
    `);
    return rows;
  }

  async updateProduct(id, productData) {
    const { ar, termekleiras } = productData;
    
    await this.db.execute(
      'UPDATE termekek SET ar = ?, termekleiras = ? WHERE id = ?',
      [ar, termekleiras, id]
    );
  }

  async updateUserProduct(id, productData) {
    const { ar, nev, leiras, meret } = productData;
    
    await this.db.execute(
      'UPDATE usertermekek SET ar = ?, nev = ?, leiras = ?, meret = ? WHERE id = ?',
      [ar, nev, leiras, meret, id]
    );
  }

  async deleteProduct(id) {
    await this.db.execute('DELETE FROM termekek WHERE id = ?', [id]);
  }

  async deleteUserProduct(id) {
    await this.db.execute('DELETE FROM usertermekek WHERE id = ?', [id]);
  }

  async updateStock(productId, quantity) {
    try {
    
      const [currentStock] = await this.db.execute(
        'SELECT keszlet FROM termekek WHERE id = ?',
        [productId]
      );
      
      if (currentStock.length === 0) {
        throw new Error('Termék nem található');
      }
      

      await this.db.execute(
        'UPDATE termekek SET keszlet = keszlet - ? WHERE id = ?',
        [quantity, productId]
      );
      

      const [rows] = await this.db.execute(
        'SELECT id, nev, keszlet FROM termekek WHERE id = ?',
        [productId]
      );
      
      return rows[0];
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }


  async getLowStockProducts(threshold = 5) {
    try {
      const [rows] = await this.db.execute(
        'SELECT id, nev, keszlet, imageUrl, ar FROM termekek WHERE keszlet <= ? ORDER BY keszlet ASC',
        [threshold]
      );
      return rows;
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw error;
    }
  }

  
  async setStock(productId, newStock) {
    try {
      await this.db.execute(
        'UPDATE termekek SET keszlet = ? WHERE id = ?',
        [newStock, productId]
      );
      
      const [rows] = await this.db.execute(
        'SELECT id, nev, keszlet FROM termekek WHERE id = ?',
        [productId]
      );
      
      return rows[0];
    } catch (error) {
      console.error('Error setting stock:', error);
      throw error;
    }
  }

 
async setAllStock(minStock = 10, maxStock = 50) {
  try {

    const [products] = await this.db.execute('SELECT id FROM termekek');
    

    for (const product of products) {
      const newStock = Math.floor(Math.random() * (maxStock - minStock + 1)) + minStock;
      
      await this.db.execute(
        'UPDATE termekek SET keszlet = ? WHERE id = ?',
        [newStock, product.id]
      );
    }
    
   
    const [updatedProducts] = await this.db.execute(
      'SELECT id, nev, keszlet FROM termekek'
    );
    
    return updatedProducts;
  } catch (error) {
    console.error('Error setting all stock:', error);
    throw error;
  }
}

}

export default ProductModel;
