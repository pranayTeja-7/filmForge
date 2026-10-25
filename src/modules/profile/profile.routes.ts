import express from "express";
import { ProfileService } from "./profile.service.js";
import { ProfileController } from "./profile.controller.js";
import { profileSchema, rolesSchema, portfolioItemSchema, portfolioItemParamsSchema } from "./profile.validation.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";
import { prisma } from "../../infrastructure/prisma/prisma.module.js";
import authMiddleware from "../../middleware/auth.middleware.js";



const profileService = new ProfileService(prisma);
const profileController = new ProfileController(profileService);
const profileRouter = express.Router();

profileRouter.post("/", authMiddleware, validationMiddleware(profileSchema, "body"), profileController.createProfile);
profileRouter.post("/roles", authMiddleware, validationMiddleware(rolesSchema, "body"), profileController.createRoles);
profileRouter.get("/portfolio-items", authMiddleware, profileController.getPortfolioItems)

profileRouter.post(
    "/portfolio-item", 
    authMiddleware, 
    validationMiddleware(portfolioItemSchema, "body"), 
    profileController.createPortfolioItem
)

profileRouter.put(
    "/portfolio-item/:id", 
    authMiddleware, 
    validationMiddleware(portfolioItemParamsSchema, "params"), 
    validationMiddleware(portfolioItemSchema, "body"), 
    profileController.updatePortfolioItem
)

profileRouter.delete(
    "/portfolio-item/:id",
    authMiddleware,
    validationMiddleware(portfolioItemParamsSchema, "params"),
    profileController.deletePortfolioItem
)

profileRouter.post("/complete-profile", authMiddleware, profileController.completeProfile)

export default profileRouter