import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { profileType } from "./profile.validation.js";
import { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../errors/app.error.js";


export class ProfileService {

    constructor(private prisma:PrismaService){}
    async createProfile(userId:string, reqBody:profileType){
        try {
            const profile = await this.prisma.profile.create({
                data: {
                    userId: userId,
                    displayName: reqBody.displayName,
                    bio: reqBody.bio ?? null,
                    experience: reqBody.experience ?? null,
                    location: reqBody.location ?? null,
                    onboardingStatus: "ROLES",
                }
            })
            return profile
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
                throw new AppError(
                    409,
                    "PROFILE_ALREADY_EXISTS",
                    "Profile for this user already exists",
                )
            }
            throw error;
        }
    }
}