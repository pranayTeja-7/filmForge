import express from "express";
import { ProfileService } from "./profile.service.js";
import { ProfileController } from "./profile.controller.js";
import { profileSchema, rolesSchema } from "./profile.validation.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { prisma } from "../../infrastructure/prisma/prisma.module.js";
import authMiddleware from "../../middleware/auth.middleware.js";



const profileService = new ProfileService(prisma);
const profileController = new ProfileController(profileService);
const profileRouter = express.Router();

profileRouter.post("/", authMiddleware, validationMiddleware(profileSchema), profileController.createProfile);
profileRouter.post("/roles", authMiddleware, validationMiddleware(rolesSchema), profileController.createRoles);


export default profileRouter