class OrderModel {
  constructor(db) {
    this.db = db;
  }

  async createCustomer(customerData) {
    const { nev, telefonszam, email, irsz, telepules, kozterulet, fizetesi_mod } = customerData;
    
    const [result] = await this.db.execute(
      'INSERT INTO vevo (nev, telefonszam, email, irsz, telepules, kozterulet, fizetesi_mod) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nev, telefonszam, email, irsz, telepules, kozterulet, fizetesi_mod || 'utanvet']
    );
    
    return result.insertId;
  }

  async createOrder(orderData) {
    const { termek, statusz, mennyiseg, vevo_id, ar } = orderData;
    
    const [result] = await this.db.execute(
      'INSERT INTO rendeles (termek, statusz, mennyiseg, vevo_id, ar) VALUES (?, ?, ?, ?, ?)',
      [termek, statusz, mennyiseg, vevo_id, ar]
    );
    
    return result.insertId;
  }

  async deleteAllOrdersAndCustomers() {
    try {
      // Tranzakció kezdése
      await this.db.beginTransaction();
      
      try {
        // Először töröljük a rendeléseket (a külső kulcs miatt)
        const [ordersResult] = await this.db.execute('DELETE FROM rendeles');
        
        // Majd töröljük a vevőket
        const [customersResult] = await this.db.execute('DELETE FROM vevo');
        
        // Tranzakció véglegesítése
        await this.db.commit();
        
        return {
          success: true,
          message: 'All orders and customers have been deleted successfully',
          deletedOrders: ordersResult.affectedRows,
          deletedCustomers: customersResult.affectedRows
        };
      } catch (error) {
        // Hiba esetén visszagörgetjük a tranzakciót
        await this.db.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error deleting all orders and customers:', error);
      throw new Error('Database error when deleting orders and customers');
    }
  }

  async getAllOrders() {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM rendeles ORDER BY date DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw new Error('Database error when fetching orders');
    }
  }

// Egy vevő adatainak lekérdezése
async getCustomerById(customerId) {
  try {
    const [rows] = await this.db.execute(
      'SELECT * FROM vevo WHERE id = ?',
      [customerId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    throw new Error('Database error when fetching customer');
  }
}

// Rendelés státuszának frissítése
async updateOrderStatus(orderId, status) {
  try {
    // Ellenőrizzük, hogy létezik-e a rendelés
    const [orderCheck] = await this.db.execute(
      'SELECT id FROM rendeles WHERE id = ?',
      [orderId]
    );
    
    if (orderCheck.length === 0) {
      return { success: false, message: 'Order not found' };
    }
    
    // Frissítsük a státuszt
    await this.db.execute(
      'UPDATE rendeles SET statusz = ? WHERE id = ?',
      [status, orderId]
    );
    
    return { success: true, message: 'Order status updated successfully' };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Database error when updating order status');
  }
}

// Rendelési statisztikák lekérdezése
async getOrderStats() {
  try {
    // Összes rendelés száma
    const [totalOrders] = await this.db.execute(
      'SELECT COUNT(*) as count FROM rendeles'
    );
    
    // Kézbesített rendelések száma
    const [deliveredOrders] = await this.db.execute(
      'SELECT COUNT(*) as count FROM rendeles WHERE statusz = ?',
      ['Kézbesítve']
    );
    
    // Törölt rendelések száma
    const [canceledOrders] = await this.db.execute(
      'SELECT COUNT(*) as count FROM rendeles WHERE statusz = ?',
      ['Törölve']
    );
    
    // Folyamatban lévő rendelések száma
    const [inProgressOrders] = await this.db.execute(
      'SELECT COUNT(*) as count FROM rendeles WHERE statusz NOT IN (?, ?)',
      ['Kézbesítve', 'Törölve']
    );
    
    // Összes bevétel
    const [totalRevenue] = await this.db.execute(
      'SELECT SUM(ar) as total FROM rendeles WHERE statusz != ?',
      ['Törölve']
    );
    
    return {
      totalOrders: totalOrders[0].count,
      deliveredOrders: deliveredOrders[0].count,
      canceledOrders: canceledOrders[0].count,
      inProgressOrders: inProgressOrders[0].count,
      totalRevenue: totalRevenue[0].total || 0
    };
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw new Error('Database error when fetching order statistics');
  }
}

 
}

export default OrderModel;
