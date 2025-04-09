class UserController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async getAllUsers(req, res) {
    try {
      const users = await this.userModel.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      await this.userModel.deleteUser(userId);
      
      res.json({ 
        message: 'Felhasználó sikeresen törölve',
        deletedUser: true
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Hiba a felhasználó törlése során' });
    }
  }

  async checkUser(req, res) {
    try {
      const username = req.params.username;
      const user = await this.userModel.findByUsername(username);
      
      if (!user) {
        return res.json({ exists: false });
      }
      
      res.json({ exists: true, email: user.email });
    } catch (error) {
      console.error('Error checking user:', error);
      res.status(500).json({ error: 'Adatbázis hiba' });
    }
  }

  async getProfileImage(req, res) {
    try {
      const username = req.params.username;
      
      if (!username) {
        return res.status(400).json({ 
          success: false, 
          message: 'Hiányzó felhasználónév' 
        });
      }
      
   
      const user = await this.userModel.findByUsername(username);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Felhasználó nem található' 
        });
      }
      
   
      if (!user.profile_image) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nincs profilkép' 
        });
      }
      
     
      res.json({ 
        success: true, 
        profileImage: user.profile_image 
      });
    } catch (error) {
      console.error('Hiba a profilkép lekérése során:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Szerver hiba történt a kép lekérése során' 
      });
    }
  }
  
  async uploadProfileImage(req, res) {
    try {
      const { username, imageData } = req.body;
      
      if (!username || !imageData) {
        return res.status(400).json({ 
          success: false, 
          message: 'Hiányzó felhasználónév vagy kép adat' 
        });
      }
      
   
      const user = await this.userModel.findByUsername(username);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Felhasználó nem található' 
        });
      }
      
    
      await this.userModel.saveProfileImage(username, imageData);
      
      res.json({ 
        success: true, 
        message: 'Profilkép sikeresen feltöltve' 
      });
    } catch (error) {
      console.error('Hiba a profilkép feltöltése során:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Szerver hiba történt a kép feltöltése során' 
      });
    }
  }
}

export default UserController;
