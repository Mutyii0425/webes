import bcrypt from 'bcryptjs';
import crypto from 'crypto';


class UserModel {
  constructor(db) {
    this.db = db;
  }

  async findByEmail(email) {
    const [rows] = await this.db.execute('SELECT * FROM user WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  async findByUsername(username) {
    const [rows] = await this.db.execute('SELECT * FROM user WHERE felhasznalonev = ?', [username]);
    return rows.length > 0 ? rows[0] : null;
  }


  async findByResetToken(token) {
    const [rows] = await this.db.execute('SELECT * FROM user WHERE reset_token = ?', [token]);
    return rows.length > 0 ? rows[0] : null;
  }

  async findValidResetToken(token) {
    const [rows] = await this.db.execute(
      'SELECT * FROM user WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  
async markCouponAsUsed(email) {
  await this.db.execute(
    'UPDATE user SET kupon_hasznalva = 1 WHERE email = ?',
    [email]
  );
}


async findByEmail(email) {
  const [rows] = await this.db.execute('SELECT * FROM user WHERE email = ?', [email]);
  return rows.length > 0 ? rows[0] : null;
}

async saveProfileImage(username, imageData) {
  await this.db.execute(
    'UPDATE user SET profile_image = ? WHERE felhasznalonev = ?',
    [imageData, username]
  );
}

async create(userData) {
  const { name, email, password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const [result] = await this.db.execute(
    'INSERT INTO user (felhasznalonev, email, jelszo) VALUES (?, ?, ?)', 
    [name, email, hashedPassword]
  );
  
  const userId = result.insertId;
  
  return { 
    username: name, 
    email, 
    f_azonosito: userId 
  };
}


  async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db.execute(
      'UPDATE user SET jelszo = ? WHERE f_azonosito = ?',
      [hashedPassword, userId]
    );
  }

  async createResetToken(email) {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 7200000).toISOString().slice(0, 19).replace('T', ' ');
    
    await this.db.execute(
      'UPDATE user SET reset_token = ?, reset_expires = ? WHERE email = ?',
      [resetToken, resetExpires, email]
    );
    
    return resetToken;
  }


  async resetPasswordWithToken(token, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.db.execute(
      'UPDATE user SET jelszo = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?',
      [hashedPassword, token]
    );
  }

  async updateCoupon(email, coupon) {
    await this.db.execute(
      'UPDATE user SET kupon = ? WHERE email = ?',
      [coupon, email]
    );
  }

  async cleanupExpiredTokens() {
    await this.db.execute(
      'UPDATE user SET reset_token = NULL, reset_expires = NULL WHERE reset_expires < NOW()'
    );
  }

  async validatePassword(user, password) {
    return bcrypt.compare(password, user.jelszo);
  }

  async getAllUsers() {
    const [rows] = await this.db.execute('SELECT * FROM user');
    return rows;
  }

  async deleteUser(userId) {
    try {
      // Töröljük a felhasználó értékeléseit
      await this.db.execute('DELETE FROM ratings WHERE f_azonosito = ?', [userId]);
      
      // Töröljük a felhasználó rendeléseit (ha szükséges)
      // Először lekérjük a felhasználó email címét
      const [userRows] = await this.db.execute('SELECT email FROM user WHERE f_azonosito = ?', [userId]);
      if (userRows.length > 0) {
        const userEmail = userRows[0].email;
        
        // Lekérjük a vevo_id-t az email alapján
        const [vevoRows] = await this.db.execute('SELECT id FROM vevo WHERE email = ?', [userEmail]);
        if (vevoRows.length > 0) {
          const vevoId = vevoRows[0].id;
          
          // Töröljük a rendeléseket
          await this.db.execute('DELETE FROM rendeles WHERE vevo_id = ?', [vevoId]);
          
          // Töröljük a vevőt
          await this.db.execute('DELETE FROM vevo WHERE id = ?', [vevoId]);
        }
      }
      
      // Töröljük a felhasználót
      await this.db.execute('DELETE FROM user WHERE f_azonosito = ?', [userId]);
      
      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async updateUserCoupon(userId, couponCode) {
    const [result] = await this.db.execute(
      'UPDATE user SET kupon = ? WHERE f_azonosito = ?',
      [`15% kedvezmény: ${couponCode}`, userId]
    );
    return result.affectedRows > 0;
  }

  async updateUserCoupon(userId, couponCode, expiryDays = 30) {
    // Számítsuk ki a lejárati dátumot (alapértelmezetten 30 nap)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    const [result] = await this.db.execute(
      'UPDATE user SET kupon = ?, kupon_lejar = ? WHERE f_azonosito = ?',
      [`15% kedvezmény: ${couponCode}`, expiryDate, userId]
    );
    return result.affectedRows > 0;
  }
  
  // Adjunk hozzá egy új metódust az email kupon frissítéséhez lejárati idővel
  async updateUserEmailCoupon(userId, couponCode, expiryDays = 30) {
    // Számítsuk ki a lejárati dátumot (alapértelmezetten 30 nap)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    const [result] = await this.db.execute(
      'UPDATE user SET email_kupon = ?, email_kupon_lejar = ? WHERE f_azonosito = ?',
      [`15% kedvezmény: ${couponCode}`, expiryDate, userId]
    );
    return result.affectedRows > 0;
  }
  
  // Adjunk hozzá egy metódust a kuponok érvényességének ellenőrzéséhez
  async checkCouponValidity(userId) {
    const [rows] = await this.db.execute(
      'SELECT kupon, kupon_hasznalva, kupon_lejar, email_kupon, email_kupon_hasznalva, email_kupon_lejar FROM user WHERE f_azonosito = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return { regCoupon: false, emailCoupon: false };
    }
    
    const user = rows[0];
    const now = new Date();
    
    // Ellenőrizzük a regisztrációs kupon érvényességét
    const regCouponValid = user.kupon && 
                           !user.kupon_hasznalva && 
                           (!user.kupon_lejar || new Date(user.kupon_lejar) > now);
    
    // Ellenőrizzük az email kupon érvényességét
    const emailCouponValid = user.email_kupon && 
                             !user.email_kupon_hasznalva && 
                             (!user.email_kupon_lejar || new Date(user.email_kupon_lejar) > now);
    
    return { 
      regCoupon: regCouponValid, 
      emailCoupon: emailCouponValid 
    };
  }
  
  // Adjunk hozzá egy metódust a lejárt kuponok tisztításához
  async cleanupExpiredCoupons() {
    const now = new Date();
    
    // Töröljük a lejárt regisztrációs kuponokat
    await this.db.execute(
      'UPDATE user SET kupon = NULL, kupon_lejar = NULL WHERE kupon_lejar < ? AND kupon_hasznalva = 0',
      [now]
    );
    
    // Töröljük a lejárt email kuponokat
    await this.db.execute(
      'UPDATE user SET email_kupon = NULL, email_kupon_lejar = NULL WHERE email_kupon_lejar < ? AND email_kupon_hasznalva = 0',
      [now]
    );
  }

  async findUsersByIds(userIds) {
    try {
      const placeholders = userIds.map(() => '?').join(',');
      const [rows] = await this.db.execute(
        `SELECT f_azonosito, felhasznalonev, email FROM user WHERE f_azonosito IN (${placeholders})`,
        userIds
      );
      return rows;
    } catch (error) {
      console.error('Error finding users by ids:', error);
      throw error;
    }
  }
  
  async updateUserCoupon(userId, couponCode, expiryDate) {
    try {
      await this.db.execute(
        'UPDATE user SET kupon = ?, kupon_lejar = ?, kupon_hasznalva = 0 WHERE f_azonosito = ?',
        [`15% kedvezmény: ${couponCode}`, expiryDate, userId]
      );
      return true;
    } catch (error) {
      console.error('Error updating user coupon:', error);
      throw error;
    }
  }
}



export default UserModel;
