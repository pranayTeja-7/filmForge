
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
}