import emailService from '../config/email.js';

class AuthController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async register(req, res) {
    const { name, email, password } = req.body;
    
    try {
      const existingEmail = await this.userModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Ez az email már regisztrálva van a rendszerben.' });
      }
      
      const existingUsername = await this.userModel.findByUsername(name);
      if (existingUsername) {
        return res.status(400).json({ error: 'Ez a felhasználónév már foglalt.' });
      }
      
      if (email.split('@').length !== 2) {
        return res.status(400).json({ error: 'Az email cím formátuma nem megfelelő!' });
      }
      
      if (password.length < 6 || !/[A-Z]/.test(password)) {
        return res.status(400).json({ error: 'A jelszónak legalább 6 karakterből kell állnia és tartalmaznia kell legalább egy nagybetűt!' })
      }
  
      const user = await this.userModel.create({ name, email, password })
  
      const msg = {
        to: email,
        from: {
          name: 'Adali Clothing',
          email: 'adaliclothing@gmail.com'
        },
        subject: 'Sikeres regisztráció - Adali Clothing',
        html: `
          <h2>Kedves ${name}!</h2>
          <p>Köszönjük, hogy regisztráltál az Adali Clothing oldalán!</p>
          <p>Sikeres regisztrációdat ezúton visszaigazoljuk.</p>
          <p>Üdvözlettel,<br>Az Adali Clothing csapata</p>
        `
      }
  
      try {
        await emailService.send(msg);
        console.log('Registration confirmation email sent successfully')
      } catch (emailError) {
        console.error('Email sending error:', emailError.response?.body)     
      }
  
      res.status(201).json({
        message: 'Sikeres regisztráció!',
        user: {
          username: user.username,
          email: user.email,
          f_azonosito: user.f_azonosito
        }
      })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({ error: 'Adatbázis hiba!' })
    }
  }
      
  async login(req, res) {
      const { email, password } = req.body
         
      try {
        const user = await this.userModel.findByEmail(email)
        if (!user) {
          return res.status(401).json({
            error: 'Hibás email vagy jelszó!',
            errorType: 'invalid_credentials'
          })
        }
        const isPasswordValid = await this.userModel.validatePassword(user, password)
             
        if (!isPasswordValid) {
          return res.status(401).json({
            error: 'Hibás email vagy jelszó!',
            errorType: 'invalid_credentials'
          })
        }
        return res.json({
          success: true,
          message: 'Sikeres bejelentkezés!',
          user: {
            username: user.felhasznalonev,
            email: user.email,
            f_azonosito: user.f_azonosito
            }
        })
      } catch (error) {
        console.error('Server error:', error)
        return res.status(500).json({
          error: 'Szerver hiba!',
          errorType: 'server_error'
        })
      }
    }
    
    async forgotPassword(req, res) {
      const { email } = req.body
         
      try {
                 
        const user = await this.userModel.findByEmail(email)
        if (!user) {
          return res.status(404).json({
            error: 'Nem található felhasználó ezzel az email címmel.',
            errorType: 'user_not_found'
          })
        }
        await this.userModel.cleanupExpiredTokens()
                      
        const resetToken = await this.userModel.createResetToken(email)
        const msg = {
          to: email,
          from: {
            name: 'Adali Clothing',
            email: 'adaliclothing@gmail.com'
          },
          subject: 'Jelszó visszaállítás - Adali Clothing',
          html: `
            <h2>Jelszó visszaállítás</h2>
            <p>A jelszavad visszaállításához kattints az alábbi linkre:</p>
            <a href="https://adaliclothing.vercel.app/reset-password/${resetToken}">Jelszó visszaállítása</a>
            <p>Ez a link 1 óráig érvényes.</p>
            <p>Ha nem te kérted a jelszó visszaállítását, hagyd figyelmen kívül ezt az emailt.</p>
            <p>Üdvözlettel,<br>Az Adali Clothing csapata</p>
          `
        }
        try {
          await emailService.send(msg)
          console.log('Password reset email sent successfully')
          res.json({
            success: true,
            message: 'A jelszó visszaállítási email elküldve.'
          })
        } catch (emailError) {
          console.error('Email sending error:', emailError.response?.body)
          res.status(500).json({
            error: 'Nem sikerült elküldeni a jelszó visszaállítási emailt.',
            errorType: 'email_error'
          })
        }
      } catch (error) {
        console.error('Forgot password error:', error)
        res.status(500).json({
          error: 'Szerver hiba történt.',
          errorType: 'server_error'
        })
      }
    }
    
    async resetPassword(req, res) {
      console.log('Reset password request received')
      console.log('Request body:', req.body)
         
      const { token, newPassword } = req.body
         
      if (!token || !newPassword) {
        console.log('Missing token or password')
        return res.status(400).json({
          error: 'Hiányzó token vagy jelszó.',
          errorType: 'missing_data'
        })
      }
         
      try {
                 
        const user = await this.userModel.findByResetToken(token)
             
        console.log('Token exists in database:', !!user)
             
        if (!user) {
          return res.status(400).json({
            error: 'Érvénytelen jelszó-visszaállítási token.',
            errorType: 'invalid_token'
          })
        }
                        
        const validUser = await this.userModel.findValidResetToken(token)
             
        console.log('Token is valid and not expired:', !!validUser)
             
        if (!validUser) {
          console.log('Token expired at:', user.reset_expires)
          console.log('Current time:', new Date())
                 
          return res.status(400).json({
            error: 'Lejárt jelszó-visszaállítási token.',
            errorType: 'expired_token'
          })
        }
                        
        if (newPassword.length < 6 || !/[A-Z]/.test(newPassword)) {
          console.log('Invalid password format')
          return res.status(400).json({
            error: 'A jelszónak legalább 6 karakterből kell állnia és tartalmaznia kell legalább egy nagybetűt!',
            errorType: 'invalid_password'
          })
        }
                      
        await this.userModel.resetPasswordWithToken(token, newPassword)
             
        console.log('Password successfully updated for user:', validUser.felhasznalonev)
             
        res.json({
          success: true,
          message: 'A jelszó sikeresen frissítve.'
        })
      } catch (error) {
        console.error('Reset password error:', error)
        res.status(500).json({
          error: 'Szerver hiba történt.',
          errorType: 'server_error'
        })
      }
    }
    
    async markCouponAsUsed(req, res) {
      const { email } = req.body;
               
      try {
        await this.userModel.markCouponAsUsed(email);
                   
        res.json({
          success: true,
          message: 'Kupon sikeresen felhasználva'
        });
      } catch (error) {
        console.error('Coupon usage marking error:', error);
        res.status(500).json({ error: 'Kupon használat jelzési hiba' });
      }
    }
    
    async updateCoupon(req, res) {
      const { email, coupon } = req.body
         
      try {
        await this.userModel.updateCoupon(email, coupon)
             
        res.json({
          success: true,
          message: 'Kupon sikeresen elmentve'
        })
      } catch (error) {
        console.error('Coupon update error:', error)
        res.status(500).json({ error: 'Kupon mentési hiba' })
      }
    }
}

export default AuthController
