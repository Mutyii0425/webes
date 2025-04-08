import emailService from '../config/email.js';

class OrderController {
  constructor(orderModel, productModel) { 
    this.orderModel = orderModel;
    this.productModel = productModel; 
  }

  async createCustomer(req, res) {
    try {
      const { nev, telefonszam, email, irsz, telepules, kozterulet, fizetesi_mod } = req.body;
      const customerId = await this.orderModel.createCustomer({
        nev, telefonszam, email, irsz, telepules, kozterulet, fizetesi_mod
      });
      
      res.json({ 
        success: true,
        id: customerId 
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createOrder(req, res) {
    try {
      const { termek, statusz, mennyiseg, vevo_id, ar } = req.body;
      

      const product = await this.productModel.getProductById(termek);
      
      if (!product) {
        return res.status(404).json({ error: 'Termék nem található' });
      }
      
      if (product.keszlet < mennyiseg) {
        return res.status(400).json({ 
          error: 'Nincs elég készleten',
          available: product.keszlet,
          requested: mennyiseg
        });
      }
      

      const orderId = await this.orderModel.createOrder({
        termek, statusz, mennyiseg, vevo_id, ar
      });
      

      await this.productModel.updateStock(termek, mennyiseg);
      
      res.json({ 
        success: true,
        orderId: orderId
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAllOrdersAndCustomers(req, res) {
    try {
      const result = await this.orderModel.deleteAllOrdersAndCustomers();
      
      if (result.success) {
        res.json({ 
          message: result.message,
          deletedOrders: result.deletedOrders,
          deletedCustomers: result.deletedCustomers
        });
      } else {
        res.status(500).json({ error: 'Failed to delete orders and customers' });
      }
    } catch (error) {
      console.error('Error in deleteAllOrdersAndCustomers controller:', error);
      res.status(500).json({ error: 'Server error when deleting orders and customers' });
    }
  }


        async getOrderStats(req, res) {
          try {
            const userId = req.params.userId
            const stats = await this.orderModel.getOrderStats(userId)
      
            res.json(stats)
          } catch (error) {
            console.error('Database error:', error)
            res.status(500).json({ error: 'Adatbázis hiba' })
          }
        }

        async updateOrderStats(req, res) {
          try {
            const { userId, orderAmount, orderDate } = req.body
            const stats = await this.orderModel.getOrderStats(userId)
      
            stats.totalOrders += 1
            stats.totalAmount += orderAmount
            stats.lastOrderDate = orderDate
      
            res.json(stats)
          } catch (error) {
            console.error('Database error:', error)
            res.status(500).json({ error: 'Adatbázis hiba' })
          }
        }

        async sendConfirmation(req, res) {
          const { email, name, orderId, orderItems, shippingDetails, totalPrice, discount, shippingCost, paymentMethod } = req.body;
        
          // Ensure all values are valid numbers
          const validTotalPrice = !isNaN(totalPrice) && totalPrice !== null ? Number(totalPrice) : 0;
          const validDiscount = !isNaN(discount) && discount !== null ? Number(discount) : 0;
         
          // Handle shipping cost which might be a string like "Ingyenes szállítás"
          let validShippingCost = 0;
          if (typeof shippingCost === 'number') {
            validShippingCost = !isNaN(shippingCost) ? shippingCost : 0;
          } else if (typeof shippingCost === 'string') {
            // If it's a string like "1590 Ft", extract the number
            const match = shippingCost.match(/\d+/);
            validShippingCost = match ? Number(match[0]) : 0;
          }
        
          const orderItemsList = orderItems.map(item =>
            `<tr>
              <td>${item.nev} - Méret: ${item.size}</td>
              <td>${item.mennyiseg} db</td>
              <td>${Number(item.ar).toLocaleString()} </td>
              <td>${(Number(item.ar) * Number(item.mennyiseg)).toLocaleString()} Ft</td>
            </tr>`
          ).join('')
        
          // Calculate subtotal correctly
          const subtotal = validTotalPrice - validShippingCost;
        
          const msg = {
            from: '"Adali Clothing" <adaliclothing@gmail.com>',
            to: email,
            subject: 'Rendelés visszaigazolás - Adali Clothing',
            html: `
              <h2>Kedves ${name}!</h2>
              <p>Köszönjük a rendelését! Az alábbiakban találja a rendelés részleteit.</p>
        
              <h3>Rendelési azonosító: #${orderId}</h3>
        
              <h4>Rendelt termékek:</h4>
              <table style="width:100%; border-collapse: collapse;">
                <tr>
                  <th style="text-align: left; padding: 8px;">Termék</th>
                  <th style="text-align: left; padding: 8px;">Mennyiség</th>
                  <th style="text-align: left; padding: 8px;">Egységár</th>
                  <th style="text-align: left; padding: 8px;">Részösszeg</th>
                </tr>
                ${orderItemsList}
              </table>
        
              <h4>Szállítási adatok:</h4>
              <p>
                Név: ${name}<br>
                Telefonszám: ${shippingDetails.phoneNumber}<br>
                Cím: ${shippingDetails.zipCode} ${shippingDetails.city}, ${shippingDetails.address}
              </p>
        
              <p>
                Részösszeg: ${subtotal.toLocaleString()} Ft<br>
                Kedvezmény: ${validDiscount.toLocaleString()} Ft<br>
                Szállítási költség: ${typeof shippingCost === 'string' ? shippingCost : validShippingCost.toLocaleString() + ' Ft'}<br>
                <strong>Fizetendő összeg: ${(validTotalPrice - validDiscount).toLocaleString()} Ft</strong>
              </p>

              <h4>Fizetési mód:</h4>
              <p>${paymentMethod || 'Utánvét'}</p>
            `
          }
        
          try {
            console.log('Sending confirmation email...')
            const result = await emailService.send(msg);
            console.log('Email sent successfully')
            res.json({ success: true })
          } catch (error) {
            console.error('Email sending error:', error.response?.body)
            res.status(500).json({
              error: 'Email sending failed',
              details: error.response?.body?.errors
            })
          }
        }

        async getAllOrders(req, res) {
          try {
            const orders = await this.orderModel.getAllOrders();
            res.json(orders);
          } catch (error) {
            console.error('Error in getAllOrders controller:', error);
            res.status(500).json({ error: 'Server error when fetching orders' });
          }
        }
        
        // Egy vevő adatainak lekérdezése
        async getCustomerById(req, res) {
          try {
            const customerId = req.params.id;
            
            if (!customerId) {
              return res.status(400).json({ error: 'Customer ID is required' });
            }
            
            const customer = await this.orderModel.getCustomerById(customerId);
            
            if (!customer) {
              return res.status(404).json({ error: 'Customer not found' });
            }
            
            res.json(customer);
          } catch (error) {
            console.error('Error in getCustomerById controller:', error);
            res.status(500).json({ error: 'Server error when fetching customer' });
          }
        }
        
        // Rendelés státuszának frissítése
        async updateOrderStatus(req, res) {
          try {
            const orderId = req.params.id;
            const { status } = req.body;
            
            if (!orderId) {
              return res.status(400).json({ error: 'Order ID is required' });
            }
            
            if (!status) {
              return res.status(400).json({ error: 'Status is required' });
            }
            
            const result = await this.orderModel.updateOrderStatus(orderId, status);
            
            if (!result.success) {
              return res.status(404).json({ error: result.message });
            }
            
            res.json({ message: result.message });
          } catch (error) {
            console.error('Error in updateOrderStatus controller:', error);
            res.status(500).json({ error: 'Server error when updating order status' });
          }
        }
        
        // Rendelési statisztikák lekérdezése
        async getOrderStatistics(req, res) {
          try {
            const stats = await this.orderModel.getOrderStats();
            res.json(stats);
          } catch (error) {
            console.error('Error in getOrderStatistics controller:', error);
            res.status(500).json({ error: 'Server error when fetching order statistics' });
          }
        }
}

export default OrderController