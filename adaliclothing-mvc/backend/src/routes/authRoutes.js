import express from 'express';

const router = express.Router();

export default (authController) => {
  
  router.post('/register', authController.register.bind(authController));
  
  
  router.post('/login', authController.login.bind(authController));
  
 
  router.post('/forgot-password', authController.forgotPassword.bind(authController));
  

  router.post('/reset-password', authController.resetPassword.bind(authController));
  
  
  router.post('/update-coupon', authController.updateCoupon.bind(authController));
  

  router.post('/mark-coupon-used', authController.markCouponAsUsed.bind(authController));


  return router;
};
