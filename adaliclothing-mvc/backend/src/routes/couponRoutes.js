import express from 'express';

export default (couponController) => {
  const router = express.Router();
  
  router.post('/send-coupons', (req, res) => couponController.sendCouponsToAllUsers(req, res));
  router.post('/send-selected', (req, res) => couponController.sendCouponsToSelectedUsers(req, res));
  router.get('/user-coupons/:userId', (req, res) => couponController.getUserCoupons(req, res));
  router.post('/mark-coupon-used', (req, res) => couponController.markCouponAsUsed(req, res));
  router.post('/mark-email-coupon-used', (req, res) => couponController.markEmailCouponAsUsed(req, res));
  router.post('/update-coupon', (req, res) => couponController.updateCoupon(req, res));
  router.post('/save-wheel-prize', (req, res) => couponController.saveWheelPrize(req, res));
  router.post('/validate-coupon', (req, res) => couponController.validateCoupon(req, res));
  router.get('/stats', (req, res) => couponController.getCouponStats(req, res));
  router.get('/history', (req, res) => couponController.getCouponHistory(req, res));
  router.post('/save-wheel-prize', (req, res) => couponController.saveWheelPrize(req, res));
  router.post('/validate-coupon', (req, res) => couponController.validateCoupon(req, res)); 
  router.get('/check-coupon/:code', (req, res) => couponController.checkCouponInDatabase(req, res));
  router.delete('/delete-used', (req, res) => couponController.deleteAllUsedCoupons(req, res));
  router.delete('/:id', (req, res) => couponController.deleteCoupon(req, res));
  

  router.get('/user-coupons/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;

      const coupons = await db.query('SELECT * FROM coupons WHERE user_id = ?', [userId]);
      
      if (coupons.length === 0) {
        return res.json([]); 
      }
      
      res.json(coupons);
    } catch (error) {
      console.error('Error fetching user coupons:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });
  
  return router;
};