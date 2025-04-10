import sgMail from '../config/email.js';

class CouponController {
  constructor(couponModel) {
    this.couponModel = couponModel;
  }

  async sendCouponsToAllUsers(req, res) {
    try {
      
      res.json({ success: true, message: "Kuponok sikeresen elküldve minden felhasználónak!" });
    } catch (error) {
      console.error('Hiba a kuponok küldésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kuponok küldésekor' });
    }
  }

  async sendCouponsToSelectedUsers(req, res) {
    try {
      console.log("Kérés tartalma:", req.body);
      const { userIds, expiryDays } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'Legalább egy felhasználót ki kell választani' });
      }
      
      
      const validExpiryDays = expiryDays && !isNaN(expiryDays) ? parseInt(expiryDays) : 30;
      

      const result = await this.couponModel.sendCouponsToSelectedUsers(userIds, validExpiryDays);
      
 
      let emailSuccessCount = 0;
      let emailErrorCount = 0;
 
      if (!result.results || !Array.isArray(result.results)) {
        console.error('Hiányzó vagy érvénytelen results tömb:', result);
        return res.json({
          success: true,
          message: `Sikeresen frissítve ${result.successCount || 0} felhasználó, de nem sikerült e-mailt küldeni.`,
          dbSuccessCount: result.successCount || 0,
          dbErrorCount: result.errorCount || 0,
          emailSuccessCount: 0,
          emailErrorCount: 0
        });
      }

      for (const userResult of result.results) {
        try {
          const msg = {
            to: userResult.email,
            from: {
              name: 'Adali Clothing',
              email: 'adaliclothing@gmail.com'
            },
            subject: 'Különleges ajánlat az Adali Clothing-tól!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Kedves ${userResult.username}!</h2>
                <p>Köszönjük, hogy az Adali Clothing vásárlója vagy!</p>
                <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                  <h3 style="color: #e63946; margin-bottom: 10px;">15% KEDVEZMÉNY</h3>
                  <p style="font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #333;">${userResult.couponCode}</p>
                  <p>Használd ezt a kódot a következő vásárlásodnál!</p>
                  <p>A kupon érvényességi ideje: <strong>${userResult.expiryDate.toLocaleDateString('hu-HU')}</strong></p>
                </div>
                <p>A kupon a végösszegből kerül levonásra a fizetés előtt.</p>
                <p>Üdvözlettel,<br>Az Adali Clothing csapata</p>
              </div>
            `
          };
          
          await sgMail.send(msg);
          console.log(`E-mail sikeresen elküldve ${userResult.email} címre.`);
          emailSuccessCount++;
        } catch (error) {
          console.error(`Hiba az e-mail küldésekor ${userResult.email} címre:`, error);
          emailErrorCount++;
        }
      }

      res.json({
        success: true,
        message: `Sikeresen kiküldve ${emailSuccessCount} felhasználónak!`,
        dbSuccessCount: result.successCount,
        dbErrorCount: result.errorCount,
        emailSuccessCount,
        emailErrorCount
      });
    } catch (error) {
      console.error('Részletes hiba a sendCouponsToSelectedUsers-ben:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kuponok küldésekor: ' + error.message });
    }
  }

  async getUserCoupons(req, res) {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        return res.status(400).json({ error: 'Felhasználó azonosító szükséges' });
      }
      
      const coupons = await this.couponModel.getUserCoupons(userId);
      
      if (!coupons) {
        return res.status(404).json({ error: 'Nem található kupon információ a felhasználóhoz' });
      }
      
      res.json(coupons);
    } catch (error) {
      console.error('Hiba a kupon információk lekérésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kupon információk lekérésekor' });
    }
  }

  async markCouponAsUsed(req, res) {
    try {
      const { userId, email } = req.body;
      
      if (!userId && !email) {
        return res.status(400).json({ error: 'Felhasználó azonosító vagy email cím szükséges' });
      }
      
      let result;
      
      if (userId) {
        result = await this.couponModel.markCouponAsUsed(userId);
      } else {
        
        const [users] = await this.couponModel.db.execute(
          'SELECT f_azonosito FROM user WHERE email = ?',
          [email]
        );
        
        if (users.length === 0) {
          return res.status(404).json({ error: 'Felhasználó nem található' });
        }
        
        result = await this.couponModel.markCouponAsUsed(users[0].f_azonosito);
      }
      
      if (!result) {
        return res.status(404).json({ error: 'Nem sikerült frissíteni a kupon állapotát' });
      }
      
      res.json({ success: true, message: 'Kupon sikeresen használtként jelölve' });
    } catch (error) {
      console.error('Hiba a kupon használtként jelölésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kupon használtként jelölésekor' });
    }
  }
  
  async markEmailCouponAsUsed(req, res) {
    try {
      const { userId, email } = req.body;
      
      if (!userId && !email) {
        return res.status(400).json({ error: 'Felhasználó azonosító vagy email cím szükséges' });
      }
      
      let result;
      
      if (userId) {
        result = await this.couponModel.markEmailCouponAsUsed(userId);
      } else {

        const [users] = await this.couponModel.db.execute(
          'SELECT f_azonosito FROM user WHERE email = ?',
          [email]
        );
        
        if (users.length === 0) {
          return res.status(404).json({ error: 'Felhasználó nem található' });
        }
        
        result = await this.couponModel.markEmailCouponAsUsed(users[0].f_azonosito);
      }
      
      if (!result) {
        return res.status(404).json({ error: 'Nem sikerült frissíteni a kupon állapotát' });
      }
      
      res.json({ success: true, message: 'Email kupon sikeresen használtként jelölve' });
    } catch (error) {
      console.error('Hiba az email kupon használtként jelölésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt az email kupon használtként jelölésekor' });
    }
  }

  async validateCoupon(req, res) {
    try {
      const { code, userId } = req.body;
      
      if (!code || !userId) {
        return res.status(400).json({ error: 'Hiányzó kuponkód vagy felhasználó azonosító' });
      }
      
      const result = await this.couponModel.validateCoupon(code, userId);
      
      if (!result.valid) {
        return res.json({ 
          success: false, 
          message: this.getErrorMessageForReason(result.reason),
          reason: result.reason
        });
      }
      
      res.json({
        success: true,
        message: 'Érvényes kupon',
        discount: result.discount,
        type: result.type
      });
    } catch (error) {
      console.error('Hiba a kupon ellenőrzésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kupon ellenőrzésekor' });
    }
  }

  getErrorMessageForReason(reason) {
    switch(reason) {
      case 'user_not_found':
        return 'Felhasználó nem található';
      case 'expired':
        return 'A kupon lejárt';
      case 'no_discount':
        return 'Ez a kupon nem tartalmaz kedvezményt';
      case 'invalid_code':
        return 'Érvénytelen kuponkód';
      default:
        return 'Érvénytelen kupon';
    }
  }

  async saveWheelPrize(req, res) {
    try {
      const { userId, prize } = req.body;
      
      if (!userId || prize === undefined) {
        return res.status(400).json({ error: 'Hiányzó adatok' });
      }
      

      const [users] = await this.couponModel.db.execute('SELECT f_azonosito FROM user WHERE f_azonosito = ?', [userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'Felhasználó nem található' });
      }

      const crypto = await import('crypto');
      let couponCode = '';
      

      if (prize !== 'Nincs nyeremény') {
        const discountMatch = prize.match(/(\d+)%/);
        const discountPercentage = discountMatch ? discountMatch[1] : '0';
        couponCode = `WHEEL${discountPercentage}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      }
      

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const formattedExpiryDate = expiryDate.toISOString().slice(0, 19).replace('T', ' ');
      

      await this.couponModel.db.execute(
        'UPDATE user SET kupon = ?, kupon_kod = ?, kupon_lejar = ?, kupon_hasznalva = 0 WHERE f_azonosito = ?',
        [prize, couponCode, formattedExpiryDate, userId]
      );
      
      res.json({ 
        success: true, 
        message: 'Nyeremény sikeresen elmentve',
        couponCode: couponCode
      });
    } catch (error) {
      console.error('Hiba a nyeremény mentésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a nyeremény mentésekor' });
    }
  }

  async updateCoupon(req, res) {
    try {
      const { email, coupon, couponCode, couponUsed } = req.body;
      

      if (!email || !coupon) {
        return res.status(400).json({ error: 'Hiányzó adatok' });
      }
      

      await this.couponModel.updateCoupon(email, coupon, couponCode, couponUsed);
      
      res.json({ success: true, message: 'Kupon sikeresen elmentve' });
    } catch (error) {
      console.error('Kupon frissítési hiba:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async getCouponStats(req, res) {
    try {
      const stats = await this.couponModel.getCouponStats();
      res.json(stats);
    } catch (error) {
      console.error('Hiba a kupon statisztikák lekérésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kupon statisztikák lekérésekor' });
    }
  }
  

  async getCouponHistory(req, res) {
    try {
      const history = await this.couponModel.getCouponHistory();
      res.json(history);
    } catch (error) {
      console.error('Hiba a kupon történet lekérésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kupon történet lekérésekor' });
    }
  }
  

  async validateCoupon(code, userId) {
    try {
      console.log(`Kupon validálás kezdete: Kód=${code}, UserId=${userId}`);
      

      const [users] = await this.db.execute(
        `SELECT 
          kupon, kupon_kod, kupon_hasznalva, kupon_lejar,
          email_kupon, email_kupon_kod, email_kupon_hasznalva, email_kupon_lejar
        FROM user 
        WHERE f_azonosito = ?`,
        [userId]
      );
      
      if (users.length === 0) {
        console.log('Felhasználó nem található');
        return { valid: false, reason: 'user_not_found' };
      }
      
      const user = users[0];
      console.log('Felhasználó kupon adatai:', {
        regCoupon: user.kupon,
        regCouponCode: user.kupon_kod,
        regCouponUsed: user.kupon_hasznalva,
        regCouponExpiry: user.kupon_lejar,
        emailCoupon: user.email_kupon,
        emailCouponCode: user.email_kupon_kod,
        emailCouponUsed: user.email_kupon_hasznalva,
        emailCouponExpiry: user.email_kupon_lejar
      });
      
      const now = new Date();
      

      if (user.kupon_kod && user.kupon_kod.toUpperCase() === code.toUpperCase() && !user.kupon_hasznalva) {
        console.log('Regisztrációs kupon egyezés!');
        
  
        if (user.kupon_lejar && new Date(user.kupon_lejar) < now) {
          console.log('Regisztrációs kupon lejárt!');
          return { valid: false, reason: 'expired' };
        }

        let discountPercentage = 0;
        if (user.kupon && user.kupon.includes('%')) {
          const match = user.kupon.match(/(\d+)%/);
          if (match && match[1]) {
            discountPercentage = parseInt(match[1]);
          }
        } else if (user.kupon === 'Nincs nyeremény') {
          console.log('Regisztrációs kupon: Nincs nyeremény');
          return { valid: false, reason: 'no_discount' };
        }
        
        console.log(`Érvényes regisztrációs kupon: ${discountPercentage}% kedvezmény`);
        return { 
          valid: true, 
          type: 'registration',
          discount: discountPercentage
        };
      }
      

      if (user.email_kupon_kod && user.email_kupon_kod.toUpperCase() === code.toUpperCase() && !user.email_kupon_hasznalva) {
        console.log('Email kupon egyezés!');
        

        if (user.email_kupon_lejar && new Date(user.email_kupon_lejar) < now) {
          console.log('Email kupon lejárt!');
          return { valid: false, reason: 'expired' };
        }
        
   
        let discountPercentage = 15; 
        if (user.email_kupon && user.email_kupon.includes('%')) {
          const match = user.email_kupon.match(/(\d+)%/);
          if (match && match[1]) {
            discountPercentage = parseInt(match[1]);
          }
        }
        
        console.log(`Érvényes email kupon: ${discountPercentage}% kedvezmény`);
        return { 
          valid: true, 
          type: 'email',
          discount: discountPercentage
        };
      }
      
      console.log('Nem található érvényes kupon ezzel a kóddal');
      return { valid: false, reason: 'invalid_code' };
    } catch (error) {
      console.error('Hiba a kupon ellenőrzésekor:', error);
      throw error;
    }
  }

  async checkCouponInDatabase(req, res) {
    try {
      const { code } = req.params;
      
      if (!code) {
        return res.status(400).json({ success: false, message: 'Hiányzó kuponkód' });
      }
      

      const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : String(code).trim().toUpperCase();
      
      console.log(`Kupon ellenőrzése az adatbázisban: ${normalizedCode}`);
      
  
      const [regCoupons] = await this.couponModel.db.execute(
        'SELECT f_azonosito, felhasznalonev, kupon, kupon_kod, kupon_lejar, kupon_hasznalva FROM user WHERE kupon_kod = ?',
        [normalizedCode]
      );
      

      const [emailCoupons] = await this.couponModel.db.execute(
        'SELECT f_azonosito, felhasznalonev, email_kupon, email_kupon_kod, email_kupon_lejar, email_kupon_hasznalva FROM user WHERE email_kupon_kod = ?',
        [normalizedCode]
      );
      

      let separateCoupons = [];
      try {
        const [tables] = await this.couponModel.db.execute('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        if (tableNames.includes('coupons')) {
          const [coupons] = await this.couponModel.db.execute(
            'SELECT * FROM coupons WHERE code = ?',
            [normalizedCode]
          );
          separateCoupons = coupons;
        } else if (tableNames.includes('user_coupons')) {
          const [coupons] = await this.couponModel.db.execute(
            'SELECT * FROM user_coupons WHERE code = ?',
            [normalizedCode]
          );
          separateCoupons = coupons;
        }
      } catch (error) {
        console.error('Hiba a külön kupon tábla ellenőrzésekor:', error);
      }
      
      res.json({
        success: true,
        regCoupons,
        emailCoupons,
        separateCoupons
      });
    } catch (error) {
      console.error('Hiba a kupon ellenőrzésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kupon ellenőrzésekor' });
    }
  }

  async deleteCoupon(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Kupon azonosító hiányzik' });
      }
      
      const result = await this.couponModel.deleteCoupon(id);
      
      if (result) {
        res.json({ success: true, message: 'Kupon sikeresen törölve' });
      } else {
        res.status(404).json({ error: 'Kupon nem található' });
      }
    } catch (error) {
      console.error('Hiba a kupon törlésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kupon törlésekor' });
    }
  }

  async deleteAllUsedCoupons(req, res) {
    try {
      const deletedCount = await this.couponModel.deleteAllUsedCoupons();
      
      res.json({ 
        success: true, 
        message: `Sikeresen törölve ${deletedCount} felhasznált kupon`,
        deletedCount 
      });
    } catch (error) {
      console.error('Hiba a kuponok törlésekor:', error);
      res.status(500).json({ error: 'Szerver hiba történt a kuponok törlésekor' });
    }
  }
  
}

export default CouponController;