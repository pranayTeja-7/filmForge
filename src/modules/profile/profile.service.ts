import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { ProfileType,RolesType } from "./profile.validation.js";
import { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../errors/app.error.js";


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
                        "ROLES_ALDREADY_EXIST",
                        "Profile roles for this profile aldready exist"
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
                    "ROLES_ALDREADY_EXIST",
                    "Profile roles for this profile aldready exist"
                )
            }
            throw error
        }
    }
}