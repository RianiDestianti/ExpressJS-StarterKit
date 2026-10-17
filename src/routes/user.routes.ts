import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import ProfileController from "../controllers/user/profile.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const user = Router()

const authController        = new AuthController()
const profileController     = new ProfileController()

user.post('/login', authController.login)
user.post('/register', authController.register)
user.post('/verify', authController.verify)
user.post('/retry-code', authController.retryCode)
user.post('/reset-password', authController.resetPassword)

user.get('/check-auth', authMiddleware, profileController.getProfile)
user.post('/profile/action', authMiddleware, profileController.action)

export default user
