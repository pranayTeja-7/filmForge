import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { ProfileType,RolesType } from "./profile.validation.js";
import { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../errors/app.error.js";
import type { PortfolioItemSchemaType } from "./profile.validation.js";


export class ProfileService {

    constructor(private prisma:PrismaService){}
    async createProfile(userId:string, reqBody:ProfileType){
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

    async createRoles(userId:string, reqBody:RolesType){

        const profile = await this.prisma.profile.findUnique({
            where : {
                userId: userId
            }
        })

        if(!profile){
            throw new AppError(
                404,
                "PROFILE_NOT_FOUND",
                "Profile not found. Please complete the about you step first"
            )
        }

        const roles = await this.prisma.role.findMany({
            where: {
                id: {
                    in: reqBody.roleIds
                }
            }
        })

        if(roles.length !== reqBody.roleIds.length){
            throw new AppError(
                400,
                "INVALID_ROLE_IDS",
                "One or more roleIds are invalid"
            )
        }

        const data = roles.map((role) => {
            return {
                profileId: profile.id,
                roleId: role.id
            }
        })


        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const updatedData = await tx.profile.updateManyAndReturn({
                    where: {
                        id: profile.id,
                        onboardingStatus: "ROLES"
                    },
                    data:{
                        onboardingStatus: "PORTFOLIO"
                    }
                })

                if(updatedData.length === 0){
                    throw new AppError(
                        409,
                        "ROLES_ALREADY_EXIST",
                        "Profile roles for this profile already exist"
                    )
                }

                const profileRoles = await tx.profileRole.createManyAndReturn({
                    data: data
                })

                const onboardingStatus = updatedData[0]?.onboardingStatus
                return {profileRoles, onboardingStatus}
            })

            const {profileRoles, onboardingStatus} = result;
            
            return {
                profileRoles,
                onboardingStatus
            }
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
                throw new AppError(
                    409,
                    "ROLES_ALREADY_EXIST",
                    "Profile roles for this profile already exist"
                )
            }
            throw error
        }
    }

    async getPortfolioItems(userId:string){
        const profile = await this.prisma.profile.findUnique({
            where : {
                userId: userId       
            },
            select: {
                id: true,
                onboardingStatus: true,
            }
        })

        if(!profile){
            throw new AppError(
                404,
                "PROFILE_NOT_FOUND",
                "Profile not found. Please complete the about you step first"
            )
        }

        if(profile.onboardingStatus === "ROLES"){
            throw new AppError(
                403,
                "ROLES_REQUIRED",
                "Profile roles not found. Please complete the roles step before accessing or managing portfolio"
            )
        }
        const portfolioItems = await this.prisma.portfolioItem.findMany({
            where: {
                profileId: profile.id
            }
        })

        return portfolioItems;
    }


    async createPortfolioItem(userId:string, reqBody:PortfolioItemSchemaType){
        
        const profile = await this.prisma.profile.findUnique({
            where: {
                userId,
            },
            select: {
                id: true,
                onboardingStatus: true
            }
        });

        if(!profile){
            throw new AppError(
                404,
                "PROFILE_NOT_FOUND",
                "Profile not found. Please complete the about you step first"
            )
        };

        if(profile.onboardingStatus === "ROLES"){
            throw new AppError(
                409,
                "INVALID_ONBOARDING_STATUS",
                "Please complete the roles step before managing portfolio"
            )
        }

        const existingPortfolioItemsCount = await this.prisma.portfolioItem.count({
            where: {
                profileId: profile.id
            }
        })

        if (existingPortfolioItemsCount >= 10){
            throw new AppError(
                409,
                "MAXIMUM_PORTFOLIO_ITEMS_LIMIT_REACHED",
                "Maximum portfolio items limit has been reached."
            )
        }

        const portfolioItem = await this.prisma.portfolioItem.create({
            data: {
                profileId: profile.id,
                title: reqBody.title,
                type: reqBody.type,
                customType: reqBody.customType ?? null,
                description: reqBody.description ?? null,
                externalUrl: reqBody.externalUrl ?? null,
            },
            omit: {
                updatedAt: true,
                createdAt: true,
                profileId: true,
            }
        })

        return portfolioItem;
    }

    async updatePortfolioItem (userId:string, itemId:string, reqBody:PortfolioItemSchemaType){
        const profile = await this.prisma.profile.findUnique({
            where: {
                userId,
            }
        })

        if(!profile){
            throw new AppError(
                404,
                "PROFILE_NOT_FOUND",
                "Profile not found. Please complete the about you step first"
            )
        };

        try {
            const updatedPortfolioItem = await this.prisma.portfolioItem.update({
                where: {
                    id: itemId,
                    profileId: profile.id
                },
                data: {
                    title: reqBody.title,
                    type: reqBody.type,
                    customType: reqBody.customType ?? null,
                    description: reqBody.description ?? null,
                    externalUrl: reqBody.externalUrl ?? null,
                }
            })

            return updatedPortfolioItem
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"){
                throw new AppError(
                    404,
                    "PORTFOLIO_ITEM_NOT_FOUND",
                    "Portfolio item not found"
                )
            }
            throw error;
        }
    }

    
    async deletePortfolioItem (userId:string, itemId:string) {
        const profile = await this.prisma.profile.findUnique({
            where: {
                userId,
            }
        })

        if(!profile){
            throw new AppError(
                404,
                "PROFILE_NOT_FOUND",
                "Profile not found. Please complete the about you step first"
            )
        }

        try {
            await this.prisma.portfolioItem.delete({
                where: {
                    id: itemId,
                    profileId: profile.id
                }
            })

        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"){
                throw new AppError(
                    404,
                    "PORTFOLIO_ITEM_NOT_FOUND",
                    "Portfolio item not found"
                )
            };

            throw error;
        }
    }

    async completeProfile(userId:string){
        const profile = await this.prisma.profile.findUnique({
            where: {
                userId: userId,
            }
        })

        if(!profile){
            throw new AppError(
                404,
                "PROFILE_NOT_FOUND",
                "Profile not found. Please complete the about you step first"
            )
        }

        if(profile.onboardingStatus === "COMPLETED"){
            return;
        }

        if(profile.onboardingStatus === "ROLES"){
            throw new AppError(
                409,
                "INVALID_ONBOARDING_STATUS",
                "Please complete the roles step."
            )
        }

        await this.prisma.profile.update({
            where: {
                id: profile.id,
            },
            data: {
                onboardingStatus: "COMPLETED"
            }
        })
    }
}