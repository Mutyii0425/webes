import express from 'express';

export default (orderController) => {
  const router = express.Router();

  router.post('/vevo/create', orderController.createCustomer.bind(orderController));
  
 
  router.post('/orders/create', orderController.createOrder.bind(orderController));
  

  router.get('/api/order-stats/:userId', orderController.getOrderStats.bind(orderController));
  
  
  router.post('/api/update-order-stats', orderController.updateOrderStats.bind(orderController));
  
  
  router.post('/send-confirmation', orderController.sendConfirmation.bind(orderController));

 
  router.post('/api/orders/create', (req, res) => orderController.createOrder(req, res));


  router.get('/api/orders', orderController.getAllOrders.bind(orderController));


  router.get('/api/customers/:id', orderController.getCustomerById.bind(orderController));


  router.put('/api/orders/:id/status', orderController.updateOrderStatus.bind(orderController));


  router.get('/api/orders/statistics', orderController.getOrderStatistics.bind(orderController));
  

  router.delete('/api/orders', orderController.deleteAllOrders.bind(orderController));


  return router;
};
