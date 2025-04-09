class RatingModel {
  constructor(db) {
    this.db = db;
  }

  async getAllRatings() {
    const [rows] = await this.db.execute(`
      SELECT r.rating_id, r.rating, r.date, r.velemeny, u.felhasznalonev 
      FROM ratings r 
      JOIN user u ON r.f_azonosito = u.f_azonosito 
      ORDER BY r.date DESC
    `);
    return rows;
  }

  async createRating(ratingData) {
    try {
      const { userId, rating, velemeny } = ratingData;
      
      await this.db.execute(
        'INSERT INTO ratings (f_azonosito, rating, velemeny) VALUES (?, ?, ?)',
        [userId, rating, velemeny]
      );
    } catch (error) {
      console.error('Error in createRating:', error);
      throw error;
    }
  }

  async updateRating(ratingId, ratingData) {
    const { rating, velemeny } = ratingData;
    
    await this.db.execute(
      'UPDATE ratings SET rating = ?, velemeny = ? WHERE rating_id = ?',
      [rating, velemeny, ratingId]
    );
  }

  async deleteRating(ratingId) {
    await this.db.execute('DELETE FROM ratings WHERE rating_id = ?', [ratingId]);
  }

  async getUserIdByEmail(email) {
    const [rows] = await this.db.execute('SELECT f_azonosito FROM user WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0].f_azonosito : null;
  }

  async getUserIdByUsername(username) {
    try {
      console.log('Looking up user ID for username:', username);
      
      const [rows] = await this.db.execute(
        'SELECT f_azonosito FROM user WHERE felhasznalonev = ?',
        [username]
      );
      
      console.log('Query result:', rows);
      
      if (rows.length === 0) {
        console.log('No user found with username:', username);
        return null;
      }
      
      console.log('Found user ID:', rows[0].f_azonosito, 'for username:', username);
      return rows[0].f_azonosito;
    } catch (error) {
      console.error('Error in getUserIdByUsername:', error);
      throw error;
    }
  }

  
  async checkRatedUserColumn() {
    try {
      const [columns] = await this.db.execute(`
        SHOW COLUMNS FROM ratings LIKE 'rated_user_id'
      `);
      return columns.length > 0;
    } catch (error) {
      console.error('Error checking rated_user_id column:', error);
      return false;
    }
  }

  async createUserRating(ratingData) {
    try {
      const { raterUserId, ratedUserId, rating, velemeny } = ratingData;
      console.log('Creating user rating with data:', { raterUserId, ratedUserId, rating, velemeny });
      
      await this.db.execute(
        'INSERT INTO user_ratings (rater_user_id, rated_user_id, rating, velemeny) VALUES (?, ?, ?, ?)',
        [raterUserId, ratedUserId, rating, velemeny]
      );
    } catch (error) {
      console.error('Error in createUserRating:', error.message, error.stack);
      throw error;
    }
  }

  async getUserRating(raterUserId, ratedUserId) {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM user_ratings WHERE rater_user_id = ? AND rated_user_id = ?',
        [raterUserId, ratedUserId]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getUserRating:', error);
      throw error;
    }
  }
  
  
  async createUserRating(ratingData) {
    try {
      const { raterUserId, ratedUserId, rating, velemeny } = ratingData;
      
      await this.db.execute(
        'INSERT INTO user_ratings (rater_user_id, rated_user_id, rating, velemeny) VALUES (?, ?, ?, ?)',
        [raterUserId, ratedUserId, rating, velemeny]
      );
    } catch (error) {
      console.error('Error in createUserRating:', error);
      throw error;
    }
  }
  
  async updateUserRating(ratingId, ratingData) {
    const { rating, velemeny } = ratingData;
    
    await this.db.execute(
      'UPDATE user_ratings SET rating = ?, velemeny = ? WHERE rating_id = ?',
      [rating, velemeny, ratingId]
    );
  }
  
  async getUserRatings(userId) {
    try {
      const [rows] = await this.db.execute(`
        SELECT 
          ur.rating_id, 
          ur.rating, 
          ur.date, 
          ur.velemeny, 
          rater.felhasznalonev as rater_username, 
          rater.profile_image as rater_profile_image,
          ur.rater_user_id
        FROM user_ratings ur 
        JOIN user rater ON ur.rater_user_id = rater.f_azonosito 
        WHERE ur.rated_user_id = ?
        ORDER BY ur.date DESC
      `, [userId]);
      
   
      let avgRating = 0;
      if (rows.length > 0) {
        const sum = rows.reduce((total, row) => total + row.rating, 0);
        avgRating = sum / rows.length;
      }
      
      return {
        success: true,
        ratings: rows,
        count: rows.length,
        avgRating
      };
    } catch (error) {
      console.error('Error in getUserRatings:', error);
      throw error;
    }
  }

  async getAllUserRatings() {
    try {
      const [rows] = await this.db.execute(`
        SELECT 
          ur.rating_id, 
          ur.rating, 
          ur.date, 
          ur.velemeny, 
          rater.felhasznalonev as rater_username, 
          rated.felhasznalonev as rated_username,
          ur.rater_user_id,
          ur.rated_user_id
        FROM user_ratings ur 
        JOIN user rater ON ur.rater_user_id = rater.f_azonosito 
        JOIN user rated ON ur.rated_user_id = rated.f_azonosito 
        ORDER BY ur.date DESC
      `);
      return rows;
    } catch (error) {
      console.error('Error in getAllUserRatings:', error);
      throw error;
    }
  }
  
  async createUserRating(ratingData) {
    try {
      const { raterUserId, ratedUserId, rating, velemeny } = ratingData;
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      await this.db.execute(
        'INSERT INTO user_ratings (rater_user_id, rated_user_id, rating, velemeny, date) VALUES (?, ?, ?, ?, ?)',
        [raterUserId, ratedUserId, rating, velemeny, currentDate]
      );
    } catch (error) {
      console.error('Error in createUserRating:', error);
      throw error;
    }
  }

  async updateUserRating(ratingId, ratingData) {
    const { rating, velemeny } = ratingData;
    
    await this.db.execute(
      'UPDATE user_ratings SET rating = ?, velemeny = ? WHERE rating_id = ?',
      [rating, velemeny, ratingId]
    );
  }
  
  async deleteUserRating(ratingId) {
    await this.db.execute('DELETE FROM user_ratings WHERE rating_id = ?', [ratingId]);
  }

}



export default RatingModel;
