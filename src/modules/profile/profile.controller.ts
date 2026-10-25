
import { AppError } from "../../errors/app.error.js";
import { ProfileService } from "./profile.service.js"
import type { NextFunction, Request, Response } from "express"
export class ProfileController {
    constructor(private profileService:ProfileService){}
    createProfile = async (req:Request, res:Response, next:NextFunction) => {
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(
                401,
                "UNAUTHENTICATED",
                "Authentication required. Please login"
            )
        }
        const reqBody = req.body;
        const profile = await this.profileService.createProfile(userId, reqBody)

        res.status(201).json({
            message: "Profile created successfully",
            profile
        })
    }

    createRoles = async (req:Request, res:Response, next:NextFunction) => {
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(
                401,
                "UNAUTHENTICATED",
                "Authentication required. Please login"
            )
        }
        const reqBody = req.body;
        const {profileRoles, onboardingStatus} = await this.profileService.createRoles(userId, reqBody);

        res.status(201).json({
            message: "Roles created successfully",
            profileRoles,
            onboardingStatus,
        })
        
    }

    getPortfolioItems = async (req:Request, res:Response, next:NextFunction) => {
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(
                401,
                "UNAUTHENTICATED",
                "Authentication required. Please login"
            )
        }
        const portfolioItems = await this.profileService.getPortfolioItems(userId)

        res.status(200).json({
            message: "Portfolio items fetched successfully",
            portfolioItems,
        })
    }

    createPortfolioItem = async (req:Request, res:Response, next:NextFunction) => {
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(
                401,
                "UNAUTHENTICATED",
                "Authentication required. Please login"
            )
        }
        const reqBody = req.body;

        const portfolioItem = await this.profileService.createPortfolioItem(userId, reqBody);

        res.status(201).json({
            message: "Portfolio item saved successfully",
            portfolioItem,
        })
    }


    updatePortfolioItem = async (req:Request<{id:string}>, res:Response, next:NextFunction) => {
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(
                401,
                "UNAUTHENTICATED",
                "Authentication required. Please login"
            )
        }

        const itemId = req.params.id
        
        const reqBody = req.body

        const updatedPortfolioItem = await this.profileService.updatePortfolioItem(userId, itemId, reqBody)
        
        res.status(200).json({
            message: "Portfolio item updated successfully",
            updatedPortfolioItem,
        })
    }

    deletePortfolioItem = async (req:Request<{id:string}>, res:Response, next:NextFunction) => {
        const userId = req.user?.id;
        if(!userId){
            throw new AppError(
                401,
                "UNAUTHENTICATED",
                "Authentication required. Please login"
            )
        }

        const itemId = req.params.id;

        await this.profileService.deletePortfolioItem(userId, itemId)

        res.status(200).json({
            message: "Portfolio item deleted successfully"
        })
    }

    completeProfile = async (req:Request, res:Response, next:NextFunction) => {
        const userId = req.user?.id
        if(!userId){
            throw new AppError(
                401,
                "UNAUTHENTICATED",
                "Authentication required. Please login"
            )
        }

        await this.profileService.completeProfile(userId);

        res.status(200).json({
            message: "Profile completed successfully"
        })
    }

}