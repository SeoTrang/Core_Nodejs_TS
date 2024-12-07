import { Router, Request, Response } from 'express';
import authController from 'src/controllers/auth.controller';

const router = Router();

router.post('/register',authController.register);
router.post('/login',authController.login);
router.post('/forgot-password',authController.forgotPassword);


//verify email
router.post('/send-email',authController.sendEmail)
router.post('/verify-email',authController.verifyEmail);

export default router;