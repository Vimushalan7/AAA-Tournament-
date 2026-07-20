import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment, requestWithdrawal } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkBanned } from '../middlewares/banCheckMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(checkBanned);

router.post('/razorpay-order', createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);
router.post('/withdraw', requestWithdrawal);

export default router;
