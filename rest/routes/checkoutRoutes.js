import express from 'express';
import checkoutController from '../controllers/checkoutController.js';

const router = express.Router();

router.get('/products', checkoutController.listProducts);
router.get('/products/:id', checkoutController.getProductById);
router.get('/orders', checkoutController.listOrders);
router.post('/', checkoutController.checkout);

export default router;
