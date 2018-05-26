import express from 'express';
let router = express.Router();

import authController from '../controllers/auth-controller';

router.post('/signup', authController.signup);
router.post('/login', authController.login);

export default router ;