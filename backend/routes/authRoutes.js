import express from 'express';
import { loginUser, registerUser, googleAuth } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/google', googleAuth);

export default router;
