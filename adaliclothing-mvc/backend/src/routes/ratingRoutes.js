import express from 'express';

const router = express.Router();

export default (ratingController) => {
  router.get('/get-all-ratings', ratingController.getAllRatings.bind(ratingController));
  router.post('/save-rating', ratingController.saveRating.bind(ratingController));
  router.post('/add-rating', ratingController.addRating.bind(ratingController));
  router.put('/update-rating/:id', ratingController.updateRating.bind(ratingController));
  router.delete('/delete-rating/:id', ratingController.deleteRating.bind(ratingController));
  

  router.get('/admin/all-user-ratings', ratingController.getAllUserRatings.bind(ratingController));
  router.post('/admin/add-user-rating', ratingController.addUserRating.bind(ratingController));
  router.put('/admin/update-user-rating/:id', ratingController.updateUserRating.bind(ratingController));
  router.delete('/admin/delete-user-rating/:id', ratingController.deleteUserRating.bind(ratingController));
  

  router.get('/user-id/:username', ratingController.getUserIdByUsername.bind(ratingController));
  router.get('/user-ratings/:userId', ratingController.getUserRatings.bind(ratingController));
  router.post('/add-user-rating', ratingController.addUserRating.bind(ratingController));
  router.post('/order-feedback', ratingController.orderFeedback.bind(ratingController));



  return router;
};
