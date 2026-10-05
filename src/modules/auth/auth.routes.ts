import { Router } from "express";
import { prisma } from "../../infrastructure/prisma/prisma.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { signupSchema, loginSchema } from "./auth.validation.js";
import { TokenService } from "../../infrastructure/auth/token.service.js";

const authRouter = Router();
const tokenService = new TokenService()
const authService = new AuthService(prisma, tokenService);
const authController = new AuthController(authService);

authRouter.post("/signup", validationMiddleware(signupSchema), authController.signup);
authRouter.post("/login", validationMiddleware(loginSchema), authController.login);


export default authRouter;